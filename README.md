# 🦆 DuckMail

> **Postal Service, rebuilt digitally.**

Ever had a duck deliver your mail?

**DuckMail** is a full-stack letter delivery app where a virtual duck physically carries your letter from sender to receiver.

Instead of a fake countdown, delivery time is calculated using the **real-world distance between users**. The further away they are, the longer the duck walks.

![status](https://img.shields.io/badge/status-active-brightgreen)
![license](https://img.shields.io/badge/license-MIT-blue)

## ✉️ Features

* Write letters using a pixel-art typewriter
* Choose custom stamps and envelopes
* Delivery time based on real geographic distance
* Watch the duck travel the route on a map
* Track delivery from pickup → transit → delivered
* View received letters in your private history

## 🛠️ Tech Stack

| Layer    | Tech                     |
| -------- | ------------------------ |
| Engine   | C++ + pybind11           |
| Backend  | FastAPI                  |
| Database | PostgreSQL + Neon        |
| Frontend | React                    |
| Hosting  | Render + Vercel          |
| Design   | Custom pixel art + Figma |

## 🌍 How It Works

```text
Write Letter
     ↓
Pickup Delay
     ↓
Calculate Distance
     ↓
C++ Delivery Engine
     ↓
Duck Walks
     ↓
Letter Delivered
```

The backend calculates the distance between the sender and receiver using their coordinates, converts it into an estimated walking time, and the frontend visualizes the journey in real time.

## 🚀 Run Locally

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python setup.py build_ext --inplace
python -m uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Create a `.env` file in `backend/` with your PostgreSQL connection string.

---

**Disclaimer: No ducks were harmed in the making of this app.** 🦆
