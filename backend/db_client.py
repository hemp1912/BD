from backend import config

class BaseDB:
    # Inventory
    async def get_inventory(self, page=None, limit=10, search=None): raise NotImplementedError
    async def get_inventory_item(self, item_id: str): raise NotImplementedError
    async def create_inventory_item(self, item: dict): raise NotImplementedError
    async def update_inventory_item(self, item_id: str, item: dict): raise NotImplementedError
    async def delete_inventory_item(self, item_id: str): raise NotImplementedError

    # Clients
    async def get_clients(self, page=None, limit=10, search=None): raise NotImplementedError
    async def create_client(self, client: dict): raise NotImplementedError
    async def update_client(self, client_id: str, client: dict): raise NotImplementedError
    async def delete_client(self, client_id: str): raise NotImplementedError

    # Gallery
    async def get_gallery(self, page=None, limit=10, search=None): raise NotImplementedError
    async def get_gallery_item(self, photo_id: str): raise NotImplementedError
    async def create_gallery_item(self, item: dict): raise NotImplementedError
    async def update_gallery_item(self, photo_id: str, item: dict): raise NotImplementedError
    async def delete_gallery_item(self, photo_id: str): raise NotImplementedError

    # Crew
    async def get_crew(self, page=None, limit=10, search=None): raise NotImplementedError
    async def create_crew_member(self, member: dict): raise NotImplementedError
    async def update_crew_member(self, crew_id: str, member: dict): raise NotImplementedError
    async def delete_crew_member(self, crew_id: str): raise NotImplementedError

    # Events
    async def get_events(self, page=None, limit=10, search=None, status=None): raise NotImplementedError
    async def get_event(self, event_id: str): raise NotImplementedError
    async def create_event(self, event: dict): raise NotImplementedError
    async def update_event(self, event_id: str, event: dict): raise NotImplementedError
    async def delete_event(self, event_id: str): raise NotImplementedError

    # Tasks
    async def get_tasks(self): raise NotImplementedError
    async def get_tasks_for_event(self, event_id: str): raise NotImplementedError
    async def create_task(self, task: dict): raise NotImplementedError
    async def update_task(self, task_id: str, task: dict): raise NotImplementedError
    async def delete_task(self, task_id: str): raise NotImplementedError

    # Users
    async def get_users(self): raise NotImplementedError
    async def get_user_by_email(self, email: str): raise NotImplementedError
    async def create_user(self, user: dict): raise NotImplementedError

    # Attendance
    async def get_attendance(self, date_str: str): raise NotImplementedError
    async def get_attendance_record(self, date_str: str, crew_id: str): raise NotImplementedError
    async def save_attendance_record(self, date_str: str, crew_id: str, record: dict): raise NotImplementedError
    async def get_all_attendance(self): raise NotImplementedError

# Factory to get database client
from backend.db.appwrite_db import AppwriteDB
db_client = AppwriteDB()
