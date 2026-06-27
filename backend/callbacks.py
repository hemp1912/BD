import os
import json
import urllib.parse
import httpx
from typing import Optional
from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel
from backend.db_client import db_client
from backend.auth import require_admin
from backend import config

router = APIRouter(prefix="/api/callbacks", tags=["callbacks"])

class CallbackSchema(BaseModel):
    name: str
    phone: str
    date: Optional[str] = ""
    event_date: Optional[str] = ""
    venue: Optional[str] = ""
    service: Optional[str] = ""
    budget: Optional[str] = ""
    message: Optional[str] = ""

class CallbackUpdateSchema(BaseModel):
    status: str

async def send_telegram_notification(name: str, phone: str, date: str, venue: str, service: str, message: str):
    token = config.TELEGRAM_BOT_TOKEN
    chat_id = config.TELEGRAM_CHAT_ID
    if not token or not chat_id:
        print("[*] Telegram notification skipped: credentials missing.")
        return
        
    text = (
        f"🚨 *New Callback/Enquiry Request* 🚨\n\n"
        f"👤 *Name:* {name}\n"
        f"📞 *Phone:* {phone}\n"
        f"📅 *Date:* {date or 'Not specified'}\n"
        f"📍 *Venue:* {venue or 'Not specified'}\n"
        f"✨ *Service:* {service or 'Not specified'}\n"
        f"💬 *Message:* {message or 'None'}"
    )
    
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(url, json=payload, timeout=5.0)
            if res.status_code != 200:
                print(f"[!] Telegram notification failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"[!] Telegram notification error: {e}")

async def send_whatsapp_confirmation(to_phone: str, client_name: str, event_date: str, service: str):
    phone_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
    access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
    
    if not phone_id or not access_token:
        print("[*] WhatsApp Auto-Reply skipped: WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN not set.")
        return
        
    # Format target phone number. Business API requires country code without '+'
    # Remove non-digits and leading + or 00
    cleaned_phone = "".join(filter(str.isdigit, to_phone))
    if not cleaned_phone.startswith("91") and len(cleaned_phone) == 10:
        cleaned_phone = "91" + cleaned_phone
        
    url = f"https://graph.facebook.com/v17.0/{phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": cleaned_phone,
        "type": "template",
        "template": {
            "name": "enquiry_acknowledgement", # Template name to register in Meta Developer Dashboard
            "language": {
                "code": "en_US"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": client_name},
                        {"type": "text", "text": event_date or "your chosen date"},
                        {"type": "text", "text": service or "Wedding Decoration"}
                    ]
                }
            ]
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(url, json=payload, headers=headers, timeout=5.0)
            if res.status_code in (200, 201):
                print(f"[+] WhatsApp confirmation successfully sent to {cleaned_phone}")
            else:
                print(f"[!] WhatsApp API returned error: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"[!] WhatsApp Auto-Reply failed to dispatch: {e}")

@router.post("")
async def create_callback(callback: CallbackSchema):
    callback_data = callback.model_dump()
    
    # Map event_date -> date if event_date is provided and date is empty
    if not callback_data.get("date") and callback_data.get("event_date"):
        callback_data["date"] = callback_data["event_date"]
        
    # Append budget to message if provided
    if callback_data.get("budget"):
        budget_str = f"[Budget: {callback_data['budget']}]"
        if callback_data.get("message"):
            callback_data["message"] = f"{budget_str} {callback_data['message']}"
        else:
            callback_data["message"] = budget_str
            
    # Clean model output to match Appwrite attributes
    db_payload = {
        "name": callback_data.get("name"),
        "phone": callback_data.get("phone"),
        "date": callback_data.get("date", ""),
        "venue": callback_data.get("venue", ""),
        "service": callback_data.get("service", ""),
        "message": callback_data.get("message", ""),
        "status": callback_data.get("status", "Pending")
    }
    
    created = await db_client.create_callback(db_payload)
    
    # 1. Dispatch Telegram message notification
    await send_telegram_notification(
        name=db_payload["name"],
        phone=db_payload["phone"],
        date=db_payload["date"],
        venue=db_payload["venue"],
        service=db_payload["service"],
        message=db_payload["message"]
    )
    
    # 2. Dispatch WhatsApp acknowledgement confirmation
    await send_whatsapp_confirmation(
        to_phone=db_payload["phone"],
        client_name=db_payload["name"],
        event_date=db_payload["date"],
        service=db_payload["service"]
    )
    
    # 3. Generate WhatsApp deep link for the client redirection on frontend
    business_number = "919876543210" # Default WhatsApp support line
    whatsapp_text = f"Hi Bhoomi Decoration, I submitted an enquiry for {db_payload['date'] or 'my event'} at {db_payload['venue'] or 'my venue'}."
    encoded_text = urllib.parse.quote(whatsapp_text)
    wa_link = f"https://wa.me/{business_number}?text={encoded_text}"
    
    return {
        "status": "success",
        "callback": created,
        "whatsapp_link": wa_link
    }

@router.get("")
async def get_callbacks(request: Request):
    await require_admin(request)
    callbacks = await db_client.get_callbacks()
    # Sort callbacks newest first.
    # Since Appwrite list returns them, let's reverse them or sort them.
    # Assuming the DB returns them in insert order, reversing yields newest first.
    return list(reversed(callbacks))

@router.patch("/{id}")
async def update_callback(request: Request, id: str, status_payload: CallbackUpdateSchema):
    await require_admin(request)
    existing = await db_client.get_callbacks()
    target = None
    for cb in existing:
        if cb["id"] == id:
            target = cb
            break
            
    if not target:
        raise HTTPException(status_code=404, detail="Callback request not found")
        
    target["status"] = status_payload.status
    updated = await db_client.update_callback(id, target)
    return updated
