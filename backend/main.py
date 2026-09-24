from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import letter_engine
import psycopg2
import os
import time
import random
import math
from dotenv import load_dotenv
from datetime import datetime
import base64
from fastapi import UploadFile
from fastapi import HTTPException


load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

traffic = letter_engine.TrafficService()

LOCATIONS = {
    "Mukul": (28.653035244938376, 77.18495744899086),
    "Chandhini": (28.266865388908272, 77.0658879353592),
}

DEFAULT_HOLDER = "Mukul"  # who starts out able to send first
RESET_HOURS = 48

WALKING_SPEED_MPS = 1.4  # average human walking speed, ~5 km/h
ROUTE_INEFFICIENCY_FACTOR = 1.35  # tuned to roughly match your real 12h walk
PICKUP_DELAY_RANGE = (7200, 10800)  # seconds, simulates mail being collected from a dropbox

DATABASE_URL = os.environ["DATABASE_URL"]

def get_db():
    return psycopg2.connect(DATABASE_URL)

def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS letters (
            id SERIAL PRIMARY KEY,
            sender TEXT,
            receiver TEXT,
            content TEXT,
            sent_at DOUBLE PRECISION,
            picked_up_at DOUBLE PRECISION,
            deliver_at DOUBLE PRECISION
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

init_db()

def haversine_meters(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))

def get_walking_time_seconds(sender: str, receiver: str) -> int:
    if sender not in LOCATIONS or receiver not in LOCATIONS:
        return traffic.get_travel_time_seconds(sender, receiver)  # fallback

    lat1, lon1 = LOCATIONS[sender]
    lat2, lon2 = LOCATIONS[receiver]
    distance_m = haversine_meters(lat1, lon1, lat2, lon2) * ROUTE_INEFFICIENCY_FACTOR
    return int(distance_m / WALKING_SPEED_MPS)

@app.post("/send")
def send_letter(sender: str, receiver: str, content: str, stamp_index: int = 0):
    status = compute_duck_status()
    if status["in_transit"] or status["holder"] != sender:
        raise HTTPException(status_code=403, detail="It's not your turn to send yet.")

    now = time.time()
    pickup_delay = random.randint(*PICKUP_DELAY_RANGE)
    picked_up_at = now + pickup_delay
    walk_seconds = get_walking_time_seconds(sender, receiver)
    deliver_at = picked_up_at + walk_seconds

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO letters (sender, receiver, content, sent_at, picked_up_at, deliver_at, stamp_index) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
        (sender, receiver, content, now, picked_up_at, deliver_at, stamp_index),
    )
    letter_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {"id": letter_id, "pickup_seconds": pickup_delay, "walk_seconds": walk_seconds, "status": "sent"}

@app.get("/letters")
def get_letters(viewer: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, sender, receiver, content, sent_at, picked_up_at, deliver_at FROM letters WHERE sender = %s OR receiver = %s ORDER BY id",
        (viewer, viewer),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    now = time.time()
    result = []
    for id_, sender, receiver, content, sent_at, picked_up_at, deliver_at in rows:
        delivered = now >= deliver_at
        picked_up = now >= picked_up_at

        sent_date = datetime.fromtimestamp(sent_at).strftime("%d/%m/%Y")

        if sender == viewer:
            status = "Delivered" if delivered else ("In Transit" if picked_up else "Pending Pickup")
            result.append({"id": id_, "sender": sender, "receiver": receiver, "content": content, "status": status, "date": sent_date})
        elif delivered:
            result.append({"id": id_, "sender": sender, "receiver": receiver, "content": content, "status": "Delivered", "date": sent_date})

    return result

@app.get("/track")
def track_letters(viewer: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, sender, receiver, picked_up_at, deliver_at FROM letters WHERE sender = %s OR receiver = %s ORDER BY id",
        (viewer, viewer),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    now = time.time()
    result = []
    for id_, sender, receiver, picked_up_at, deliver_at in rows:
        if now >= deliver_at:
            continue  # already delivered, nothing to track

        if sender not in LOCATIONS or receiver not in LOCATIONS:
            continue  # can't plot without coordinates

        lat1, lon1 = LOCATIONS[sender]
        lat2, lon2 = LOCATIONS[receiver]

        if now < picked_up_at:
            progress = 0.0
            phase = "pending_pickup"
        else:
            total = deliver_at - picked_up_at
            elapsed = now - picked_up_at
            progress = max(0.0, min(1.0, elapsed / total)) if total > 0 else 1.0
            phase = "in_transit"

        current_lat = lat1 + (lat2 - lat1) * progress
        current_lon = lon1 + (lon2 - lon1) * progress

        result.append({
            "id": id_,
            "sender": sender,
            "receiver": receiver,
            "sender_coords": [lat1, lon1],
            "receiver_coords": [lat2, lon2],
            "current_coords": [current_lat, current_lon],
            "progress": progress,
            "phase": phase,
        })

    return result

@app.post("/stamps")
async def upload_stamp(file: UploadFile):
    contents = await file.read()
    encoded = base64.b64encode(contents).decode("utf-8")
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "CREATE TABLE IF NOT EXISTS stamps (id SERIAL PRIMARY KEY, image_data TEXT)"
    )
    cur.execute("INSERT INTO stamps (image_data) VALUES (%s) RETURNING id", (encoded,))
    stamp_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return {"id": stamp_id}

@app.get("/stamps")
def get_stamps():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS stamps (id SERIAL PRIMARY KEY, image_data TEXT)")
    cur.execute("SELECT id, image_data FROM stamps ORDER BY id")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": r[0], "data": r[1]} for r in rows]

def compute_duck_status():
    conn = get_db()
    cur = conn.cursor()
    now = time.time()

    # Is there an undelivered letter right now? (duck is mid-transit)
    cur.execute("SELECT 1 FROM letters WHERE deliver_at > %s ORDER BY id DESC LIMIT 1", (now,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {"holder": None, "in_transit": True}

    # Otherwise, find the most recently delivered letter
    cur.execute("SELECT sender, receiver, deliver_at FROM letters WHERE deliver_at <= %s ORDER BY id DESC LIMIT 1", (now,))
    latest = cur.fetchone()
    cur.close()
    conn.close()

    if not latest:
        return {"holder": DEFAULT_HOLDER, "in_transit": False}

    sender, receiver, deliver_at = latest
    if now - deliver_at > RESET_HOURS * 3600:
        return {"holder": DEFAULT_HOLDER, "in_transit": False}  # 48h reset
    return {"holder": receiver, "in_transit": False}  # duck rests with whoever last received

@app.get("/duck-status")
def duck_status(viewer: str):
    status = compute_duck_status()
    can_send = (not status["in_transit"]) and status["holder"] == viewer
    return {"holder": status["holder"], "in_transit": status["in_transit"], "can_send": can_send}