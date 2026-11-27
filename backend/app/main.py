from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Header, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, field_validator
from passlib.context import CryptContext
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import base64, jwt, os, uuid

JWT_SECRET = os.getenv("JWT_SECRET", "tribalcare-development-secret-change-before-production-2026")
MONGO_URI = os.getenv("MONGO_URI", "")
DATABASE_NAME = os.getenv("MONGO_DB", "tribalcare")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

app = FastAPI(title="TribalCare AI 2.0 API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

client: Optional[AsyncIOMotorClient] = None
db = None
memory: Dict[str, List[dict]] = {name: [] for name in ["users","patients","appointments","pregnancy","vaccinations","home_visits","emergency","voice","voice_audio","doctor_responses","sms","notifications","audit_logs"]}

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "asha"

class PatientRequest(BaseModel):
    name: str
    mobile: str
    village: str
    age: Optional[int] = None
    gender: Optional[str] = None
    preferred_language: str = "Tamil"
    asha_worker_id: Optional[str] = None
    consent: bool = False

class AppointmentRequest(BaseModel):
    patient_id: str
    date: str
    time: str
    facility: str
    doctor_name: str = "Dr. TribalCare"

class PregnancyRequest(BaseModel):
    patient_id: str
    stage: str
    expected_delivery: str
    next_checkup: Optional[str] = None

class VaccinationRequest(BaseModel):
    patient_id: str
    vaccine: str
    due_date: str
    status: str = "Upcoming"

class HomeVisitRequest(BaseModel):
    patient_id: str
    date: str
    time: str
    purpose: str
    status: str = "Pending"

class EmergencyRequest(BaseModel):
    patient_mobile: str
    patient_name: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class SmsRequest(BaseModel):
    mobile: str
    keyword: str

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, value):
        value = value.strip()
        if not value.isdigit() or len(value) != 10:
            raise ValueError("Enter a valid 10-digit mobile number")
        return value

class IvrRequest(BaseModel):
    mobile: str
    language: str
    option: str

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, value):
        value = value.strip()
        if not value.isdigit() or len(value) != 10:
            raise ValueError("Enter a valid 10-digit mobile number")
        return value

    @field_validator("language")
    @classmethod
    def validate_language(cls, value):
        supported = {"Tamil", "English", "Hindi", "Telugu", "Malayalam", "Kannada"}
        if value not in supported:
            raise ValueError("Unsupported language")
        return value

    @field_validator("option")
    @classmethod
    def validate_option(cls, value):
        if value not in {"0", "1", "2", "3", "4", "5", "6"}:
            raise ValueError("Invalid IVR menu option")
        return value

class ResponseRequest(BaseModel):
    patient_id: str
    voice_message_id: Optional[str] = None
    response_text: str
    language: str = "English"


def now_iso():
    return datetime.now(timezone.utc).isoformat()

def uid(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

def public_user(user):
    return {k: v for k, v in user.items() if k != "password_hash"}

def create_token(user):
    payload = {"sub": user["id"], "role": user["role"], "exp": datetime.now(timezone.utc) + timedelta(hours=12)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(401, "Authentication required")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")
    user = await find_one("users", {"id": payload["sub"]})
    if not user:
        raise HTTPException(401, "User not found")
    return user

def require_roles(*roles):
    async def checker(user=Depends(get_current_user)):
        if user["role"] not in roles and user["role"] != "admin":
            raise HTTPException(403, "Insufficient permissions")
        return user
    return checker

async def find_one(collection, query):
    if db is not None:
        item = await db[collection].find_one(query)
        if item:
            item.pop("_id", None)
        return item
    return next((x for x in memory[collection] if all(x.get(k) == v for k, v in query.items())), None)

async def find_many(collection, query=None, search=None, limit=100):
    query = query or {}
    if db is not None:
        cursor = db[collection].find(query).limit(limit)
        rows = []
        async for item in cursor:
            item.pop("_id", None)
            rows.append(item)
        return rows
    rows = [x for x in memory[collection] if all(x.get(k) == v for k, v in query.items())]
    if search:
        needle = search.lower()
        rows = [x for x in rows if needle in " ".join(str(v) for v in x.values()).lower()]
    return rows[:limit]

async def insert(collection, item):
    item.setdefault("created_at", now_iso())
    item.setdefault("updated_at", now_iso())
    if db is not None:
        await db[collection].insert_one(dict(item))
    else:
        memory[collection].append(item)
    return item

async def update(collection, item_id, changes):
    changes["updated_at"] = now_iso()
    if db is not None:
        result = await db[collection].find_one_and_update({"id": item_id}, {"$set": changes}, return_document=True)
        if result:
            result.pop("_id", None)
        return result
    for item in memory[collection]:
        if item.get("id") == item_id:
            item.update(changes)
            return item
    return None

@app.on_event("startup")
async def startup():
    global client, db
    if MONGO_URI:
        try:
            client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=3000)
            db = client[DATABASE_NAME]
            await db.command("ping")
        except Exception:
            db = None
    await seed_data()

@app.on_event("shutdown")
async def shutdown():
    if client:
        client.close()

async def seed_data():
    for seed_user in [
        {"name": "Dr. Kavya Nair", "email": "doctor@tribalcare.demo", "password": "Doctor@123", "role": "doctor"},
        {"name": "Meena Kumari", "email": "asha@tribalcare.demo", "password": "Asha@123", "role": "asha", "village": "Kottapalli"},
        {"name": "TribalCare Administrator", "email": "admin@tribalcare.demo", "password": "Admin@123", "role": "admin"},
    ]:
        if not await find_one("users", {"email": seed_user["email"]}):
            user = {key: value for key, value in seed_user.items() if key != "password"}
            user.update({"id": uid("USR"), "password_hash": pwd_context.hash(seed_user["password"])})
            await insert("users", user)
    asha = await find_one("users", {"email": "asha@tribalcare.demo"})
    patient = await find_one("patients", {"mobile": "9876543210"})
    if not patient:
        patient = {"id": uid("PAT"), "name": "Lakshmi Devi", "mobile": "9876543210", "village": "Kottapalli", "age": 29, "gender": "Female", "preferred_language": "Tamil", "asha_worker_id": asha["id"], "consent": True}
        await insert("patients", patient)
    if not await find_one("appointments", {"patient_id": patient["id"]}):
        await insert("appointments", {"id": uid("APT"), "patient_id": patient["id"], "date": (datetime.now()+timedelta(days=2)).strftime("%Y-%m-%d"), "time": "10:30", "facility": "Kottapalli PHC", "doctor_name": "Dr. Kavya Nair", "status": "Scheduled"})
    if not await find_one("pregnancy", {"patient_id": patient["id"]}):
        await insert("pregnancy", {"id": uid("PRG"), "patient_id": patient["id"], "stage": "Second trimester", "expected_delivery": "2027-03-15", "next_checkup": "2026-12-10", "status": "Active"})
    if not await find_one("vaccinations", {"patient_id": patient["id"]}):
        await insert("vaccinations", {"id": uid("VAC"), "patient_id": patient["id"], "vaccine": "Polio Booster", "due_date": "2026-12-05", "status": "Upcoming"})
    if not await find_one("notifications", {"user_id": asha["id"], "title": "Vaccination due"}):
        await insert("notifications", {"id": uid("NOT"), "user_id": asha["id"], "title": "Vaccination due", "message": "Lakshmi's child vaccination is approaching.", "read": False})

@app.get("/api/health")
async def health():
    return {"status": "ok", "database": "MongoDB" if db is not None else "In-memory demo", "demo_mode": db is None}

@app.get("/api/public/config")
async def public_config():
    return {"healthcare_number": os.getenv("HEALTHCARE_NUMBER", "1800-123-4567"), "demo_mode": db is None}

@app.post("/api/auth/login")
async def login(data: LoginRequest):
    user = await find_one("users", {"email": data.email.lower()})
    if not user or not pwd_context.verify(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    return {"access_token": create_token(user), "token_type": "bearer", "user": public_user(user)}

@app.post("/api/auth/register")
async def register(data: RegisterRequest):
    if await find_one("users", {"email": data.email.lower()}):
        raise HTTPException(400, "Email already registered")
    if data.role not in ("doctor", "asha"):
        raise HTTPException(400, "Only doctor or ASHA roles may register")
    user = {"id": uid("USR"), "name": data.name, "email": data.email.lower(), "password_hash": pwd_context.hash(data.password), "role": data.role}
    await insert("users", user)
    return {"access_token": create_token(user), "token_type": "bearer", "user": public_user(user)}

@app.get("/api/auth/me")
async def me(user=Depends(get_current_user)):
    return public_user(user)

@app.post("/api/patients")
async def create_patient(data: PatientRequest, user=Depends(require_roles("asha", "doctor"))):
    if not data.consent:
        raise HTTPException(400, "Patient consent is required")
    if await find_one("patients", {"mobile": data.mobile}):
        raise HTTPException(400, "A patient with this mobile number already exists")
    patient = data.model_dump()
    patient.update({"id": uid("PAT"), "asha_worker_id": data.asha_worker_id or (user["id"] if user["role"] == "asha" else None)})
    await insert("patients", patient)
    await insert("audit_logs", {"id": uid("AUD"), "user_id": user["id"], "action": "patient_created", "target_id": patient["id"]})
    return patient

@app.get("/api/patients")
async def list_patients(search: str = "", user=Depends(require_roles("asha", "doctor"))):
    query = {"asha_worker_id": user["id"]} if user["role"] == "asha" else None
    return await find_many("patients", query, search)

@app.get("/api/patients/{patient_id}")
async def get_patient(patient_id: str, user=Depends(require_roles("asha", "doctor"))):
    patient = await find_one("patients", {"id": patient_id})
    if not patient:
        raise HTTPException(404, "Patient not found")
    if user["role"] == "asha" and patient.get("asha_worker_id") != user["id"]:
        raise HTTPException(403, "Patient is not assigned to you")
    return patient

@app.put("/api/patients/{patient_id}")
async def update_patient(patient_id: str, data: Dict[str, Any], user=Depends(require_roles("asha", "doctor"))):
    if user["role"] == "asha":
        patient = await find_one("patients", {"id": patient_id})
        if not patient or patient.get("asha_worker_id") != user["id"]:
            raise HTTPException(403, "Patient is not assigned to you")
    result = await update("patients", patient_id, data)
    if not result:
        raise HTTPException(404, "Patient not found")
    return result

async def generic_create(collection, data, extra=None):
    item = data.model_dump() if hasattr(data, "model_dump") else dict(data)
    item.update(extra or {})
    item["id"] = uid(collection[:3].upper())
    await insert(collection, item)
    return item

@app.post("/api/appointments")
async def create_appointment(data: AppointmentRequest, user=Depends(require_roles("asha", "doctor"))):
    return await generic_create("appointments", data, {"status": "Scheduled"})

@app.get("/api/appointments")
async def appointments(search: str = "", user=Depends(require_roles("asha", "doctor"))):
    rows = await find_many("appointments", None, search)
    if user["role"] == "asha":
        patient_ids = {p["id"] for p in await find_many("patients", {"asha_worker_id": user["id"]})}
        rows = [r for r in rows if r.get("patient_id") in patient_ids]
    return rows

@app.put("/api/appointments/{item_id}")
async def update_appointment(item_id: str, data: Dict[str, Any], user=Depends(require_roles("asha", "doctor"))):
    result = await update("appointments", item_id, data)
    if not result: raise HTTPException(404, "Appointment not found")
    return result

@app.delete("/api/appointments/{item_id}")
async def delete_appointment(item_id: str, user=Depends(require_roles("asha", "doctor"))):
    result = await update("appointments", item_id, {"status": "Cancelled"})
    if not result: raise HTTPException(404, "Appointment not found")
    return {"deleted": True, "appointment": result}

@app.post("/api/pregnancy")
async def create_pregnancy(data: PregnancyRequest, user=Depends(require_roles("asha", "doctor"))):
    return await generic_create("pregnancy", data, {"status": "Active"})

@app.get("/api/pregnancy")
async def pregnancy(search: str = "", user=Depends(require_roles("asha", "doctor"))):
    return await find_many("pregnancy", None, search)

@app.put("/api/pregnancy/{item_id}")
async def update_pregnancy(item_id: str, data: Dict[str, Any], user=Depends(require_roles("asha", "doctor"))):
    result = await update("pregnancy", item_id, data)
    if not result: raise HTTPException(404, "Record not found")
    return result

@app.post("/api/vaccinations")
async def create_vaccination(data: VaccinationRequest, user=Depends(require_roles("asha", "doctor"))):
    return await generic_create("vaccinations", data)

@app.get("/api/vaccinations")
async def vaccinations(search: str = "", user=Depends(require_roles("asha", "doctor"))):
    return await find_many("vaccinations", None, search)

@app.put("/api/vaccinations/{item_id}")
async def update_vaccination(item_id: str, data: Dict[str, Any], user=Depends(require_roles("asha", "doctor"))):
    result = await update("vaccinations", item_id, data)
    if not result: raise HTTPException(404, "Record not found")
    return result

@app.post("/api/home-visits")
async def create_visit(data: HomeVisitRequest, user=Depends(require_roles("asha", "doctor"))):
    return await generic_create("home_visits", data)

@app.get("/api/home-visits")
async def home_visits(search: str = "", user=Depends(require_roles("asha", "doctor"))):
    return await find_many("home_visits", None, search)

@app.put("/api/home-visits/{item_id}")
async def update_visit(item_id: str, data: Dict[str, Any], user=Depends(require_roles("asha", "doctor"))):
    result = await update("home_visits", item_id, data)
    if not result: raise HTTPException(404, "Visit not found")
    return result

async def admin_user_ids():
    return [user["id"] for user in await find_many("users", {"role": "admin"})]

async def notification_recipients(patient, keyword):
    worker_id = patient.get("asha_worker_id") if patient else None
    if keyword == "CALL":
        return await admin_user_ids()
    recipients = [worker_id] if worker_id else []
    if keyword == "HELP":
        recipients.extend(user["id"] for user in await find_many("users", {"role": "doctor"}))
    if not recipients:
        recipients.extend(await admin_user_ids())
    return list(dict.fromkeys(recipients))

async def notify_users(user_ids, title, message, **metadata):
    for user_id in user_ids:
        await insert("notifications", {"id": uid("NOT"), "user_id": user_id, "title": title,
                                       "message": message, "read": False, **metadata})

@app.post("/api/emergency")
async def create_emergency(data: EmergencyRequest):
    patient = await find_one("patients", {"mobile": data.patient_mobile})
    asha_worker_id = patient.get("asha_worker_id") if patient else None
    emergency = {"id": uid("EMG"), "patient_mobile": data.patient_mobile, "patient_name": data.patient_name or (patient or {}).get("name"), "location": data.location, "notes": data.notes, "asha_worker_id": asha_worker_id, "status": "Request Created", "history": ["Request Created"]}
    await insert("emergency", emergency)
    recipients = await notification_recipients(patient, "HELP")
    await notify_users(recipients, "High-priority emergency", f"Emergency request for {emergency['patient_name'] or data.patient_mobile}", emergency_id=emergency["id"])
    return emergency

@app.get("/api/emergency")
async def emergency(search: str = "", user=Depends(get_current_user)):
    query = {"asha_worker_id": user["id"]} if user["role"] == "asha" else None
    if user["role"] not in {"asha", "doctor", "admin"}:
        raise HTTPException(403, "Insufficient permissions")
    return await find_many("emergency", query, search)

@app.put("/api/emergency/{item_id}/status")
async def emergency_status(item_id: str, data: Dict[str, str], user=Depends(require_roles("asha", "doctor"))):
    status = data.get("status")
    allowed = {"Request Created","Alert Sent","Acknowledged","Callback Initiated","Resolved","Referred"}
    if status not in allowed:
        raise HTTPException(400, "Invalid emergency status")
    result = await update("emergency", item_id, {"status": status, "notes": data.get("notes", "")})
    if not result: raise HTTPException(404, "Emergency not found")
    return result

@app.post("/api/voice/upload")
async def voice_upload(file: UploadFile = File(...), patient_mobile: str = Form("9876543210")):
    content = await file.read()
    if not patient_mobile.isdigit() or len(patient_mobile) != 10:
        raise HTTPException(422, "Enter a valid 10-digit patient mobile number")
    if not content:
        raise HTTPException(400, "The voice recording is empty")
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(413, "Voice recordings must be 8 MB or smaller")
    if not (file.content_type or "").startswith("audio/"):
        raise HTTPException(415, "Upload an audio recording")
    item = {"id": uid("VOX"), "patient_mobile": patient_mobile, "filename": file.filename,
            "content_type": file.content_type, "size": len(content),
            "language_detected": None,
            "original_text": "Transcription pending. No transcription service is configured.",
            "translated_text": None, "demo_mode": True, "status": "Needs review"}
    patient = await find_one("patients", {"mobile": patient_mobile})
    recipients = await notification_recipients(patient, "WORKER")
    item["recipient_user_ids"] = recipients
    await insert("voice", item)
    await insert("voice_audio", {"id": item["id"], "content_type": file.content_type,
                                 "audio_base64": base64.b64encode(content).decode("ascii")})
    await notify_users(recipients, "New patient voice message",
                       f"Voice message received from {patient.get('name') if patient else patient_mobile}.",
                       voice_message_id=item["id"])
    result = dict(item)
    result.pop("audio_base64", None)
    return result

@app.get("/api/voice/messages")
async def voice_messages(user=Depends(require_roles("asha", "doctor"))):
    if user["role"] == "asha":
        patients = await find_many("patients", {"asha_worker_id": user["id"]})
        mobile_numbers = {patient["mobile"] for patient in patients}
        rows = [message for message in await find_many("voice") if message.get("patient_mobile") in mobile_numbers]
    else:
        rows = await find_many("voice")
    return rows

@app.get("/api/voice/messages/{item_id}/audio")
async def voice_audio(item_id: str, user=Depends(require_roles("asha", "doctor"))):
    item = await find_one("voice", {"id": item_id})
    if not item:
        raise HTTPException(404, "Voice message not found")
    if user["role"] == "asha":
        patient = await find_one("patients", {"mobile": item["patient_mobile"]})
        if not patient or patient.get("asha_worker_id") != user["id"]:
            raise HTTPException(403, "Voice message is not assigned to you")
    audio = await find_one("voice_audio", {"id": item_id})
    if not audio or not audio.get("audio_base64"):
        raise HTTPException(404, "Original recording is unavailable")
    return Response(content=base64.b64decode(audio["audio_base64"]), media_type=audio.get("content_type", "audio/webm"))

@app.post("/api/voice/transcribe")
async def transcribe(data: Dict[str, str]):
    return {"text": "Demo transcription: " + data.get("text", "Patient voice message received."), "demo_mode": True, "confidence": None}

@app.post("/api/voice/translate")
async def translate(data: Dict[str, str]):
    target = data.get("target_language", "English")
    return {"translated_text": f"[Demo {target}] " + data.get("text", ""), "demo_mode": True, "confidence": None, "requires_verification": True}

@app.post("/api/doctor-responses")
async def doctor_response(data: ResponseRequest, user=Depends(require_roles("doctor"))):
    item = data.model_dump()
    item.update({"id": uid("RSP"), "doctor_id": user["id"]})
    await insert("doctor_responses", item)
    patient = await find_one("patients", {"id": data.patient_id})
    recipients = [patient["asha_worker_id"]] if patient and patient.get("asha_worker_id") else await admin_user_ids()
    await notify_users(recipients, "Doctor response received", data.response_text, patient_id=data.patient_id)
    return item

@app.get("/api/doctor-responses")
async def doctor_responses(patient_id: Optional[str] = None, user=Depends(require_roles("asha", "doctor"))):
    query = {"patient_id": patient_id} if patient_id else None
    return await find_many("doctor_responses", query)

@app.post("/api/sms/process")
async def process_sms(data: SmsRequest):
    keyword = data.keyword.upper().strip()
    supported = {"HELP", "APPT", "VACCINE", "WORKER", "CALL"}
    if keyword not in supported:
        raise HTTPException(400, "Keyword not recognised. Send HELP, APPT, VACCINE, WORKER or CALL.")
    patient = await find_one("patients", {"mobile": data.mobile})
    recipients = await notification_recipients(patient, keyword)
    response = "Your request has been received."
    request_id = None
    if keyword == "HELP":
        emergency_record = await create_emergency(EmergencyRequest(patient_mobile=data.mobile, notes="Created by SMS keyword HELP"))
        request_id = emergency_record["id"]
        response = "Emergency assistance requested. Your care team has been alerted. This service does not dispatch an ambulance."
    elif keyword == "APPT":
        appointments = await find_many("appointments", {"patient_id": patient["id"]}) if patient else []
        upcoming = next((appointment for appointment in appointments if appointment.get("status") != "Cancelled"), None)
        response = (f"Appointment: {upcoming.get('date')} at {upcoming.get('time')}, {upcoming.get('facility')}."
                    if upcoming else "No appointment is currently listed. Your care team has been notified.")
    elif keyword == "VACCINE":
        vaccines = await find_many("vaccinations", {"patient_id": patient["id"]}) if patient else []
        upcoming = next((vaccine for vaccine in vaccines if vaccine.get("status") != "Completed"), None)
        response = (f"Upcoming vaccination: {upcoming.get('vaccine')} on {upcoming.get('due_date')}."
                    if upcoming else "No upcoming vaccination is listed. Your care team can help.")
    elif keyword == "WORKER":
        worker = await find_one("users", {"id": patient.get("asha_worker_id")}) if patient and patient.get("asha_worker_id") else None
        response = (f"Your ASHA worker is {worker['name']}." if worker
                    else "Your ASHA worker is not assigned yet. Support has been notified.")
    elif keyword == "CALL":
        response = "A callback has been requested. Please keep your phone available."
    item = {"id": uid("SMS"), "mobile": data.mobile, "patient_id": patient.get("id") if patient else None,
            "keyword": keyword, "response": response, "status": "Simulated delivery", "request_id": request_id,
            "recipient_user_ids": recipients}
    await insert("sms", item)
    if keyword != "HELP":
        await notify_users(recipients, f"Patient SMS: {keyword}", f"{patient.get('name') if patient else data.mobile}: {response}", request_id=item["id"], patient_id=item["patient_id"])
    return item

@app.post("/api/patient/ivr")
async def patient_ivr(data: IvrRequest):
    patient = await find_one("patients", {"mobile": data.mobile})
    option = data.option
    options = {
        "1": ("Emergency help requested.", "HELP"),
        "2": ("Appointment details retrieved.", "APPT"),
        "3": ("Pregnancy care information retrieved.", "PREGNANCY"),
        "4": ("Child healthcare and vaccination information retrieved.", "VACCINE"),
        "5": ("ASHA worker contact details retrieved.", "WORKER"),
        "6": ("Nearby Primary Health Centre: Kottapalli PHC. Please confirm current opening hours locally.", "PHC"),
        "0": ("Healthcare support callback requested.", "CALL"),
    }
    response, keyword = options[option]
    request_id = None
    details = {}
    if option == "2" and patient:
        appointment = next((a for a in await find_many("appointments", {"patient_id": patient["id"]}) if a.get("status") != "Cancelled"), None)
        if appointment:
            response = f"Appointment on {appointment.get('date')} at {appointment.get('time')} at {appointment.get('facility')}."
            details = {"date": appointment.get("date"), "time": appointment.get("time"), "facility": appointment.get("facility")}
        else:
            response = "No appointment is currently listed. Your care team can help."
    elif option == "3" and patient:
        record = next(iter(await find_many("pregnancy", {"patient_id": patient["id"]})), None)
        if record:
            response = f"Pregnancy care: {record.get('stage')}. Next checkup: {record.get('next_checkup') or 'not scheduled'}."
            details = {"stage": record.get("stage"), "next_checkup": record.get("next_checkup")}
        else:
            response = "For pregnancy care, contact your ASHA worker or nearest health centre."
    elif option == "4" and patient:
        vaccine = next((v for v in await find_many("vaccinations", {"patient_id": patient["id"]}) if v.get("status") != "Completed"), None)
        if vaccine:
            response = f"Next vaccination: {vaccine.get('vaccine')} on {vaccine.get('due_date')}."
            details = {"vaccine": vaccine.get("vaccine"), "due_date": vaccine.get("due_date")}
    elif option == "5" and patient and patient.get("asha_worker_id"):
        worker = await find_one("users", {"id": patient["asha_worker_id"]})
        if worker:
            response = f"Your ASHA worker is {worker['name']}."
            details = {"worker_name": worker["name"], "village": worker.get("village")}
    elif option == "6":
        details = {"facility": "Kottapalli PHC", "village": patient.get("village") if patient else None}
    interaction = {"id": uid("IVR"), "mobile": data.mobile, "patient_id": patient.get("id") if patient else None,
                   "language": data.language, "option": option, "response": response, "details": details,
                   "status": "Received"}
    recipients = await notification_recipients(patient, keyword or "WORKER")
    interaction["recipient_user_ids"] = recipients
    await insert("sms", {**interaction, "channel": "IVR", "keyword": keyword or f"IVR-{option}"})
    if keyword == "HELP":
        emergency_record = await create_emergency(EmergencyRequest(patient_mobile=data.mobile, notes="Created through IVR emergency option"))
        request_id = emergency_record["id"]
    else:
        await notify_users(recipients, f"Patient IVR request: {keyword}", f"{patient.get('name') if patient else data.mobile}: {response}",
                           request_id=interaction["id"], patient_id=interaction["patient_id"])
    interaction["request_id"] = request_id
    return interaction

@app.get("/api/sms/history")
async def sms_history(user=Depends(require_roles("asha", "doctor"))):
    rows = await find_many("sms")
    if user["role"] != "admin":
        rows = [item for item in rows if user["id"] in item.get("recipient_user_ids", [])]
    return rows

@app.put("/api/sms/{item_id}/status")
async def update_sms_status(item_id: str, data: Dict[str, str], user=Depends(require_roles("asha", "doctor"))):
    item = await find_one("sms", {"id": item_id})
    if not item:
        raise HTTPException(404, "Request not found")
    if user["role"] != "admin" and user["id"] not in item.get("recipient_user_ids", []):
        raise HTTPException(403, "Request is not assigned to you")
    status = data.get("status")
    if status not in {"Acknowledged", "In progress", "Resolved"}:
        raise HTTPException(400, "Invalid request status")
    result = await update("sms", item_id, {"status": status})
    return result

@app.get("/api/notifications")
async def notifications(user=Depends(get_current_user)):
    return await find_many("notifications", {"user_id": user["id"]})

@app.put("/api/notifications/{item_id}/read")
async def read_notification(item_id: str, user=Depends(get_current_user)):
    notification = await find_one("notifications", {"id": item_id})
    if not notification:
        raise HTTPException(404, "Notification not found")
    if notification.get("user_id") != user["id"]:
        raise HTTPException(403, "Notification is not assigned to you")
    result = await update("notifications", item_id, {"read": True})
    return result

@app.get("/api/admin/users")
async def admin_users(user=Depends(require_roles("admin"))):
    return [public_user(item) for item in await find_many("users")]
