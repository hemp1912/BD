from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel
from typing import List
from backend.db_client import db_client
from backend.auth import require_admin
from backend.limiter import limiter

router = APIRouter(prefix="/api", tags=["testimonials"])

class TestimonialSchema(BaseModel):
    name: str
    rating: int
    review: str
    approved: bool = False

@router.post("/testimonials")
@limiter.limit("3/minute")
async def create_testimonial(request: Request, payload: TestimonialSchema):
    if not payload.name or not payload.review:
        raise HTTPException(status_code=400, detail="Name and review message are required.")
    if not (1 <= payload.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
        
    data = payload.model_dump()
    created = await db_client.create_testimonial(data)
    return {"status": "success", "testimonial": created}

@router.get("/testimonials")
async def get_approved_testimonials():
    all_t = await db_client.get_testimonials()
    # Filter only approved ones
    approved = [t for t in all_t if t.get("approved") is True]
    return approved

@router.get("/admin/testimonials")
async def admin_get_all_testimonials(request: Request):
    await require_admin(request)
    all_t = await db_client.get_testimonials()
    return all_t

@router.put("/admin/testimonials/{test_id}/approve")
async def admin_toggle_testimonial_approval(test_id: str, request: Request):
    await require_admin(request)
    all_t = await db_client.get_testimonials()
    target = None
    for t in all_t:
        if t.get("id") == test_id:
            target = t
            break
    if not target:
        raise HTTPException(status_code=404, detail="Testimonial not found.")
        
    target["approved"] = not target.get("approved", False)
    updated = await db_client.update_testimonial(test_id, target)
    return {"status": "success", "testimonial": updated}

@router.delete("/admin/testimonials/{test_id}")
async def admin_delete_testimonial(test_id: str, request: Request):
    await require_admin(request)
    await db_client.delete_testimonial(test_id)
    return {"status": "success", "message": "Testimonial successfully deleted."}
