from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import letter_engine
import requests
import sqlite3
import time

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

DB_PATH = "letters.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS letters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT,
            receiver TEXT,
            content TEXT,
            sent_at REAL,
            deliver_at REAL
        )
    """)
    conn.commit()
    conn.close()

init_db()

def get_real_travel_time(sender: str, receiver: str) -> int:
    if sender not in LOCATIONS or receiver not in LOCATIONS:
        return traffic.get_travel_time_seconds(sender, receiver)

    lat1, lon1 = LOCATIONS[sender]
    lat2, lon2 = LOCATIONS[receiver]
    url = f"https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}"
    try:
        response = requests.get(url, params={"overview": "false"}, timeout=5)
        data = response.json()
        return int(data["routes"][0]["duration"])
    except Exception as e:
        print(f"Traffic API failed, using fallback: {e}")
        return traffic.get_travel_time_seconds(sender, receiver)

@app.post("/send")
def send_letter(sender: str, receiver: str, content: str):
    delay = get_real_travel_time(sender, receiver)
    now = time.time()
    deliver_at = now + delay

    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO letters (sender, receiver, content, sent_at, deliver_at) VALUES (?, ?, ?, ?, ?)",
        (sender, receiver, content, now, deliver_at),
    )
    conn.commit()
    letter_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    conn.close()

    print(f"[Sent] Letter #{letter_id} en route... ({delay}s)")
    return {"id": letter_id, "delay_seconds": delay, "status": "sent"}

@app.get("/letters")
def get_letters(viewer: str):
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT id, sender, receiver, content, deliver_at FROM letters WHERE sender = ? OR receiver = ? ORDER BY id",
        (viewer, viewer),
    ).fetchall()
    conn.close()

    now = time.time()
    result = []
    for id_, sender, receiver, content, deliver_at in rows:
        delivered = now >= deliver_at

        # Sender always sees their own sent letters (In Transit or Delivered).
        # Receiver only sees a letter once it has actually arrived.
        if sender == viewer or delivered:
            result.append({
                "id": id_,
                "sender": sender,
                "receiver": receiver,
                "content": content,
                "status": "Delivered" if delivered else "In Transit",
            })
    return result