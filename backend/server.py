<<<<<<< HEAD
"""
RentEase - Rental Marketplace API
FastAPI Backend with MongoDB
"""

import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

# Configuration
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "rentease_db")
JWT_SECRET = os.environ.get("JWT_SECRET", "rentease_secret_key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Database client
client: AsyncIOMotorClient = None
db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    print(f"Connected to MongoDB: {MONGO_URL}/{DB_NAME}")
    yield
    client.close()
    print("MongoDB connection closed")


app = FastAPI(
    title="RentEase API",
    description="Rental Marketplace API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
=======
from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import asyncio
import base64
from io import BytesIO
from PIL import Image

# Import Firebase and integrations
from firebase_config import get_firestore_client, get_storage_bucket
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize Resend
resend.api_key = os.environ.get('RESEND_API_KEY', 're_placeholder_key')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Initialize Firestore
db = get_firestore_client()
storage_bucket = get_storage_bucket()

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Item(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    type: str  # "lost" or "found"
    category: str
    description: str
    location: str
    date: str
    owner_id: str
    owner_name: str
    owner_email: EmailStr
    owner_phone: Optional[str] = None
    image_url: Optional[str] = None
    image_embedding: Optional[str] = None
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ItemCreate(BaseModel):
    title: str
    type: str
    category: str
    description: str
    location: str
    date: str
    owner_name: str
    owner_email: EmailStr
    owner_phone: Optional[str] = None

class MatchResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lost_item_id: str
    found_item_id: str
    match_score: float
    notified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmailRequest(BaseModel):
    recipient_email: EmailStr
    subject: str
    html_content: str

# Helper Functions
async def upload_image_to_storage(file: UploadFile, item_id: str) -> str:
    """Upload image to Firebase Storage and return public URL"""
    try:
        # Read file content
        content = await file.read()
        
        # Create blob reference
        blob = storage_bucket.blob(f"items/{item_id}/{file.filename}")
        
        # Upload to Firebase Storage
        blob.upload_from_string(content, content_type=file.content_type)
        
        # Make blob publicly accessible
        blob.make_public()
        
        return blob.public_url
    except Exception as e:
        logging.error(f"Error uploading image: {str(e)}")
        return None

async def generate_image_embedding(image_base64: str) -> str:
    """Generate image embedding using Gemini Vision"""
    try:
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=str(uuid.uuid4()),
            system_message="You are an image analysis expert. Provide detailed descriptions."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        image_content = ImageContent(image_base64=image_base64)
        user_message = UserMessage(
            text="Describe this item in extreme detail, focusing on color, shape, size, brand, unique features, and condition.",
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        return response
    except Exception as e:
        logging.error(f"Error generating embedding: {str(e)}")
        return ""

async def compare_items(lost_item: dict, found_item: dict) -> float:
    """Compare two items using Gemini AI and return similarity score"""
    try:
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=str(uuid.uuid4()),
            system_message="You are a matching expert. Compare items and provide a similarity score."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        prompt = f"""Compare these two items and provide ONLY a similarity score from 0-100.

Lost Item:
Title: {lost_item['title']}
Category: {lost_item['category']}
Description: {lost_item['description']}
Location: {lost_item['location']}
Date: {lost_item['date']}
Image Description: {lost_item.get('image_embedding', 'No description')}

Found Item:
Title: {found_item['title']}
Category: {found_item['category']}
Description: {found_item['description']}
Location: {found_item['location']}
Date: {found_item['date']}
Image Description: {found_item.get('image_embedding', 'No description')}

Respond with ONLY a number between 0-100 representing similarity percentage."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Extract numeric score
        score_str = ''.join(filter(str.isdigit, response))
        score = float(score_str) if score_str else 0.0
        return min(max(score, 0.0), 100.0)
    except Exception as e:
        logging.error(f"Error comparing items: {str(e)}")
        return 0.0

async def send_match_notification(lost_item: dict, found_item: dict, match_score: float):
    """Send email notification to lost item owner"""
    try:
        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #1F2937; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F5F6FF; }}
        .header {{ background-color: #5B6CFF; color: white; padding: 30px; text-align: center; border-radius: 10px; }}
        .content {{ background-color: white; padding: 30px; margin: 20px 0; border-radius: 10px; }}
        .item-details {{ background-color: #F5F6FF; padding: 15px; margin: 15px 0; border-radius: 8px; }}
        .match-score {{ font-size: 24px; color: #2ED3B7; font-weight: bold; text-align: center; padding: 20px; }}
        .contact-info {{ background-color: #2ED3B7; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .footer {{ text-align: center; color: #6B7280; padding: 20px; }}
        img {{ max-width: 100%; height: auto; border-radius: 8px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Potential Match Found!</h1>
        </div>
        
        <div class="content">
            <p>Hi {lost_item['owner_name']},</p>
            <p>Great news! We found a potential match for your lost item.</p>
            
            <div class="match-score">
                Match Confidence: {match_score:.0f}%
            </div>
            
            <div class="item-details">
                <h3>Your Lost Item</h3>
                <p><strong>Title:</strong> {lost_item['title']}</p>
                <p><strong>Category:</strong> {lost_item['category']}</p>
                <p><strong>Location:</strong> {lost_item['location']}</p>
            </div>
            
            <div class="item-details">
                <h3>Found Item</h3>
                <p><strong>Title:</strong> {found_item['title']}</p>
                <p><strong>Category:</strong> {found_item['category']}</p>
                <p><strong>Description:</strong> {found_item['description']}</p>
                <p><strong>Location:</strong> {found_item['location']}</p>
                <p><strong>Date Found:</strong> {found_item['date']}</p>
                {'<p><img src="' + found_item['image_url'] + '" alt="Found item"/></p>' if found_item.get('image_url') else ''}
            </div>
            
            <div class="contact-info">
                <h3>Contact the Finder</h3>
                <p><strong>Name:</strong> {found_item['owner_name']}</p>
                <p><strong>Email:</strong> {found_item['owner_email']}</p>
                {('<p><strong>Phone:</strong> ' + found_item['owner_phone'] + '</p>') if found_item.get('owner_phone') else ''}
            </div>
            
            <p>Please reach out to the finder directly to verify and arrange item recovery.</p>
        </div>
        
        <div class="footer">
            <p>Lost & Found Platform</p>
        </div>
    </div>
</body>
</html>"""
        
        params = {
            "from": SENDER_EMAIL,
            "to": [lost_item['owner_email']],
            "subject": f"Match Found: {lost_item['title']}",
            "html": html_content
        }
        
        await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Notification sent to {lost_item['owner_email']}")
    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")

# API Endpoints
@api_router.get("/")
async def root():
    return {"message": "Lost & Found API"}

@api_router.post("/items/lost")
async def create_lost_item(
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    date: str = Form(...),
    owner_name: str = Form(...),
    owner_email: str = Form(...),
    owner_phone: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """Submit a lost item"""
    try:
        item_id = str(uuid.uuid4())
        
        # Upload image if provided
        image_url = None
        image_embedding = None
        if image:
            # Convert to base64 for embedding
            content = await image.read()
            image_base64 = base64.b64encode(content).decode('utf-8')
            
            # Reset file pointer and upload to storage
            await image.seek(0)
            image_url = await upload_image_to_storage(image, item_id)
            
            # Generate embedding
            image_embedding = await generate_image_embedding(image_base64)
        
        # Create item
        item = Item(
            id=item_id,
            title=title,
            type="lost",
            category=category,
            description=description,
            location=location,
            date=date,
            owner_id=item_id,
            owner_name=owner_name,
            owner_email=owner_email,
            owner_phone=owner_phone,
            image_url=image_url,
            image_embedding=image_embedding,
            status="active"
        )
        
        # Save to Firestore
        item_dict = item.model_dump()
        item_dict['created_at'] = item_dict['created_at'].isoformat()
        db.collection('items').document(item_id).set(item_dict)
        
        return item
    except Exception as e:
        logging.error(f"Error creating lost item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/items/found")
async def create_found_item(
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    date: str = Form(...),
    owner_name: str = Form(...),
    owner_email: str = Form(...),
    owner_phone: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """Submit a found item and trigger matching"""
    try:
        item_id = str(uuid.uuid4())
        
        # Upload image if provided
        image_url = None
        image_embedding = None
        if image:
            # Convert to base64 for embedding
            content = await image.read()
            image_base64 = base64.b64encode(content).decode('utf-8')
            
            # Reset file pointer and upload to storage
            await image.seek(0)
            image_url = await upload_image_to_storage(image, item_id)
            
            # Generate embedding
            image_embedding = await generate_image_embedding(image_base64)
        
        # Create item
        item = Item(
            id=item_id,
            title=title,
            type="found",
            category=category,
            description=description,
            location=location,
            date=date,
            owner_id=item_id,
            owner_name=owner_name,
            owner_email=owner_email,
            owner_phone=owner_phone,
            image_url=image_url,
            image_embedding=image_embedding,
            status="active"
        )
        
        # Save to Firestore
        item_dict = item.model_dump()
        item_dict['created_at'] = item_dict['created_at'].isoformat()
        db.collection('items').document(item_id).set(item_dict)
        
        # Check for matches with lost items
        lost_items = db.collection('items').where('type', '==', 'lost').where('status', '==', 'active').stream()
        
        for lost_doc in lost_items:
            lost_item = lost_doc.to_dict()
            
            # Compare items
            match_score = await compare_items(lost_item, item_dict)
            
            # If match score >= 85%, create match and notify
            if match_score >= 85:
                match_id = str(uuid.uuid4())
                match = MatchResult(
                    id=match_id,
                    lost_item_id=lost_item['id'],
                    found_item_id=item_id,
                    match_score=match_score,
                    notified=True
                )
                
                match_dict = match.model_dump()
                match_dict['created_at'] = match_dict['created_at'].isoformat()
                db.collection('matches').document(match_id).set(match_dict)
                
                # Send notification
                await send_match_notification(lost_item, item_dict, match_score)
        
        return item
    except Exception as e:
        logging.error(f"Error creating found item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/items/lost")
async def get_lost_items():
    """Get all lost items"""
    try:
        items = []
        docs = db.collection('items').where('type', '==', 'lost').where('status', '==', 'active').stream()
        for doc in docs:
            item_data = doc.to_dict()
            items.append(item_data)
        return items
    except Exception as e:
        logging.error(f"Error fetching lost items: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/items/found")
async def get_found_items():
    """Get all found items"""
    try:
        items = []
        docs = db.collection('items').where('type', '==', 'found').where('status', '==', 'active').stream()
        for doc in docs:
            item_data = doc.to_dict()
            items.append(item_data)
        return items
    except Exception as e:
        logging.error(f"Error fetching found items: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/items/{item_id}")
async def get_item(item_id: str):
    """Get item by ID"""
    try:
        doc = db.collection('items').document(item_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Item not found")
        return doc.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/items/{item_id}")
async def delete_item(item_id: str):
    """Delete an item"""
    try:
        db.collection('items').document(item_id).delete()
        return {"message": "Item deleted successfully"}
    except Exception as e:
        logging.error(f"Error deleting item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
>>>>>>> e17768b1f796c0c35dcd889004bc97173ab086fc
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD

# Helper Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    payload = {"user_id": user_id, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == "_id":
            result["id"] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        else:
            result[key] = value
    return result


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return serialize_doc(user)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Pydantic Models
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SelectRoleRequest(BaseModel):
    role: str = Field(..., pattern="^(OWNER|CUSTOMER)$")


class ListingCreate(BaseModel):
    title: str
    type: str
    price: float
    squareFeet: Optional[float] = None
    facilities: List[str] = []
    addressText: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    googleMapsLink: Optional[str] = None
    description: Optional[str] = ""
    bedrooms: Optional[int] = 1
    bathrooms: Optional[int] = 1
    images: List[str] = []
    status: str = "available"


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = ""


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None


class ConversationCreate(BaseModel):
    listingId: str
    ownerId: str


class MessageCreate(BaseModel):
    conversationId: str
    content: str


class WishlistAdd(BaseModel):
    listingId: str


class AIDescriptionRequest(BaseModel):
    title: str
    type: str
    location: str
    price: str
    facilities: str = "Basic amenities"


class BookingCreate(BaseModel):
    listingId: str
    message: str = ""


class OwnerProfileCreate(BaseModel):
    bio: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""
    businessName: Optional[str] = ""


# Routes

@app.get("/api")
async def health_check():
    return {"message": "RentEase API is running", "status": "healthy"}


# ============ AUTH ROUTES ============

@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    # Check if user exists
    existing = await db.users.find_one({"email": request.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists with this email")
    
    # Create user without role
    user_doc = {
        "name": request.name,
        "email": request.email.lower(),
        "password": hash_password(request.password),
        "role": None,
        "createdAt": datetime.now(timezone.utc)
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_token(user_id)
    
    return {
        "success": True,
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": user_id,
            "name": request.name,
            "email": request.email.lower(),
            "role": None
        },
        "requiresRoleSelection": True
    }


@app.post("/api/auth/login")
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email.lower()})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    user_id = str(user["_id"])
    token = create_token(user_id)
    
    return {
        "success": True,
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role")
        },
        "requiresRoleSelection": user.get("role") is None
    }


# ============ USER ROUTES ============

@app.get("/api/user/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "id": current_user["id"],
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user.get("role")
        },
        "requiresRoleSelection": current_user.get("role") is None
    }


@app.post("/api/user/select-role")
async def select_role(request: SelectRoleRequest, current_user: dict = Depends(get_current_user)):
    # Allow role change (removed the restriction)
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"role": request.role}}
    )
    
    return {
        "success": True,
        "message": "Role selected successfully",
        "user": {
            "id": current_user["id"],
            "name": current_user["name"],
            "email": current_user["email"],
            "role": request.role
        }
    }


# ============ LISTINGS ROUTES ============

@app.get("/api/listings")
async def get_listings(
    type: Optional[str] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    location: Optional[str] = None,
    status: Optional[str] = None
):
    query = {}
    
    if type:
        query["type"] = type
    if minPrice is not None:
        query["price"] = {"$gte": minPrice}
    if maxPrice is not None:
        if "price" in query:
            query["price"]["$lte"] = maxPrice
        else:
            query["price"] = {"$lte": maxPrice}
    if location:
        query["addressText"] = {"$regex": location, "$options": "i"}
    if status:
        query["status"] = status
    
    cursor = db.listings.find(query).sort("createdAt", -1)
    listings = []
    async for doc in cursor:
        listings.append(serialize_doc(doc))
    
    return {"success": True, "listings": listings}


@app.get("/api/listings/{listing_id}")
async def get_listing(listing_id: str):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        # Get owner info
        owner = await db.users.find_one({"_id": ObjectId(listing["ownerId"])})
        listing_data = serialize_doc(listing)
        
        if owner:
            listing_data["owner"] = {
                "id": str(owner["_id"]),
                "name": owner["name"],
                "email": owner["email"]
            }
        
        return {"success": True, "listing": listing_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/listings")
async def create_listing(request: ListingCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "OWNER":
        raise HTTPException(status_code=403, detail="Only owners can create listings")
    
    listing_doc = {
        "title": request.title,
        "type": request.type,
        "price": request.price,
        "squareFeet": request.squareFeet,
        "facilities": request.facilities,
        "addressText": request.addressText,
        "latitude": request.latitude,
        "longitude": request.longitude,
        "googleMapsLink": request.googleMapsLink,
        "description": request.description,
        "bedrooms": request.bedrooms,
        "bathrooms": request.bathrooms,
        "images": request.images,
        "status": request.status,
        "ownerId": current_user["id"],
        "ownerName": current_user["name"],
        "createdAt": datetime.now(timezone.utc)
    }
    
    result = await db.listings.insert_one(listing_doc)
    listing_doc["id"] = str(result.inserted_id)
    if "_id" in listing_doc:
        del listing_doc["_id"]
    
    return {"success": True, "listing": listing_doc, "message": "Listing created successfully"}


@app.put("/api/listings/{listing_id}")
async def update_listing(listing_id: str, request: ListingCreate, current_user: dict = Depends(get_current_user)):
    listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing["ownerId"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this listing")
    
    update_data = request.dict(exclude_unset=True)
    update_data["updatedAt"] = datetime.now(timezone.utc)
    
    await db.listings.update_one({"_id": ObjectId(listing_id)}, {"$set": update_data})
    
    return {"success": True, "message": "Listing updated successfully"}


@app.delete("/api/listings/{listing_id}")
async def delete_listing(listing_id: str, current_user: dict = Depends(get_current_user)):
    listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing["ownerId"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")
    
    await db.listings.delete_one({"_id": ObjectId(listing_id)})
    
    return {"success": True, "message": "Listing deleted successfully"}


# ============ OWNER ROUTES ============

@app.get("/api/owner/listings")
async def get_owner_listings(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "OWNER":
        raise HTTPException(status_code=403, detail="Only owners can access this")
    
    cursor = db.listings.find({"ownerId": current_user["id"]}).sort("createdAt", -1)
    listings = []
    async for doc in cursor:
        listings.append(serialize_doc(doc))
    
    return {"success": True, "listings": listings}


@app.get("/api/owner/profile")
async def get_owner_profile(current_user: dict = Depends(get_current_user)):
    profile = await db.owner_profiles.find_one({"userId": current_user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {"success": True, "profile": serialize_doc(profile)}


@app.post("/api/owner/profile")
async def create_owner_profile(request: OwnerProfileCreate, current_user: dict = Depends(get_current_user)):
    existing = await db.owner_profiles.find_one({"userId": current_user["id"]})
    
    profile_doc = {
        "userId": current_user["id"],
        "userName": current_user["name"],
        "userEmail": current_user["email"],
        "bio": request.bio,
        "phone": request.phone,
        "address": request.address,
        "businessName": request.businessName,
        "updatedAt": datetime.now(timezone.utc)
    }
    
    if existing:
        await db.owner_profiles.update_one({"userId": current_user["id"]}, {"$set": profile_doc})
        profile_doc["id"] = str(existing["_id"])
    else:
        profile_doc["createdAt"] = datetime.now(timezone.utc)
        result = await db.owner_profiles.insert_one(profile_doc.copy())
        profile_doc["id"] = str(result.inserted_id)
    
    # Remove _id if it exists (from insert_one)
    if "_id" in profile_doc:
        del profile_doc["_id"]
    
    # Convert datetime to string for JSON serialization
    if "createdAt" in profile_doc:
        profile_doc["createdAt"] = profile_doc["createdAt"].isoformat()
    if "updatedAt" in profile_doc:
        profile_doc["updatedAt"] = profile_doc["updatedAt"].isoformat()
    
    return {"success": True, "profile": profile_doc}


# ============ REVIEWS ROUTES ============

@app.get("/api/reviews/{property_id}")
async def get_reviews(property_id: str):
    cursor = db.reviews.find({"propertyId": property_id}).sort("createdAt", -1)
    reviews = []
    async for doc in cursor:
        reviews.append(serialize_doc(doc))
    
    # Calculate stats
    total_reviews = len(reviews)
    avg_rating = 0
    if total_reviews > 0:
        avg_rating = sum(r["rating"] for r in reviews) / total_reviews
    
    return {
        "success": True,
        "reviews": reviews,
        "stats": {
            "totalReviews": total_reviews,
            "averageRating": round(avg_rating, 1)
        }
    }


@app.post("/api/reviews/{property_id}")
async def create_review(property_id: str, request: ReviewCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "CUSTOMER":
        raise HTTPException(status_code=403, detail="Only customers can write reviews")
    
    # Check if user already reviewed this property
    existing = await db.reviews.find_one({
        "propertyId": property_id,
        "userId": current_user["id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this property")
    
    # Check if trying to review own property
    listing = await db.listings.find_one({"_id": ObjectId(property_id)})
    if listing and listing.get("ownerId") == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot review your own property")
    
    review_doc = {
        "propertyId": property_id,
        "userId": current_user["id"],
        "userName": current_user["name"],
        "rating": request.rating,
        "comment": request.comment,
        "createdAt": datetime.now(timezone.utc)
    }
    
    result = await db.reviews.insert_one(review_doc)
    review_doc["id"] = str(result.inserted_id)
    
    return {"success": True, "review": serialize_doc(review_doc)}


@app.put("/api/reviews/{review_id}")
async def update_review(review_id: str, request: ReviewUpdate, current_user: dict = Depends(get_current_user)):
    review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review["userId"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this review")
    
    update_data = {}
    if request.rating is not None:
        update_data["rating"] = request.rating
    if request.comment is not None:
        update_data["comment"] = request.comment
    update_data["updatedAt"] = datetime.now(timezone.utc)
    
    await db.reviews.update_one({"_id": ObjectId(review_id)}, {"$set": update_data})
    
    return {"success": True, "message": "Review updated successfully"}


@app.delete("/api/reviews/{review_id}")
async def delete_review(review_id: str, current_user: dict = Depends(get_current_user)):
    review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review["userId"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")
    
    await db.reviews.delete_one({"_id": ObjectId(review_id)})
    
    return {"success": True, "message": "Review deleted successfully"}


# ============ CONVERSATIONS ROUTES ============

@app.get("/api/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    query = {"$or": [
        {"customerId": current_user["id"]},
        {"ownerId": current_user["id"]}
    ]}
    
    cursor = db.conversations.find(query).sort("updatedAt", -1)
    conversations = []
    async for doc in cursor:
        conv = serialize_doc(doc)
        # Get last message
        last_msg = await db.messages.find_one(
            {"conversationId": str(doc["_id"])},
            sort=[("createdAt", -1)]
        )
        conv["lastMessage"] = serialize_doc(last_msg) if last_msg else None
        conversations.append(conv)
    
    return {"success": True, "conversations": conversations}


@app.post("/api/conversations")
async def create_conversation(request: ConversationCreate, current_user: dict = Depends(get_current_user)):
    # Check if conversation already exists
    existing = await db.conversations.find_one({
        "listingId": request.listingId,
        "customerId": current_user["id"],
        "ownerId": request.ownerId
    })
    
    if existing:
        return {"success": True, "conversation": serialize_doc(existing), "existing": True}
    
    # Get listing info
    listing = await db.listings.find_one({"_id": ObjectId(request.listingId)})
    owner = await db.users.find_one({"_id": ObjectId(request.ownerId)})
    
    conv_doc = {
        "listingId": request.listingId,
        "listingTitle": listing["title"] if listing else "Unknown",
        "customerId": current_user["id"],
        "customerName": current_user["name"],
        "ownerId": request.ownerId,
        "ownerName": owner["name"] if owner else "Unknown",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc)
    }
    
    result = await db.conversations.insert_one(conv_doc)
    conv_doc["id"] = str(result.inserted_id)
    
    return {"success": True, "conversation": serialize_doc(conv_doc)}


@app.get("/api/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    conv = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conv["customerId"] != current_user["id"] and conv["ownerId"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return {"success": True, "conversation": serialize_doc(conv)}


# ============ MESSAGES ROUTES ============

@app.get("/api/messages/{conversation_id}")
async def get_messages(conversation_id: str, current_user: dict = Depends(get_current_user)):
    conv = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conv["customerId"] != current_user["id"] and conv["ownerId"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    cursor = db.messages.find({"conversationId": conversation_id}).sort("createdAt", 1)
    messages = []
    async for doc in cursor:
        messages.append(serialize_doc(doc))
    
    return {"success": True, "messages": messages}


@app.post("/api/messages")
async def create_message(request: MessageCreate, current_user: dict = Depends(get_current_user)):
    conv = await db.conversations.find_one({"_id": ObjectId(request.conversationId)})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conv["customerId"] != current_user["id"] and conv["ownerId"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    msg_doc = {
        "conversationId": request.conversationId,
        "senderId": current_user["id"],
        "senderName": current_user["name"],
        "content": request.content,
        "createdAt": datetime.now(timezone.utc)
    }
    
    result = await db.messages.insert_one(msg_doc)
    msg_doc["id"] = str(result.inserted_id)
    
    # Update conversation timestamp
    await db.conversations.update_one(
        {"_id": ObjectId(request.conversationId)},
        {"$set": {"updatedAt": datetime.now(timezone.utc)}}
    )
    
    return {"success": True, "message": serialize_doc(msg_doc)}


# ============ WISHLIST ROUTES ============

@app.get("/api/wishlist")
async def get_wishlist(current_user: dict = Depends(get_current_user)):
    cursor = db.wishlist.find({"userId": current_user["id"]})
    items = []
    async for doc in cursor:
        # Get listing details
        listing = await db.listings.find_one({"_id": ObjectId(doc["listingId"])})
        item = serialize_doc(doc)
        item["listing"] = serialize_doc(listing) if listing else None
        items.append(item)
    
    return {"success": True, "wishlist": items}


@app.post("/api/wishlist")
async def add_to_wishlist(request: WishlistAdd, current_user: dict = Depends(get_current_user)):
    # Check if already in wishlist
    existing = await db.wishlist.find_one({
        "userId": current_user["id"],
        "listingId": request.listingId
    })
    
    if existing:
        return {"success": True, "message": "Already in wishlist", "existing": True}
    
    doc = {
        "userId": current_user["id"],
        "listingId": request.listingId,
        "createdAt": datetime.now(timezone.utc)
    }
    
    result = await db.wishlist.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    
    return {"success": True, "message": "Added to wishlist"}


@app.delete("/api/wishlist/{listing_id}")
async def remove_from_wishlist(listing_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.wishlist.delete_one({
        "userId": current_user["id"],
        "listingId": listing_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")
    
    return {"success": True, "message": "Removed from wishlist"}


# ============ AI ROUTES ============

@app.post("/api/ai/generate-description")
async def generate_description(request: AIDescriptionRequest, current_user: dict = Depends(get_current_user)):
    try:
        import google.generativeai as genai
        
        # Get Gemini API key from environment variable
        gemini_api_key = os.environ.get("GEMINI_API_KEY")
        if not gemini_api_key:
            raise HTTPException(status_code=500, detail="AI service not configured. Please add GEMINI_API_KEY to .env file.")
        
        # Configure Gemini
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""You are a professional real estate copywriter. Write a compelling, attractive property description that highlights key features and appeals to potential renters. Keep the description around 150 words.

Property Details:
- Title: {request.title}
- Type: {request.type}
- Location: {request.location}
- Price: {request.price}
- Facilities: {request.facilities}

Write an engaging property description:"""
        
        response = model.generate_content(prompt)
        
        return {"success": True, "description": response.text}
    except Exception as e:
        print(f"AI generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate description: {str(e)}")


# ============ BOOKINGS ROUTES ============

@app.get("/api/bookings")
async def get_bookings(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") == "OWNER":
        # Get bookings for owner's listings
        listings = await db.listings.find({"ownerId": current_user["id"]}).to_list(None)
        listing_ids = [str(l["_id"]) for l in listings]
        query = {"listingId": {"$in": listing_ids}}
    else:
        query = {"customerId": current_user["id"]}
    
    cursor = db.bookings.find(query).sort("createdAt", -1)
    bookings = []
    async for doc in cursor:
        booking = serialize_doc(doc)
        listing = await db.listings.find_one({"_id": ObjectId(doc["listingId"])})
        booking["listing"] = serialize_doc(listing) if listing else None
        bookings.append(booking)
    
    return {"success": True, "bookings": bookings}


@app.post("/api/bookings")
async def create_booking(request: BookingCreate, current_user: dict = Depends(get_current_user)):
    # Get listing details
    listing = await db.listings.find_one({"_id": ObjectId(request.listingId)})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Check if user is owner of the listing
    if str(listing["ownerId"]) == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot book your own property")
    
    # Check if booking already exists
    existing = await db.bookings.find_one({
        "customerId": current_user["id"],
        "listingId": request.listingId,
        "status": {"$in": ["pending", "confirmed"]}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="You already have a booking request for this property")
    
    # Create booking
    booking_doc = {
        "customerId": current_user["id"],
        "customerName": current_user["name"],
        "customerEmail": current_user["email"],
        "listingId": request.listingId,
        "ownerId": str(listing["ownerId"]),
        "message": request.message,
        "status": "pending",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc)
    }
    
    result = await db.bookings.insert_one(booking_doc)
    booking_doc["id"] = str(result.inserted_id)
    
    # Remove _id for JSON serialization
    if "_id" in booking_doc:
        del booking_doc["_id"]
    
    # Convert datetime to string
    if "createdAt" in booking_doc:
        booking_doc["createdAt"] = booking_doc["createdAt"].isoformat()
    if "updatedAt" in booking_doc:
        booking_doc["updatedAt"] = booking_doc["updatedAt"].isoformat()
    
    return {"success": True, "message": "Booking request sent successfully", "booking": booking_doc}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
=======
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
>>>>>>> e17768b1f796c0c35dcd889004bc97173ab086fc
