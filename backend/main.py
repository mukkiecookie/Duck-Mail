from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import letter_engine
import psycopg2
import os
import time
import random
import math
from dotenv import load_dotenv

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
    "Munkie": (28.6139, 77.2090),
    "Chandhini": (28.5355, 77.3910),
}

WALKING_SPEED_MPS = 1.4  # average human walking speed, ~5 km/h
PICKUP_DELAY_RANGE = (10, 45)  # seconds, simulates mail being collected from a dropbox

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
    distance_m = haversine_meters(lat1, lon1, lat2, lon2)
    return int(distance_m / WALKING_SPEED_MPS)

@app.post("/send")
def send_letter(sender: str, receiver: str, content: str):
    now = time.time()
    pickup_delay = random.randint(*PICKUP_DELAY_RANGE)
    picked_up_at = now + pickup_delay

    walk_seconds = get_walking_time_seconds(sender, receiver)
    deliver_at = picked_up_at + walk_seconds

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO letters (sender, receiver, content, sent_at, picked_up_at, deliver_at) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
        (sender, receiver, content, now, picked_up_at, deliver_at),
    )
    letter_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    print(f"[Sent] Letter #{letter_id} - pickup in {pickup_delay}s, then {walk_seconds}s walk")
    return {"id": letter_id, "pickup_seconds": pickup_delay, "walk_seconds": walk_seconds, "status": "sent"}

@app.get("/letters")
def get_letters(viewer: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, sender, receiver, content, picked_up_at, deliver_at FROM letters WHERE sender = %s OR receiver = %s ORDER BY id",
        (viewer, viewer),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    now = time.time()
    result = []
    for id_, sender, receiver, content, picked_up_at, deliver_at in rows:
        delivered = now >= deliver_at
        picked_up = now >= picked_up_at

        if sender == viewer:
            # Sender always sees their own letter's progress
            status = "Delivered" if delivered else ("In Transit" if picked_up else "Pending Pickup")
            result.append({"id": id_, "sender": sender, "receiver": receiver, "content": content, "status": status})
        elif delivered:
            # Receiver only sees it once it has actually arrived
            result.append({"id": id_, "sender": sender, "receiver": receiver, "content": content, "status": "Delivered"})

    return result