import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os, uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def main():
    uri = os.getenv("MONGO_URI")
    if not uri:
        print("MONGO_URI is not set. Demo startup uses an in-memory database.")
        return
    db = AsyncIOMotorClient(uri)[os.getenv("MONGO_DB", "tribalcare")]
    users = db.users
    await users.delete_many({"email": {"$in": ["doctor@tribalcare.demo", "asha@tribalcare.demo", "admin@tribalcare.demo"]}})
    asha_id = "USR-" + uuid.uuid4().hex[:8].upper()
    doctor_id = "USR-" + uuid.uuid4().hex[:8].upper()
    await users.insert_many([
        {"id": doctor_id, "name": "Dr. Kavya Nair", "email": "doctor@tribalcare.demo", "password_hash": pwd_context.hash("Doctor@123"), "role": "doctor"},
        {"id": asha_id, "name": "Meena Kumari", "email": "asha@tribalcare.demo", "password_hash": pwd_context.hash("Asha@123"), "role": "asha", "village": "Kottapalli"},
        {"id": "USR-" + uuid.uuid4().hex[:8].upper(), "name": "TribalCare Administrator", "email": "admin@tribalcare.demo", "password_hash": pwd_context.hash("Admin@123"), "role": "admin"},
    ])
    print("Seeded doctor and ASHA demo accounts.")

if __name__ == "__main__":
    asyncio.run(main())
