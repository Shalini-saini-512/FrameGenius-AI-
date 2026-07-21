from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://frame-genius-ai-pfo7.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MongoDB connection ----------------
from dotenv import load_dotenv
import os

load_dotenv()

mongo_client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = mongo_client["framegenius"]
users_collection = db["users"]

# ---------------- Password hashing ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
# ---------------- JWT settings ----------------
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(status_code=401, detail="Invalid or expired token")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

# ---------------- Request models ----------------
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ChatQuery(BaseModel):
    question: str

# ---------------- MongoDB frames collection ----------------
frames_collection = db["frames"]

def frame_helper(frame) -> dict:
    return {
        "id": str(frame["_id"]),
        "name": frame["name"],
        "price": frame["price"],
        "quality": frame.get("quality", ""),
        "sales": frame.get("sales", 0),
        "image": frame.get("image", "")
    }

class FrameCreate(BaseModel):
    name: str
    price: float
    quality: str
    sales: int = 0
    image: str = ""

class FrameUpdate(BaseModel):
    name: str | None = None
    price: float | None = None
    quality: str | None = None
    sales: int | None = None
    image: str | None = None

# ---------------- Auth routes ----------------
@app.post("/api/register")
async def register(data: RegisterRequest):
    existing_user = await users_collection.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed = hash_password(data.password)
    new_user = {
        "name": data.name,
        "email": data.email,
        "password": hashed,
        "created_at": datetime.utcnow()
    }
    await users_collection.insert_one(new_user)
    return {"message": "Account created successfully. Please log in."}

@app.post("/api/login")
async def login(data: LoginRequest):
    user = await users_collection.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "name": user["name"]
    }

@app.get("/api/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"name": current_user["name"], "email": current_user["email"]}

# ---------------- Existing dashboard routes ----------------
@app.get("/api/insights")
def get_insights():
    return {
        "ai_partner": {
            "trending_frame": "Vintage Chiffon Series",
            "sales_growth": 18,
            "recommendation": "Stock 20% more Vintage Chiffon frames this month — demand is rising in the West region."
        },
        "sales_forecast": [
            {"month": "Feb", "sales": 120},
            {"month": "Mar", "sales": 150},
            {"month": "Apr", "sales": 135},
            {"month": "May", "sales": 180},
            {"month": "Jun", "sales": 210},
            {"month": "Jul", "sales": 240}
        ]
    }

@app.get("/api/frames")
async def get_frames():
    frames = []
    async for frame in frames_collection.find():
        frames.append(frame_helper(frame))
    return {"frames": frames}

@app.post("/api/frames")
async def create_frame(frame: FrameCreate):
    result = await frames_collection.insert_one(frame.dict())
    new_frame = await frames_collection.find_one({"_id": result.inserted_id})
    return frame_helper(new_frame)

@app.put("/api/frames/{frame_id}")
async def update_frame(frame_id: str, frame: FrameUpdate):
    from bson import ObjectId
    update_data = {k: v for k, v in frame.dict().items() if v is not None}
    if update_data:
        await frames_collection.update_one({"_id": ObjectId(frame_id)}, {"$set": update_data})
    updated = await frames_collection.find_one({"_id": ObjectId(frame_id)})
    if not updated:
        raise HTTPException(status_code=404, detail="Frame not found")
    return frame_helper(updated)

@app.delete("/api/frames/{frame_id}")
async def delete_frame(frame_id: str):
    from bson import ObjectId
    result = await frames_collection.delete_one({"_id": ObjectId(frame_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Frame not found")
    return {"message": "Frame deleted successfully"}

@app.post("/api/seed-frames")
async def seed_frames():
    """One-time helper to populate the database with starter frames. Safe to call once."""
    existing_count = await frames_collection.count_documents({})
    if existing_count > 0:
        return {"message": f"Frames already exist ({existing_count} found). Seeding skipped."}

    starter_frames = [
        {"name": "Vintage Chiffon", "price": 1499, "quality": "Premium acrylic, scratch-resistant, UV-protected", "sales": 320, "image": "https://placehold.co/300x300/a855f7/ffffff?text=Vintage+Chiffon"},
        {"name": "Retro Gold Rim", "price": 1899, "quality": "Solid brass finish, hand-polished, high durability", "sales": 210, "image": "https://placehold.co/300x300/7e22ce/ffffff?text=Retro+Gold+Rim"},
        {"name": "Classic Cinema", "price": 1299, "quality": "Wood-composite frame, matte finish, lightweight", "sales": 275, "image": "https://placehold.co/300x300/9333ea/ffffff?text=Classic+Cinema"},
        {"name": "Pastel Round", "price": 1699, "quality": "Shatterproof glass, anti-glare coating", "sales": 190, "image": "https://placehold.co/300x300/c084fc/ffffff?text=Pastel+Round"},
    ]
    await frames_collection.insert_many(starter_frames)
    return {"message": f"Seeded {len(starter_frames)} frames successfully."}

@app.get("/api/predictive-sales")
def predictive_sales():
    return {
        "month": "August",
        "predicted_units": 265,
        "predicted_revenue": 397850,
        "confidence": "High",
        "trend": "up"
    }

@app.post("/api/chatbot")
async def chatbot(query: ChatQuery):
    q = query.question.lower()

    all_frames = [frame_helper(f) async for f in frames_collection.find()]

    if not all_frames:
        return {"answer": "I don't have any frame data yet — ask your admin to add some frames first."}

    if "best" in q and "sell" in q:
        top = max(all_frames, key=lambda f: f["sales"])
        return {"answer": f"Your best-selling frame right now is {top['name']}, with {top['sales']} units sold this quarter."}

    for frame in all_frames:
        if frame["name"].lower() in q:
            return {"answer": f"{frame['name']}: {frame['quality']}. Priced at ₹{frame['price']}, with {frame['sales']} units sold."}

    if "quality" in q:
        return {"answer": "All our frames use premium materials — ask me about a specific frame name for details, e.g. 'quality of Vintage Chiffon'."}

    return {"answer": "I can tell you about best-selling frames, or the quality/price of any frame by name — try asking 'best selling frame' or 'quality of Retro Gold Rim'."}