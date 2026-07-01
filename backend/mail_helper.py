import smtplib
import json
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import Request
from backend import config

async def get_event_email_context(event: dict, request: Optional[Request] = None):
    from backend.db_client import db_client
    
    client_name = event.get("client_name") or "Valued Client"
    try:
        client_data = await db_client.get_client(event.get("client_id"))
        client_email = client_data.get("email") if client_data else (event.get("client_email") or "")
    except Exception:
        client_email = event.get("client_email") or ""
        
    portal_token = event.get("portal_token") or ""
    origin = "http://localhost:8000"
    if request:
        origin = str(request.base_url).rstrip("/")
        
    portal_url = f"{origin}/portal/{portal_token}" if portal_token else ""
    
    return client_email, {
        "client_name": client_name,
        "portal_url": portal_url,
        "total": f"{float(event.get('total_invoice_amount') or 0.0):.2f}",
        "paid": f"{float(event.get('amount_paid') or 0.0):.2f}",
        "remaining": f"{float(event.get('remaining_balance') or 0.0):.2f}",
        "event_id": event.get("id") or "",
        "venue_address": event.get("venue_address") or "",
        "start_date": event.get("start_date") or "",
        "end_date": event.get("end_date") or ""
    }

async def send_system_email(to_email: str, email_type: str, context: dict):
    from backend.db_client import db_client
    try:
        settings = await db_client.get_settings()
    except Exception as e:
        print(f"Error fetching settings from database: {e}")
        settings = {}

    # Check if automatic emails are disabled (for confirmation and completed emails only)
    if email_type in ["confirmation", "completed"]:
        enable_auto_emails = settings.get("enable_auto_emails")
        if enable_auto_emails is False:
            print(f"Automatic emails are disabled. Skipping {email_type} email to {to_email}.")
            return False

    import os
    if os.getenv("TESTING") == "true" or os.getenv("DISABLE_EMAIL") == "true":
        print(f"[TESTING] Mock SMTP: Simulated sending {email_type} email to {to_email}.")
        return True
        
    smtp_host = settings.get("smtp_host") or "smtp.gmail.com"
    smtp_port = settings.get("smtp_port") or 587
    smtp_user = settings.get("smtp_user")
    smtp_pass = settings.get("smtp_pass")
    
    if not smtp_host or not smtp_user or not smtp_pass:
        print(f"SMTP Server not fully configured in settings database. Skipping {email_type} email.")
        return False
        
    subject_tpl = ""
    body_tpl = ""
    
    if email_type == "portal":
        subject_tpl = settings.get("email_subject") or "Bhoomi Decoration Event Portal & Invoice — {client_name}"
        body_tpl = settings.get("email_body") or "Hi {client_name},\n\nThank you for choosing Bhoomi Decoration.\n\nHere is your Bhoomi Decoration Event Portal link to track payments, designs and invoices:\n{portal_url}\n\nInvoice Details:\n- Invoice Total: ₹{total}\n- Amount Paid: ₹{paid}\n- Remaining Balance: ₹{remaining}\n\nBest regards,\nBhoomi Decoration Team"
    elif email_type == "confirmation":
        subject_tpl = settings.get("confirm_email_subject") or "Event Booking Confirmed — Bhoomi Decoration"
        body_tpl = settings.get("confirm_email_body") or "Dear {client_name},\n\nWe are delighted to confirm your event booking with Bhoomi Decoration.\n\nBooking Details:\n- Event ID: {event_id}\n- Venue: {venue_address}\n- Dates: {start_date} to {end_date}\n\nYou can track the live progress and uploads here:\n{portal_url}\n\nThank you,\nBhoomi Decoration Team"
    elif email_type == "completed":
        subject_tpl = settings.get("completed_email_subject") or "Thank You from Bhoomi Decoration!"
        body_tpl = settings.get("completed_email_body") or "Dear {client_name},\n\nWe want to say a big thank you for choosing Bhoomi Decoration for your recent event.\n\nIt was our pleasure assisting you. You can review your final invoice and download a PDF copy from your portal: {portal_url}\n\nBest regards,\nBhoomi Decoration Team"
    elif email_type == "reminder":
        subject_tpl = settings.get("reminder_email_subject") or "Payment Reminder — Outstanding Balance for Event at {venue_address}"
        body_tpl = settings.get("reminder_email_body") or "Dear {client_name},\n\nThis is a friendly reminder that there is an outstanding balance of ₹{remaining} due for your upcoming event booking with Bhoomi Decoration.\n\nEvent Details:\n- Event ID: {event_id}\n- Venue: {venue_address}\n- Dates: {start_date} to {end_date}\n\nYou can review your invoice and make payments through your portal link here:\n{portal_url}\n\nThank you,\nBhoomi Decoration Team"
        
        
    # Replace placeholders
    subject = subject_tpl
    body = body_tpl
    for k, v in context.items():
        placeholder = f"{{{k}}}"
        subject = subject.replace(placeholder, str(v))
        body = body.replace(placeholder, str(v))
        
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(smtp_host, int(smtp_port))
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, to_email, msg.as_string())
        server.quit()
        print(f"Successfully dispatched {email_type} email to {to_email}.")
        return True
    except Exception as e:
        print(f"Failed to send {email_type} email: {e}")
        return False
