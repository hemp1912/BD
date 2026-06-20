import os
import json
import uuid
from backend.db_client import BaseDB

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

class MockDB(BaseDB):
    def __init__(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        self.inventory_path = os.path.join(DATA_DIR, "inventory.json")
        self.clients_path = os.path.join(DATA_DIR, "clients.json")
        self.events_path = os.path.join(DATA_DIR, "events.json")
        self.tasks_path = os.path.join(DATA_DIR, "tasks.json")
        self.users_path = os.path.join(DATA_DIR, "users.json")
        self.gallery_path = os.path.join(DATA_DIR, "gallery.json")
        self.crew_path = os.path.join(DATA_DIR, "crew.json")
        self._init_files()

    def _init_files(self):
        # Seed Inventory
        if not os.path.exists(self.inventory_path):
            seed_inventory = [
                {"id": "inv_1", "name": "LED Uplights (RGBW)", "category": "Lighting", "quantity_owned": 40, "rental_price_per_day": 15.00},
                {"id": "inv_2", "name": "Fairy Light String 50ft", "category": "Lighting", "quantity_owned": 30, "rental_price_per_day": 10.00},
                {"id": "inv_3", "name": "White Velvet Drapery (10x10ft)", "category": "Drapery", "quantity_owned": 12, "rental_price_per_day": 45.00},
                {"id": "inv_4", "name": "Luxury Silk Flower Arch (Gold Frame)", "category": "Floral", "quantity_owned": 3, "rental_price_per_day": 150.00},
                {"id": "inv_5", "name": "Royal Velvet Love Seat (Emerald)", "category": "Furniture", "quantity_owned": 2, "rental_price_per_day": 180.00},
                {"id": "inv_6", "name": "Gold Banquet Chairs", "category": "Furniture", "quantity_owned": 150, "rental_price_per_day": 4.50}
            ]
            self._write_file(self.inventory_path, seed_inventory)

        # Seed Clients
        if not os.path.exists(self.clients_path):
            seed_clients = [
                {"id": "cli_1", "name": "Samantha Miller", "email": "samantha.m@example.com", "phone": "415-555-2671", "address": "St. Regis Ballroom, San Francisco"},
                {"id": "cli_2", "name": "Arthur Pendelton", "email": "arthur.p@example.com", "phone": "650-555-8912", "address": "Filoli Historic House & Garden, Woodside"}
            ]
            self._write_file(self.clients_path, seed_clients)

        # Seed Events
        if not os.path.exists(self.events_path):
            seed_events = [
                {
                    "id": "evt_1",
                    "client_id": "cli_1",
                    "client_name": "Samantha Miller",
                    "venue_address": "St. Regis Ballroom, SF",
                    "start_date": "2026-07-10",
                    "end_date": "2026-07-12",
                    "status": "Confirmed",
                    "design_layout_url": "/static/seed_layout_1.jpg",
                    "items_booked": json.dumps({"inv_1": 20, "inv_3": 6, "inv_4": 1, "inv_5": 1, "inv_6": 80}),
                    "total_invoice_amount": 1170.00,
                    "amount_paid": 600.00,
                    "remaining_balance": 570.00,
                    "crew_assignments": json.dumps([
                        {"worker_id": "usr_labor_1", "name": "Marcus Chen", "pay_rate": 150.00, "paid": False},
                        {"worker_id": "usr_labor_2", "name": "David Miller", "pay_rate": 150.00, "paid": True}
                    ]),
                    "payment_history": json.dumps([
                        {"amount": 600.00, "payment_method": "Cash", "received_at": "2026-07-01T09:00:00Z"}
                    ]),
                    "max_workforce_capacity": 4,
                    "notes": "Ensure drapery structures are reinforced. Uplights should match client theme color (rose gold)."
                }
            ]
            self._write_file(self.events_path, seed_events)

        # Seed Tasks
        if not os.path.exists(self.tasks_path):
            seed_tasks = [
                {"id": "tsk_1", "event_id": "evt_1", "description": "Set up 20 LED Uplights and configure to Rose Gold hue", "status": "Pending", "assigned_to": "usr_labor_1"},
                {"id": "tsk_2", "event_id": "evt_1", "description": "Install Flower Arch at center stage backdrop", "status": "Completed", "assigned_to": "usr_labor_2"},
                {"id": "tsk_3", "event_id": "evt_1", "description": "Position Velvet Love Seat and arrange 80 Gold Banquet Chairs", "status": "Pending", "assigned_to": "usr_labor_1"},
                {"id": "tsk_4", "event_id": "evt_1", "description": "Hang White Velvet Drapery behind head table", "status": "Completed", "assigned_to": "usr_labor_2"}
            ]
            self._write_file(self.tasks_path, seed_tasks)

        # Seed Users
        if not os.path.exists(self.users_path):
            seed_users = [
                {"id": "usr_admin", "email": "hello@bhoomidecoration.com", "password": "admin123", "role": "admin", "full_name": "Admin Manager", "base_daily_rate": 0.0},
                {"id": "usr_labor_1", "email": "crew1@bhoomidecoration.com", "password": "crew123", "role": "labor", "full_name": "Marcus Chen", "base_daily_rate": 150.0},
                {"id": "usr_labor_2", "email": "crew2@bhoomidecoration.com", "password": "crew123", "role": "labor", "full_name": "David Miller", "base_daily_rate": 150.0}
            ]
            self._write_file(self.users_path, seed_users)

        # Seed Gallery
        if not os.path.exists(self.gallery_path):
            seed_gallery = [
                {"id": "gal_1", "title": "Haldi Mandap", "category": "Floral", "description": "Beautiful marigold mandap with traditional canopy decoration.", "image_url": "/static/seed_layout_1.jpg"},
                {"id": "gal_2", "title": "Sangeet Lighting Setup", "category": "Lighting", "description": "Warm yellow lighting combined with RGB uplighting.", "image_url": "/static/seed_layout_1.jpg"}
            ]
            self._write_file(self.gallery_path, seed_gallery)

        # Seed Crew
        if not os.path.exists(self.crew_path):
            seed_crew = [
                {"id": "crw_1", "name": "Marcus Chen", "role": "Lighting Specialist", "contact": "9876543210", "base_rate": 150.0, "amount_owed": 300.0, "payment_history": "[]"},
                {"id": "crw_2", "name": "David Miller", "role": "Carpentry Specialist", "contact": "9876543211", "base_rate": 180.0, "amount_owed": 0.0, "payment_history": "[]"}
            ]
            self._write_file(self.crew_path, seed_crew)

    def _read_file(self, file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _write_file(self, file_path, data):
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

    # Inventory Operations
    async def get_inventory(self):
        return self._read_file(self.inventory_path)

    async def get_inventory_item(self, item_id: str):
        items = self._read_file(self.inventory_path)
        for item in items:
            if item["id"] == item_id:
                return item
        return None

    async def create_inventory_item(self, item: dict):
        items = self._read_file(self.inventory_path)
        item["id"] = "inv_" + str(uuid.uuid4())[:8]
        items.append(item)
        self._write_file(self.inventory_path, items)
        return item

    async def update_inventory_item(self, item_id: str, item: dict):
        items = self._read_file(self.inventory_path)
        for i, it in enumerate(items):
            if it["id"] == item_id:
                item["id"] = item_id
                items[i] = item
                self._write_file(self.inventory_path, items)
                return item
        return None

    async def delete_inventory_item(self, item_id: str):
        items = self._read_file(self.inventory_path)
        filtered = [it for it in items if it["id"] != item_id]
        if len(filtered) < len(items):
            self._write_file(self.inventory_path, filtered)
            return True
        return False

    # Client Operations
    async def get_clients(self):
        return self._read_file(self.clients_path)

    async def create_client(self, client: dict):
        clients = self._read_file(self.clients_path)
        client["id"] = "cli_" + str(uuid.uuid4())[:8]
        clients.append(client)
        self._write_file(self.clients_path, clients)
        return client

    async def update_client(self, client_id: str, client: dict):
        clients = self._read_file(self.clients_path)
        for i, c in enumerate(clients):
            if c["id"] == client_id:
                client["id"] = client_id
                clients[i] = client
                self._write_file(self.clients_path, clients)
                return client
        return None

    # Event Operations
    async def get_events(self):
        return self._read_file(self.events_path)

    async def get_event(self, event_id: str):
        events = self._read_file(self.events_path)
        for evt in events:
            if evt["id"] == event_id:
                return evt
        return None

    async def create_event(self, event: dict):
        events = self._read_file(self.events_path)
        event["id"] = "evt_" + str(uuid.uuid4())[:8]
        events.append(event)
        self._write_file(self.events_path, events)
        return event

    async def update_event(self, event_id: str, event: dict):
        events = self._read_file(self.events_path)
        for i, e in enumerate(events):
            if e["id"] == event_id:
                event["id"] = event_id
                events[i] = event
                self._write_file(self.events_path, events)
                return event
        return None

    async def delete_event(self, event_id: str):
        events = self._read_file(self.events_path)
        filtered = [e for e in events if e["id"] != event_id]
        if len(filtered) < len(events):
            self._write_file(self.events_path, filtered)
            # Delete corresponding tasks too
            tasks = self._read_file(self.tasks_path)
            tasks_filtered = [t for t in tasks if t["event_id"] != event_id]
            self._write_file(self.tasks_path, tasks_filtered)
            return True
        return False

    # Tasks Operations
    async def get_tasks(self):
        return self._read_file(self.tasks_path)

    async def get_tasks_for_event(self, event_id: str):
        tasks = self._read_file(self.tasks_path)
        return [t for t in tasks if t["event_id"] == event_id]

    async def create_task(self, task: dict):
        tasks = self._read_file(self.tasks_path)
        task["id"] = "tsk_" + str(uuid.uuid4())[:8]
        tasks.append(task)
        self._write_file(self.tasks_path, tasks)
        return task

    async def update_task(self, task_id: str, task: dict):
        tasks = self._read_file(self.tasks_path)
        for i, t in enumerate(tasks):
            if t["id"] == task_id:
                task["id"] = task_id
                tasks[i] = task
                self._write_file(self.tasks_path, tasks)
                return task
        return None

    async def delete_task(self, task_id: str):
        tasks = self._read_file(self.tasks_path)
        filtered = [t for t in tasks if t["id"] != task_id]
        if len(filtered) < len(tasks):
            self._write_file(self.tasks_path, filtered)
            return True
        return False

    # Users Operations
    async def get_users(self):
        return self._read_file(self.users_path)

    async def get_user_by_email(self, email: str):
        users = self._read_file(self.users_path)
        for u in users:
            if u["email"].lower() == email.strip().lower():
                return u
        return None

    async def create_user(self, user: dict):
        users = self._read_file(self.users_path)
        user["id"] = "usr_" + str(uuid.uuid4())[:8]
        users.append(user)
        self._write_file(self.users_path, users)
        return user

    # Client delete
    async def delete_client(self, client_id: str):
        clients = self._read_file(self.clients_path)
        filtered = [c for c in clients if c["id"] != client_id]
        if len(filtered) < len(clients):
            self._write_file(self.clients_path, filtered)
            return True
        return False

    # Gallery Operations
    async def get_gallery(self):
        return self._read_file(self.gallery_path)

    async def get_gallery_item(self, photo_id: str):
        gallery = self._read_file(self.gallery_path)
        for g in gallery:
            if g["id"] == photo_id:
                return g
        return None

    async def create_gallery_item(self, item: dict):
        gallery = self._read_file(self.gallery_path)
        item["id"] = "gal_" + str(uuid.uuid4())[:8]
        gallery.append(item)
        self._write_file(self.gallery_path, gallery)
        return item

    async def update_gallery_item(self, photo_id: str, item: dict):
        gallery = self._read_file(self.gallery_path)
        for i, g in enumerate(gallery):
            if g["id"] == photo_id:
                item["id"] = photo_id
                gallery[i] = item
                self._write_file(self.gallery_path, gallery)
                return item
        return None

    async def delete_gallery_item(self, photo_id: str):
        gallery = self._read_file(self.gallery_path)
        filtered = [g for g in gallery if g["id"] != photo_id]
        if len(filtered) < len(gallery):
            self._write_file(self.gallery_path, filtered)
            return True
        return False

    # Crew Operations
    async def get_crew(self):
        return self._read_file(self.crew_path)

    async def create_crew_member(self, member: dict):
        crew = self._read_file(self.crew_path)
        member["id"] = "crw_" + str(uuid.uuid4())[:8]
        member.setdefault("amount_owed", 0.0)
        member.setdefault("payment_history", "[]")
        crew.append(member)
        self._write_file(self.crew_path, crew)
        return member

    async def update_crew_member(self, crew_id: str, member: dict):
        crew = self._read_file(self.crew_path)
        for i, c in enumerate(crew):
            if c["id"] == crew_id:
                member["id"] = crew_id
                member.setdefault("amount_owed", c.get("amount_owed", 0.0))
                member.setdefault("payment_history", c.get("payment_history", "[]"))
                crew[i] = member
                self._write_file(self.crew_path, crew)
                return member
        return None

    async def delete_crew_member(self, crew_id: str):
        crew = self._read_file(self.crew_path)
        filtered = [c for c in crew if c["id"] != crew_id]
        if len(filtered) < len(crew):
            self._write_file(self.crew_path, filtered)
            return True
        return False
