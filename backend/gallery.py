import os
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Request, HTTPException, Form, File, UploadFile
from pydantic import BaseModel
from appwrite.input_file import InputFile
from backend import config
from backend.db_client import db_client
from backend.auth import require_admin

router = APIRouter(prefix="/api", tags=["gallery"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class GalleryUpdateSchema(BaseModel):
    title: str
    category: str
    description: Optional[str] = ""
    image_url: str
    event_id: Optional[str] = ""

@router.get("/gallery")
async def get_gallery(
    page: Optional[int] = None,
    limit: int = 10,
    search: Optional[str] = None,
    event_id: Optional[str] = None
):
    if page is not None:
        res = await db_client.get_gallery(page=page, limit=limit, search=search)
        if event_id:
            res["items"] = [item for item in res["items"] if item.get("event_id") == event_id]
            res["total"] = len(res["items"])
        return res
    
    res = await db_client.get_gallery()
    if event_id:
        res = [item for item in res if item.get("event_id") == event_id]
    return res

@router.post("/gallery")
async def create_gallery_item(
    request: Request,
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    event_id: str = Form(""),
    file: UploadFile = File(...)
):
    await require_admin(request)
    
    import anyio
    import asyncio

    if config.DB_TYPE == "APPWRITE":
        try:
            temp_path = os.path.join(UPLOAD_DIR, f"temp_{file.filename}")
            async with await anyio.open_file(temp_path, "wb") as f:
                await f.write(await file.read())
            
            res = await asyncio.to_thread(
                db_client.storage.create_file,
                config.APPWRITE_STORAGE_BUCKET_ID,
                "unique()",
                InputFile.from_path(temp_path)
            )
            # Remove file asynchronously or in a worker thread
            await asyncio.to_thread(os.remove, temp_path)
            
            file_id = res.id if hasattr(res, "id") else res["$id"]
            image_url = f"{config.APPWRITE_ENDPOINT}/storage/buckets/{config.APPWRITE_STORAGE_BUCKET_ID}/files/{file_id}/view?project={config.APPWRITE_PROJECT_ID}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Appwrite storage upload failed: {e}")
    else:
        filename = f"gal_{int(datetime.now().timestamp())}_{file.filename}"
        dest_path = os.path.join(UPLOAD_DIR, filename)
        async with await anyio.open_file(dest_path, "wb") as f:
            await f.write(await file.read())
        image_url = f"/static/uploads/{filename}"
        
    item_data = {
        "title": title.strip(),
        "category": category.strip(),
        "description": description.strip(),
        "image_url": image_url,
        "event_id": event_id.strip()
    }
    return await db_client.create_gallery_item(item_data)

@router.put("/gallery/{photo_id}")
async def update_gallery_item(request: Request, photo_id: str, item: GalleryUpdateSchema):
    await require_admin(request)
    res = await db_client.update_gallery_item(photo_id, item.model_dump())
    if not res:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return res

@router.delete("/gallery/{photo_id}")
async def delete_gallery_item(request: Request, photo_id: str):
    await require_admin(request)
    
    item = await db_client.get_gallery_item(photo_id)
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    
    image_url = item.get("image_url", "")
    if config.DB_TYPE == "APPWRITE" and hasattr(db_client, "storage") and "/storage/buckets/" in image_url and "/files/" in image_url:
        try:
            parts = image_url.split("/files/")
            if len(parts) > 1:
                file_id = parts[1].split("/")[0]
                db_client.storage.delete_file(
                    config.APPWRITE_STORAGE_BUCKET_ID,
                    file_id
                )
                print(f"[+] Successfully deleted file {file_id} from Appwrite storage bucket {config.APPWRITE_STORAGE_BUCKET_ID}")
        except Exception as e:
            print(f"[!] Warning: Failed to delete file from Appwrite Storage: {e}")
            
    res = await db_client.delete_gallery_item(photo_id)
    if not res:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return {"status": "success"}
