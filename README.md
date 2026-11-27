# TribalCare AI 2.0

A full-stack TribalCare healthcare demo with React, Tailwind CSS, FastAPI, JWT, and optional MongoDB persistence.

## Requirements
- Node.js 20+
- Python 3.11+
- MongoDB optional; the backend uses clearly labelled in-memory demo mode when MONGO_URI is empty.

## Run locally

### Backend
```powershell
cd D:\TribalCare\backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API documentation: http://127.0.0.1:8000/docs

### Frontend
```powershell
cd D:\TribalCare\frontend
npm install
npm run dev
```

Website: http://127.0.0.1:5173

## Demo accounts
- Doctor: doctor@tribalcare.demo / Doctor@123
- ASHA: asha@tribalcare.demo / Asha@123
- Administrator: admin@tribalcare.demo / Admin@123
- Seeded patient mobile: 9876543210

## MongoDB
Copy backend/.env.example values to your process environment or create backend/.env and load it when starting uvicorn.
```powershell
$env:MONGO_URI="mongodb://localhost:27017"
$env:MONGO_DB="tribalcare"
python seed.py
python -m uvicorn app.main:app --reload
```

The patient-access page simulates the IVR and SMS workflows. IVR interactions, SMS requests, notifications, and request status changes are stored by the backend; MongoDB provides persistence across restarts when configured, while the default in-memory demo store is reset on restart. SMS delivery and phone calls are simulated, and the emergency workflow does not dispatch ambulances.

The IVR supports Tamil, English, Hindi, Telugu, Malayalam, and Kannada. Voice playback uses a matching browser-installed speech voice for the selected language; it does not substitute a different language when that voice is unavailable. The central number is a demo value by default and can be overridden with `HEALTHCARE_NUMBER`.

Speech input explicitly requests microphone permission before starting browser recognition and checks for a microphone and Web Speech API support. If permission, hardware, recognition, or speech detection fails, the call stays active and the keypad remains available; low-confidence or full-menu transcripts are not treated as a patient selection.

Patients can upload an audio message (up to 8 MB); the original recording is retained and can be played from an authenticated care-team dashboard. Transcription and translation remain clearly marked demo/unconfigured features until an AI provider is connected.

SMS notification routing is role- and assignment-scoped: emergencies notify the assigned ASHA worker and doctor team, other patient requests go to the assigned worker, callbacks go to the administrator/support team, and requests without an assigned worker are routed to an administrator.

## Tests
```powershell
cd D:\TribalCare\backend
python -m pytest -q
```

## Frontend build
```powershell
cd D:\TribalCare\frontend
npm run build
```
