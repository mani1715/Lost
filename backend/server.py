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
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)