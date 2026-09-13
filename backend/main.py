from fastapi import FastAPI
import letter_engine
import requests
import asyncio
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development only — restrict this later
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = letter_engine.DeliveryScheduler()
traffic = letter_engine.TrafficService()
next_id = 1

async def delivery_loop():
    while True:
        scheduler.check_deliveries()
        await asyncio.sleep(1)

@app.on_event("startup")
async def start_background_task():
    asyncio.create_task(delivery_loop())

@app.post("/send")
def send_letter(sender: str, receiver: str, content: str):
    global next_id
    delay = get_real_travel_time(sender, receiver)
    letter = letter_engine.Letter(next_id, sender, receiver, content, delay)
    scheduler.add_letter(letter)
    next_id += 1
    return {"id": letter.id, "delay_seconds": delay, "status": "sent"}

@app.get("/letters")
def get_letters():
    letters = scheduler.get_letters()
    return [
        {
            "id": l.id,
            "sender": l.sender_id,
            "receiver": l.receiver_id,
            "content": l.content,
            "status": "Delivered" if l.status == letter_engine.Status.Delivered else "In Transit",
        }
        for l in letters
    ]

LOCATIONS = {
    "Munkie": (28.653006249999997, 77.18485242130187),      # New Delhi - replace with your actual area if you want
    "Chandhini": (28.266454889636687, 77.06503868546866),   # placeholder - replace with her actual area
}

def get_real_travel_time(sender: str, receiver: str) -> int:
    if sender not in LOCATIONS or receiver not in LOCATIONS:
        return traffic.get_travel_time_seconds(sender, receiver)  # fallback to fake

    lat1, lon1 = LOCATIONS[sender]
    lat2, lon2 = LOCATIONS[receiver]

    url = f"https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}"
    try:
        response = requests.get(url, params={"overview": "false"}, timeout=5)
        data = response.json()
        duration_seconds = data["routes"][0]["duration"]
        return int(duration_seconds)
    except Exception as e:
        print(f"Traffic API failed, using fallback: {e}")
        return traffic.get_travel_time_seconds(sender, receiver)