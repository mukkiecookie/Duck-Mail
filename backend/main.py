from fastapi import FastAPI
import letter_engine
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
    delay = traffic.get_travel_time_seconds(sender, receiver)
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