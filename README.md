# 🦆 Duck Mail

A letter delivery app that mimics the real postal experience, entirely digitally. Letters aren't sent instantly. They're picked up, walked over by a duck mail carrier, and delivered based on **real walking time** calculated from actual geographic coordinates.

> Analog mail, rebuilt digitally.

![status](https://img.shields.io/badge/status-active-brightgreen)
![license](https://img.shields.io/badge/license-MIT-blue)

---

## ✉️ What it does

- Write a letter on a pixel-art typewriter, complete with an editable "To:" field and a live date
- Pick a stamp and envelope before sending, just like customizing real mail
- Watch a duck carrier walk your letter along a hand-illustrated route on an island map, in real time
- Delivery time is computed from **real-world walking distance** between two actual locations, not a fake countdown
- Letters go through realistic stages: picked up from a dropbox, in transit, delivered
- A private History tab shows only what you've received, with each letter's original stamp preserved
- Two-person only, fixed per-device identity, no accounts or passwords

## 🧩 How it works

Every letter is a real delivery job, not a chat message:

1. You write and send a letter
2. The backend calculates the real walking distance between sender and receiver using their coordinates
3. A C++ engine (bridged into Python) handles the delivery logic and timing
4. The letter sits in a "pending pickup" state for a random delay, then moves into transit for however long the real walk would take
5. The frontend polls delivery status and animates a duck walking the route, live
6. Once delivered, the letter appears in the receiver's history, not before

## 🛠️ Tech stack

| Layer | Tech |
|---|---|
| Delivery engine | C++, bridged to Python via [pybind11](https://github.com/pybind/pybind11) |
| Backend | [FastAPI](https://fastapi.tiangolo.com/) (Python) |
| Database | PostgreSQL, hosted on [Neon](https://neon.tech) |
| Frontend | React |
| Hosting | Backend on [Render](https://render.com), frontend on [Vercel](https://vercel.com) |
| Design | Fully custom pixel-art UI, hand-designed in Figma |

## 📂 Project structure

```
duck-mail/
├── backend/
│   ├── Letter.h              # C++ letter model
│   ├── TrafficService.h      # walking-time calculation
│   ├── DeliveryScheduler.h   # delivery state machine
│   ├── bindings.cpp          # pybind11 bindings
│   ├── main.py                # FastAPI app
│   ├── setup.py                # builds the C++ engine as a Python module
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.js              # login screen, layout, routing
    │   ├── pages/
    │   │   ├── ComposePage.js  # typewriter / letter composer
    │   │   └── HistoryPage.js  # past letters
    │   ├── components/
    │   │   ├── MapPanel.js     # live delivery map
    │   │   ├── EnvelopeModal.js
    │   │   └── DuckMailLogo.js
    │   └── assets/              # pixel-art sprites, fonts, maps
    └── package.json
```

## 🚀 Running locally

**Backend**
```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1      # Windows
pip install -r requirements.txt
python setup.py build_ext --inplace
python -m uvicorn main:app --reload
```

Create a `.env` file in `backend/` with your database connection string:
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

**Frontend**
```bash
cd frontend
npm install
npm start
```

## 🌍 Real-time delivery, for real

Unlike a typical messaging app, delivery time here isn't arbitrary. The app:
- Takes each person's real coordinates
- Calculates the great-circle (haversine) distance between them
- Applies an average walking speed and a route-inefficiency factor to approximate a real walking route
- Adds a random pickup delay before the letter even leaves the dropbox

The result: sending a letter to someone across town takes minutes to hours, exactly as it would in real life.

---

Built as a personal project. Not accepting external contributions, but feel free to fork and adapt it for your own use.
