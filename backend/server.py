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
    allow_methods=["*"],
    allow_headers=["*"],
)


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
