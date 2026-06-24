import json
import uuid
import time
import asyncio
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
from appwrite.query import Query
from appwrite.permission import Permission
from appwrite.role import Role
from appwrite.exception import AppwriteException
from backend import config
from backend.db_client import BaseDB

class AppwriteDB(BaseDB):
    def __init__(self):
        self.client = Client()
        self.client.set_endpoint(config.APPWRITE_ENDPOINT)
        self.client.set_project(config.APPWRITE_PROJECT_ID)
        self.client.set_key(config.APPWRITE_API_KEY)
        self.databases = Databases(self.client)
        self.storage = Storage(self.client)
        self.db_id = config.APPWRITE_DATABASE_ID
        
        # Automatically bootstrap schema when client is initialized (disabled by default for speed)
        import os
        if os.getenv("AUTO_BOOTSTRAP_SCHEMA", "false").lower() == "true":
            self.bootstrap_schema()
        else:
            print("[*] Skipping Appwrite Schema Auto-Verification. Set AUTO_BOOTSTRAP_SCHEMA=true to enable.")

        # Bootstrap default admin user in Appwrite Auth and users collection
        try:
            self.bootstrap_admin_user()
        except Exception as e:
            print(f"[!] Failed to bootstrap admin user: {e}")

    def bootstrap_admin_user(self):
        email = "hello@bhoomidecoration.com"
        password = "admin123"
        name = "Admin Manager"
        role = "admin"
        user_id = "usr_admin"
        
        # 1. Check/Create in Appwrite Auth
        from appwrite.services.users import Users
        users_service = Users(self.client)
        try:
            res = users_service.list(search=email)
            users_list = res.users if hasattr(res, "users") else res.get("users", [])
            user_exists = False
            for u in users_list:
                u_dict = u.to_dict() if hasattr(u, "to_dict") else u
                if u_dict.get("email") == email:
                    user_exists = True
                    break
            
            if not user_exists:
                print(f"[*] Bootstrapping default admin user '{email}' in Appwrite Auth...")
                users_service.create(
                    user_id=user_id,
                    email=email,
                    password=password,
                    name=name
                )
                print(f"[+] Admin user '{email}' created in Appwrite Auth.")
            else:
                print(f"[+] Admin user '{email}' verified in Appwrite Auth.")
        except Exception as e:
            print(f"[!] Warning: Could not bootstrap admin user in Appwrite Auth: {e}")

        # 2. Check/Create in 'users' collection
        try:
            res = self.databases.list_documents(
                self.db_id,
                config.APPWRITE_USERS_COLLECTION_ID,
                queries=[Query.equal("email", email)]
            )
            docs = self._get_documents_list(res)
            if not docs:
                print(f"[*] Bootstrapping default admin user document in 'users' collection...")
                self.databases.create_document(
                    database_id=self.db_id,
                    collection_id=config.APPWRITE_USERS_COLLECTION_ID,
                    document_id=user_id,
                    data={
                        "email": email,
                        "role": role,
                        "full_name": name,
                        "base_daily_rate": 0.0,
                        "id": user_id
                    }
                )
                print(f"[+] Admin user document created in 'users' collection.")
            else:
                print(f"[+] Admin user document verified in 'users' collection.")
        except Exception as e:
            print(f"[!] Warning: Could not bootstrap admin user document in collection: {e}")

    def bootstrap_schema(self):
        print(f"\n[*] Starting Appwrite Schema Auto-Verification...")
        
        # 1. Verify / Create Database
        try:
            self.databases.get(self.db_id)
            print(f"  [+] Database '{self.db_id}' verified.")
        except AppwriteException:
            print(f"  [*] Database '{self.db_id}' not found. Attempting to create it...")
            try:
                self.databases.create(self.db_id, "Bhoomi Db")
                print(f"  [+] Database '{self.db_id}' successfully created.")
            except AppwriteException as e_create:
                print(f"  [!] Error: Could not create database '{self.db_id}': {e_create.message}")
                return

        # 2. Define schema collections
        collections_schema = {
            config.APPWRITE_INVENTORY_COLLECTION_ID: {
                "name": "Inventory",
                "attributes": [
                    {"type": "string", "key": "name", "size": 255, "required": True},
                    {"type": "string", "key": "category", "size": 100, "required": True},
                    {"type": "integer", "key": "quantity_owned", "required": True},
                    {"type": "float", "key": "rental_price_per_day", "required": True},
                    {"type": "integer", "key": "available_stock", "required": False, "default": 0},
                    {"type": "string", "key": "condition_status", "size": 100, "required": False, "default": "Excellent"}
                ],
                "indexes": []
            },
            config.APPWRITE_CLIENTS_COLLECTION_ID: {
                "name": "Clients",
                "attributes": [
                    {"type": "string", "key": "name", "size": 255, "required": True},
                    {"type": "string", "key": "email", "size": 255, "required": True},
                    {"type": "string", "key": "phone", "size": 50, "required": True},
                    {"type": "string", "key": "address", "size": 500, "required": True}
                ],
                "indexes": []
            },
            config.APPWRITE_EVENTS_COLLECTION_ID: {
                "name": "Events",
                "attributes": [
                    {"type": "string", "key": "client_id", "size": 100, "required": True},
                    {"type": "string", "key": "client_name", "size": 255, "required": True},
                    {"type": "string", "key": "venue_address", "size": 500, "required": True},
                    {"type": "string", "key": "start_date", "size": 50, "required": True},
                    {"type": "string", "key": "end_date", "size": 50, "required": True},
                    {"type": "string", "key": "status", "size": 50, "required": True, "default": "Draft"},
                    {"type": "string", "key": "design_layout_url", "size": 2048, "required": False, "default": ""},
                    {"type": "string", "key": "items_booked", "size": 10000, "required": True},
                    {"type": "float", "key": "total_invoice_amount", "required": False, "default": 0.0},
                    {"type": "float", "key": "amount_paid", "required": False, "default": 0.0},
                    {"type": "float", "key": "remaining_balance", "required": False, "default": 0.0},
                    {"type": "string", "key": "crew_assignments", "size": 10000, "required": False, "default": "[]"},
                    {"type": "string", "key": "payment_history", "size": 10000, "required": False, "default": "[]"},
                    {"type": "integer", "key": "max_workforce_capacity", "required": False, "default": 4},
                    {"type": "string", "key": "notes", "size": 5000, "required": False, "default": ""},
                    {"type": "float", "key": "tax_rate", "required": False, "default": 0.0},
                    {"type": "float", "key": "discount", "required": False, "default": 0.0},
                    {"type": "string", "key": "portal_token", "size": 100, "required": False, "default": ""}
                ],

                "indexes": []
            },
            config.APPWRITE_TASKS_COLLECTION_ID: {
                "name": "Tasks",
                "attributes": [
                    {"type": "string", "key": "event_id", "size": 100, "required": True},
                    {"type": "string", "key": "description", "size": 2048, "required": True},
                    {"type": "string", "key": "status", "size": 50, "required": True, "default": "Pending"},
                    {"type": "string", "key": "assigned_to", "size": 255, "required": False, "default": ""}
                ],
                "indexes": [
                    {"key": "event_id_index", "type": "key", "attributes": ["event_id"]}
                ]
            },
            config.APPWRITE_USERS_COLLECTION_ID: {
                "name": "Users",
                "attributes": [
                    {"type": "string", "key": "email", "size": 255, "required": True},
                    {"type": "string", "key": "role", "size": 50, "required": True},
                    {"type": "string", "key": "full_name", "size": 255, "required": True},
                    {"type": "float", "key": "base_daily_rate", "required": False, "default": 0.0},
                    {"type": "string", "key": "id", "size": 100, "required": False, "default": ""}
                ],
                "indexes": [
                    {"key": "email_index", "type": "key", "attributes": ["email"]}
                ]
            },
            config.APPWRITE_GALLERY_COLLECTION_ID: {
                "name": "Gallery",
                "attributes": [
                    {"type": "string", "key": "title", "size": 255, "required": True},
                    {"type": "string", "key": "category", "size": 100, "required": True},
                    {"type": "string", "key": "description", "size": 1000, "required": False, "default": ""},
                    {"type": "string", "key": "image_url", "size": 2048, "required": True}
                ],
                "indexes": []
            },
            config.APPWRITE_CREW_COLLECTION_ID: {
                "name": "Crew",
                "attributes": [
                    {"type": "string", "key": "name", "size": 255, "required": True},
                    {"type": "string", "key": "role", "size": 255, "required": True},
                    {"type": "string", "key": "contact", "size": 100, "required": False, "default": ""},
                    {"type": "float", "key": "base_rate", "required": False, "default": 0.0},
                    {"type": "float", "key": "amount_owed", "required": False, "default": 0.0},
                    {"type": "string", "key": "payment_history", "size": 10000, "required": False, "default": "[]"},
                    {"type": "float", "key": "half_day_rate", "required": False, "default": 0.0},
                    {"type": "float", "key": "night_rate", "required": False, "default": 0.0}
                ],
                "indexes": []
            },
            config.APPWRITE_ATTENDANCE_COLLECTION_ID: {
                "name": "Attendance",
                "attributes": [
                    {"type": "string", "key": "crew_id", "size": 100, "required": True},
                    {"type": "string", "key": "crew_name", "size": 255, "required": True},
                    {"type": "string", "key": "date", "size": 50, "required": True},
                    {"type": "string", "key": "status", "size": 50, "required": True},
                    {"type": "float", "key": "calculated_pay", "required": True}
                ],
                "indexes": [
                    {"key": "date_index", "type": "key", "attributes": ["date"]}
                ]
            },
            config.APPWRITE_CALLBACKS_COLLECTION_ID: {
                "name": "Callbacks",
                "attributes": [
                    {"type": "string", "key": "name", "size": 255, "required": True},
                    {"type": "string", "key": "phone", "size": 50, "required": True},
                    {"type": "string", "key": "date", "size": 50, "required": False, "default": ""},
                    {"type": "string", "key": "venue", "size": 255, "required": False, "default": ""},
                    {"type": "string", "key": "service", "size": 100, "required": False, "default": ""},
                    {"type": "string", "key": "message", "size": 1000, "required": False, "default": ""},
                    {"type": "string", "key": "status", "size": 50, "required": False, "default": "Pending"}
                ],
                "indexes": []
            }
        }


        # Grant read, create, update, delete permissions to Role.any()
        permissions = [
            Permission.read(Role.any()),
            Permission.create(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any())
        ]

        # 3. Create Collections, Attributes, and Indexes
        for coll_id, schema in collections_schema.items():
            name = schema["name"]
            
            try:
                self.databases.get_collection(self.db_id, coll_id)
                collection_exists = True
            except AppwriteException:
                collection_exists = False

            if not collection_exists:
                print(f"  [*] Auto-creating Appwrite Collection '{name}' ({coll_id})...")
                try:
                    self.databases.create_collection(
                        database_id=self.db_id,
                        collection_id=coll_id,
                        name=name,
                        permissions=permissions
                    )
                    print(f"    [+] Collection created.")
                except AppwriteException as e:
                    print(f"    [!] Failed to create collection '{name}': {e.message}")
                    continue

            # Create Attributes (both when collection is new or pre-existing)
            attribute_keys = []
            new_attributes_created = False
            for attr in schema["attributes"]:
                key = attr["key"]
                attr_type = attr["type"]
                required = attr["required"]
                default = attr.get("default", None)
                attribute_keys.append(key)

                # Check if attribute already exists
                try:
                    self.databases.get_attribute(self.db_id, coll_id, key)
                    continue # Attribute exists, skip
                except AppwriteException:
                    pass

                # Attribute is missing, create it
                new_attributes_created = True
                try:
                    if attr_type == "string" or attr_type == "venue_address": # handle potential mapping
                        size = attr["size"]
                        self.databases.create_string_attribute(
                            database_id=self.db_id,
                            collection_id=coll_id,
                            key=key,
                            size=size,
                            required=required,
                            default=default
                        )
                    elif attr_type == "integer":
                        self.databases.create_integer_attribute(
                            database_id=self.db_id,
                            collection_id=coll_id,
                            key=key,
                            required=required,
                            default=default
                        )
                    elif attr_type == "float":
                        self.databases.create_float_attribute(
                            database_id=self.db_id,
                            collection_id=coll_id,
                            key=key,
                            required=required,
                            default=default
                        )
                    elif attr_type == "boolean":
                        self.databases.create_boolean_attribute(
                            database_id=self.db_id,
                            collection_id=coll_id,
                            key=key,
                            required=required,
                            default=default
                        )
                    print(f"    [+] Attribute creation request sent: '{key}' ({attr_type})")
                except AppwriteException as e:
                    if e.code != 409:
                        print(f"    [!] Error creating attribute '{key}': {e.message}")

            # Wait for attributes to complete processing if we created new ones
            if new_attributes_created:
                pending = list(attribute_keys)
                start_time = time.time()
                timeout = 45 # 45 seconds timeout
                while pending and (time.time() - start_time) < timeout:
                    time.sleep(0.5)
                    for attr_key in list(pending):
                        try:
                            res = self.databases.get_attribute(self.db_id, coll_id, attr_key)
                            status = None
                            if hasattr(res, "status"):
                                status = res.status
                            elif hasattr(res, "to_dict"):
                                status = res.to_dict().get("status")
                            elif isinstance(res, dict):
                                status = res.get("status")
                                
                            if status in ("available", "failed"):
                                pending.remove(attr_key)
                        except Exception:
                            pass
                if pending:
                    print(f"    [!] Warning: Some attributes did not become available: {pending}")

            # Create Indexes
            for idx in schema["indexes"]:
                # Check if index already exists
                try:
                    self.databases.get_index(self.db_id, coll_id, idx["key"])
                    continue # Index exists, skip
                except AppwriteException:
                    pass

                try:
                    self.databases.create_index(
                        database_id=self.db_id,
                        collection_id=coll_id,
                        key=idx["key"],
                        type=idx["type"],
                        attributes=idx["attributes"]
                    )
                    print(f"    [+] Index '{idx['key']}' created.")
                except AppwriteException as e:
                    if e.code != 409:
                        print(f"    [!] Error creating index '{idx['key']}': {e.message}")

        # 4. Verify / Create Storage Bucket
        try:
            self.storage.get_bucket(config.APPWRITE_STORAGE_BUCKET_ID)
            print(f"  [+] Storage bucket '{config.APPWRITE_STORAGE_BUCKET_ID}' verified.")
        except AppwriteException:
            print(f"  [*] Storage bucket '{config.APPWRITE_STORAGE_BUCKET_ID}' not found. Creating...")
            try:
                self.storage.create_bucket(
                    bucket_id=config.APPWRITE_STORAGE_BUCKET_ID,
                    name="Blueprints Layouts",
                    permissions=permissions
                )
                print(f"  [+] Storage bucket '{config.APPWRITE_STORAGE_BUCKET_ID}' created successfully.")
            except AppwriteException as e_bucket:
                print(f"  [!] Failed to create storage bucket: {e_bucket.message}")

        print("[+] Appwrite Schema Auto-Verification Finished.\n")

    def _clean_doc(self, doc):
        if not doc:
            return None
        
        # Convert Appwrite Document model to dictionary if it has to_dict
        if hasattr(doc, "to_dict"):
            cleaned = doc.to_dict()
        elif isinstance(doc, dict):
            cleaned = dict(doc)
        else:
            try:
                cleaned = doc.model_dump()
            except Exception:
                cleaned = dict(doc)

        # Move Appwrite $id to id
        if "$id" in cleaned:
            cleaned["id"] = cleaned["$id"]

        # Lift all fields from the nested 'data' dictionary to the top level
        if "data" in cleaned and isinstance(cleaned["data"], dict):
            for k, v in cleaned["data"].items():
                cleaned[k] = v
            cleaned.pop("data")

        # Fallbacks for truncated Appwrite keys (due to key length differences)
        if cleaned.get("total_invoice_amount") is None and "total_invoice_amoun" in cleaned:
            cleaned["total_invoice_amount"] = cleaned.get("total_invoice_amoun")
        if cleaned.get("max_workforce_capacity") is None and "max_workforce_cap" in cleaned:
            cleaned["max_workforce_capacity"] = cleaned.get("max_workforce_cap")

        # Ensure default values for numerical fields to avoid frontend crashes
        for num_field, default_val in [
            ("total_invoice_amount", 0.0),
            ("amount_paid", 0.0),
            ("remaining_balance", 0.0),
            ("discount", 0.0),
            ("tax_rate", 0.0),
            ("max_workforce_capacity", 4),
            ("rental_price_per_day", 0.0),
            ("quantity_owned", 0),
            ("available_stock", 0),
            ("base_daily_rate", 0.0),
            ("base_rate", 0.0),
            ("amount_owed", 0.0),
            ("calculated_pay", 0.0),
            ("half_day_rate", 0.0),
            ("night_rate", 0.0),
        ]:
            if num_field in cleaned and cleaned.get(num_field) is None:
                cleaned[num_field] = default_val

        # Remove system fields for uniform JSON responses
        for key in list(cleaned.keys()):
            if key.startswith("$"):
                cleaned.pop(key)
        return cleaned

    def _get_documents_list(self, res):
        if not res:
            return []
        if hasattr(res, "documents"):
            return res.documents
        if isinstance(res, dict):
            return res.get("documents", [])
        if hasattr(res, "to_dict"):
            return res.to_dict().get("documents", [])
        return []

    def _get_total_count(self, res):
        if not res:
            return 0
        if hasattr(res, "total"):
            return res.total
        if isinstance(res, dict):
            return res.get("total", 0)
        if hasattr(res, "to_dict"):
            return res.to_dict().get("total", 0)
        return 0

    # Inventory CRUD
    async def get_inventory(self, page=None, limit=10, search=None):
        res = await asyncio.to_thread(
            self.databases.list_documents,
            self.db_id, 
            config.APPWRITE_INVENTORY_COLLECTION_ID,
            queries=[Query.limit(1000)]
        )
        all_items = [self._clean_doc(d) for d in self._get_documents_list(res)]
        
        # Stats computation (global, before search filtering)
        total_unique = len(all_items)
        total_stock = sum(item.get("quantity_owned", 0) for item in all_items)
        low_stock = 0
        for item in all_items:
            owned = item.get("quantity_owned", 0)
            avail = item.get("available_stock")
            if avail is None:
                avail = owned
            if owned > 0 and (avail / owned) <= 0.20:
                low_stock += 1

        if search:
            q = search.strip().lower()
            all_items = [
                item for item in all_items if
                (item.get("name") and q in item.get("name").lower()) or
                (item.get("category") and q in item.get("category").lower())
            ]
            
        total = len(all_items)
                
        if page is not None:
            start = (page - 1) * limit
            items = all_items[start : start + limit]
            return {
                "items": items,
                "total": total,
                "stats": {
                    "totalUniqueItems": total_unique,
                    "totalStockUnits": total_stock,
                    "lowStockCount": low_stock
                }
            }
        else:
            return all_items

    async def get_inventory_item(self, item_id: str):
        try:
            doc = await asyncio.to_thread(
                self.databases.get_document,
                self.db_id,
                config.APPWRITE_INVENTORY_COLLECTION_ID,
                item_id
            )
            return self._clean_doc(doc)
        except Exception:
            return None

    async def create_inventory_item(self, item: dict):
        doc_id = "inv_" + str(uuid.uuid4())[:8]
        doc = await asyncio.to_thread(
            self.databases.create_document,
            self.db_id,
            config.APPWRITE_INVENTORY_COLLECTION_ID,
            doc_id,
            item
        )
        return self._clean_doc(doc)

    async def update_inventory_item(self, item_id: str, item: dict):
        # Remove id from body to avoid trying to modify primary key
        data = {k: v for k, v in item.items() if k != "id"}
        doc = await asyncio.to_thread(
            self.databases.update_document,
            self.db_id,
            config.APPWRITE_INVENTORY_COLLECTION_ID,
            item_id,
            data
        )
        return self._clean_doc(doc)

    async def delete_inventory_item(self, item_id: str):
        try:
            await asyncio.to_thread(
                self.databases.delete_document,
                self.db_id,
                config.APPWRITE_INVENTORY_COLLECTION_ID,
                item_id
            )
            return True
        except Exception:
            return False

    # Clients CRUD
    async def get_clients(self, page=None, limit=10, search=None):
        res = await asyncio.to_thread(
            self.databases.list_documents,
            self.db_id, 
            config.APPWRITE_CLIENTS_COLLECTION_ID,
            queries=[Query.limit(1000)]
        )
        all_clients = [self._clean_doc(d) for d in self._get_documents_list(res)]
        
        if search:
            q = search.strip().lower()
            all_clients = [
                c for c in all_clients if
                (c.get("name") and q in c.get("name").lower()) or
                (c.get("email") and q in c.get("email").lower()) or
                (c.get("phone") and q in c.get("phone").lower())
            ]
            
        total = len(all_clients)
        
        # Fetch all events to compute stats
        all_events_res = await asyncio.to_thread(
            self.databases.list_documents,
            self.db_id,
            config.APPWRITE_EVENTS_COLLECTION_ID,
            queries=[Query.limit(1000)]
        )
        all_events = [self._clean_doc(d) for d in self._get_documents_list(all_events_res)]
        
        active_client_ids = set()
        for e in all_events:
            if e.get("status") in ("Confirmed", "Completed"):
                active_client_ids.add(e.get("client_id"))
                
        total_clients = len(all_clients)
        active_clients = sum(1 for c in all_clients if c.get("id") in active_client_ids)
        new_leads = 0
        for c in all_clients:
            client_events = [e for e in all_events if e.get("client_id") == c.get("id")]
            if len(client_events) == 0 or all(e.get("status") == "Draft" for e in client_events):
                new_leads += 1
                
        if page is not None:
            start = (page - 1) * limit
            items = all_clients[start : start + limit]
            return {
                "items": items,
                "total": total,
                "stats": {
                    "totalClients": total_clients,
                    "activeClients": active_clients,
                    "newLeads": new_leads
                }
            }
        else:
            return all_clients

    async def create_client(self, client: dict):
        doc_id = "cli_" + str(uuid.uuid4())[:8]
        doc = await asyncio.to_thread(
            self.databases.create_document,
            self.db_id,
            config.APPWRITE_CLIENTS_COLLECTION_ID,
            doc_id,
            client
        )
        return self._clean_doc(doc)

    async def update_client(self, client_id: str, client: dict):
        data = {k: v for k, v in client.items() if k != "id"}
        doc = await asyncio.to_thread(
            self.databases.update_document,
            self.db_id,
            config.APPWRITE_CLIENTS_COLLECTION_ID,
            client_id,
            data
        )
        return self._clean_doc(doc)

    async def delete_client(self, client_id: str):
        try:
            await asyncio.to_thread(
                self.databases.delete_document,
                self.db_id,
                config.APPWRITE_CLIENTS_COLLECTION_ID,
                client_id
            )
            return True
        except Exception:
            return False

    # Events CRUD
    async def get_events(self, page=None, limit=10, search=None, status=None, payment_status=None):
        res = await asyncio.to_thread(
            self.databases.list_documents,
            self.db_id, 
            config.APPWRITE_EVENTS_COLLECTION_ID,
            queries=[Query.limit(1000)]
        )
        all_events = [self._clean_doc(d) for d in self._get_documents_list(res)]
        
        # Sort descending by $createdAt (which we lift to id or check from original doc, or sorting by start_date/creation)
        # Wait, let's sort them. Appwrite documents have createdAt, but since _clean_doc removes $ fields, let's sort by start_date descending or creation.
        # Let's sort by start_date descending.
        all_events.sort(key=lambda x: x.get("start_date", ""), reverse=True)
        
        # Compute payment_status and add to items
        for evt in all_events:
            amount_paid = evt.get("amount_paid") or 0.0
            remaining_balance = evt.get("remaining_balance") or 0.0
            if remaining_balance <= 0:
                p_status = "Fully Paid"
            elif amount_paid > 0:
                p_status = "Partially Paid"
            else:
                p_status = "Unpaid"
            evt["payment_status"] = p_status
            
        # Stats computation (global, before filtering)
        total_events = len(all_events)
        confirmed_events = sum(1 for e in all_events if e.get("status") == "Confirmed")
        draft_events = sum(1 for e in all_events if e.get("status") == "Draft")
        total_invoiced = sum(e.get("total_invoice_amount", 0.0) for e in all_events)
        total_collected = sum(e.get("amount_paid", 0.0) for e in all_events)
        total_remaining = sum(e.get("remaining_balance", 0.0) for e in all_events)

        # Filter status
        if status and status != "All":
            all_events = [e for e in all_events if e.get("status") == status]
            
        # Filter payment_status
        if payment_status and payment_status != "All":
            all_events = [e for e in all_events if e.get("payment_status") == payment_status]
            
        # Filter search
        if search:
            q = search.strip().lower()
            all_events = [
                e for e in all_events if
                (e.get("client_name") and q in e.get("client_name").lower()) or
                (e.get("venue_address") and q in e.get("venue_address").lower())
            ]
            
        total = len(all_events)
        
        if page is not None:
            start = (page - 1) * limit
            items = all_events[start : start + limit]
            return {
                "items": items,
                "total": total,
                "stats": {
                    "totalEvents": total_events,
                    "confirmedEvents": confirmed_events,
                    "draftEvents": draft_events,
                    "totalInvoiced": total_invoiced,
                    "totalCollected": total_collected,
                    "totalRemaining": total_remaining
                }
            }
        else:
            return all_events

    async def get_event(self, event_id: str):
        try:
            doc = await asyncio.to_thread(
                self.databases.get_document,
                self.db_id,
                config.APPWRITE_EVENTS_COLLECTION_ID,
                event_id
            )
            return self._clean_doc(doc)
        except Exception:
            return None

    async def create_event(self, event: dict):
        doc_id = "evt_" + str(uuid.uuid4())[:8]
        doc = await asyncio.to_thread(
            self.databases.create_document,
            self.db_id,
            config.APPWRITE_EVENTS_COLLECTION_ID,
            doc_id,
            event
        )
        return self._clean_doc(doc)

    async def update_event(self, event_id: str, event: dict):
        data = {k: v for k, v in event.items() if k != "id"}
        doc = await asyncio.to_thread(
            self.databases.update_document,
            self.db_id,
            config.APPWRITE_EVENTS_COLLECTION_ID,
            event_id,
            data
        )
        return self._clean_doc(doc)

    async def delete_event(self, event_id: str):
        try:
            await asyncio.to_thread(
                self.databases.delete_document,
                self.db_id,
                config.APPWRITE_EVENTS_COLLECTION_ID,
                event_id
            )
            # Find and delete associated tasks
            tasks_res = await asyncio.to_thread(
                self.databases.list_documents,
                self.db_id,
                config.APPWRITE_TASKS_COLLECTION_ID,
                queries=[Query.equal("event_id", event_id)]
            )
            del_tasks = []
            for t in self._get_documents_list(tasks_res):
                del_tasks.append(
                    asyncio.to_thread(
                        self.databases.delete_document,
                        self.db_id,
                        config.APPWRITE_TASKS_COLLECTION_ID,
                        t["$id"]
                    )
                )
            if del_tasks:
                await asyncio.gather(*del_tasks, return_exceptions=True)
            return True
        except Exception:
            return False

    # Tasks CRUD
    async def get_tasks(self):
        res = await asyncio.to_thread(
            self.databases.list_documents,
            self.db_id, 
            config.APPWRITE_TASKS_COLLECTION_ID,
            queries=[Query.limit(100)]
        )
        return [self._clean_doc(d) for d in self._get_documents_list(res)]

    async def get_tasks_for_event(self, event_id: str):
        res = await asyncio.to_thread(
            self.databases.list_documents,
            self.db_id,
            config.APPWRITE_TASKS_COLLECTION_ID,
            queries=[Query.equal("event_id", event_id)]
        )
        return [self._clean_doc(d) for d in self._get_documents_list(res)]

    async def create_task(self, task: dict):
        doc_id = "tsk_" + str(uuid.uuid4())[:8]
        doc = await asyncio.to_thread(
            self.databases.create_document,
            self.db_id,
            config.APPWRITE_TASKS_COLLECTION_ID,
            doc_id,
            task
        )
        return self._clean_doc(doc)

    async def update_task(self, task_id: str, task: dict):
        data = {k: v for k, v in task.items() if k != "id"}
        doc = await asyncio.to_thread(
            self.databases.update_document,
            self.db_id,
            config.APPWRITE_TASKS_COLLECTION_ID,
            task_id,
            data
        )
        return self._clean_doc(doc)

    async def delete_task(self, task_id: str):
        try:
            await asyncio.to_thread(
                self.databases.delete_document,
                self.db_id,
                config.APPWRITE_TASKS_COLLECTION_ID,
                task_id
            )
            return True
        except Exception:
            return False

    # Users CRUD
    async def get_users(self):
        res = await asyncio.to_thread(
            self.databases.list_documents,
            self.db_id, 
            config.APPWRITE_USERS_COLLECTION_ID,
            queries=[Query.limit(100)]
        )
        return [self._clean_doc(d) for d in self._get_documents_list(res)]

    async def get_user_by_email(self, email: str):
        try:
            res = await asyncio.to_thread(
                self.databases.list_documents,
                self.db_id,
                config.APPWRITE_USERS_COLLECTION_ID,
                queries=[Query.equal("email", email.strip().lower())]
            )
            docs = self._get_documents_list(res)
            return self._clean_doc(docs[0]) if docs else None
        except Exception:
            return None

    async def create_user(self, user: dict):
        doc_id = user.get("id") or ("usr_" + str(uuid.uuid4())[:8])
        # Clean user dict to contain only fields in the Appwrite Users collection schema
        schema_fields = {"email", "role", "full_name", "base_daily_rate", "id"}
        user_data = {k: v for k, v in user.items() if k in schema_fields}
        user_data["id"] = doc_id
        
        doc = await asyncio.to_thread(
            self.databases.create_document,
            self.db_id,
            config.APPWRITE_USERS_COLLECTION_ID,
            doc_id,
            user_data
        )
        return self._clean_doc(doc)

    async def get_gallery(self, page=None, limit=10, search=None):
        res = await asyncio.to_thread(
            self.databases.list_documents,
            self.db_id, 
            config.APPWRITE_GALLERY_COLLECTION_ID,
            queries=[Query.limit(1000)]
        )
        all_items = [self._clean_doc(d) for d in self._get_documents_list(res)]
        
        if search:
            q = search.strip().lower()
            all_items = [
                item for item in all_items if
                (item.get("title") and q in item.get("title").lower()) or
                (item.get("category") and q in item.get("category").lower())
            ]
            
        total = len(all_items)
        
        if page is not None:
            start = (page - 1) * limit
            items = all_items[start : start + limit]
            return {
                "items": items,
                "total": total
            }
        else:
            return all_items


    async def get_gallery_item(self, photo_id: str):
        try:
            doc = await asyncio.to_thread(
                self.databases.get_document,
                self.db_id,
                config.APPWRITE_GALLERY_COLLECTION_ID,
                photo_id
            )
            return self._clean_doc(doc)
        except Exception:
            return None

    async def create_gallery_item(self, item: dict):
        doc_id = "gal_" + str(uuid.uuid4())[:8]
        doc = await asyncio.to_thread(
            self.databases.create_document,
            self.db_id,
            config.APPWRITE_GALLERY_COLLECTION_ID,
            doc_id,
            item
        )
        return self._clean_doc(doc)

    async def update_gallery_item(self, photo_id: str, item: dict):
        data = {k: v for k, v in item.items() if k != "id"}
        doc = await asyncio.to_thread(
            self.databases.update_document,
            self.db_id,
            config.APPWRITE_GALLERY_COLLECTION_ID,
            photo_id,
            data
        )
        return self._clean_doc(doc)

    async def delete_gallery_item(self, photo_id: str):
        try:
            await asyncio.to_thread(
                self.databases.delete_document,
                self.db_id,
                config.APPWRITE_GALLERY_COLLECTION_ID,
                photo_id
            )
            return True
        except Exception:
            return False

    async def get_crew(self, page=None, limit=10, search=None):
        # Fetch all crew to compute stats and perform in-memory search/pagination
        all_crew_res = await asyncio.to_thread(
            self.databases.list_documents,
            self.db_id,
            config.APPWRITE_CREW_COLLECTION_ID,
            queries=[Query.limit(1000)]
        )
        all_crew = [self._clean_doc(d) for d in self._get_documents_list(all_crew_res)]
        
        # Stats computation (global, before search filtering)
        total_crew = len(all_crew)
        owed_wages = sum(c.get("amount_owed", 0.0) for c in all_crew)
        
        # Active assignments (global)
        all_events_res = await asyncio.to_thread(
            self.databases.list_documents,
            self.db_id,
            config.APPWRITE_EVENTS_COLLECTION_ID,
            queries=[Query.limit(1000)]
        )
        all_events = [self._clean_doc(d) for d in self._get_documents_list(all_events_res)]
        
        crew_on_duty_set = set()
        for e in all_events:
            if e.get("status") in ("Confirmed", "Draft"):
                try:
                    assignments = json.loads(e.get("crew_assignments") or "[]")
                    for worker in assignments:
                        w_id = worker.get("worker_id")
                        if w_id:
                            crew_on_duty_set.add(w_id)
                except Exception:
                    pass
        active_assignments = len(crew_on_duty_set)
        
        # Search filtering
        filtered_crew = all_crew
        if search:
            q = search.strip().lower()
            filtered_crew = [
                c for c in all_crew if
                (c.get("name") and q in c.get("name").lower()) or
                (c.get("role") and q in c.get("role").lower())
            ]
            
        total = len(filtered_crew)
        
        if page is not None:
            start = (page - 1) * limit
            items = filtered_crew[start : start + limit]
            return {
                "items": items,
                "total": total,
                "stats": {
                    "totalCrew": total_crew,
                    "owedWages": owed_wages,
                    "activeAssignments": active_assignments
                }
            }
        else:
            return filtered_crew

    async def create_crew_member(self, member: dict, custom_id: Optional[str] = None):
        doc_id = custom_id or ("crw_" + str(uuid.uuid4())[:8])
        member.setdefault("amount_owed", 0.0)
        member.setdefault("payment_history", "[]")
        doc = await asyncio.to_thread(
            self.databases.create_document,
            self.db_id,
            config.APPWRITE_CREW_COLLECTION_ID,
            doc_id,
            member
        )
        return self._clean_doc(doc)

    async def update_crew_member(self, crew_id: str, member: dict):
        data = {k: v for k, v in member.items() if k != "id"}
        doc = await asyncio.to_thread(
            self.databases.update_document,
            self.db_id,
            config.APPWRITE_CREW_COLLECTION_ID,
            crew_id,
            data
        )
        return self._clean_doc(doc)

    async def delete_crew_member(self, crew_id: str):
        try:
            await asyncio.to_thread(
                self.databases.delete_document,
                self.db_id,
                config.APPWRITE_CREW_COLLECTION_ID,
                crew_id
            )
            return True
        except Exception:
            return False

    # Attendance CRUD
    async def get_attendance(self, date_str: str):
        res = await asyncio.to_thread(
            self.databases.list_documents,
            self.db_id,
            config.APPWRITE_ATTENDANCE_COLLECTION_ID,
            queries=[Query.equal("date", date_str), Query.limit(100)]
        )
        return [self._clean_doc(d) for d in self._get_documents_list(res)]

    async def get_attendance_record(self, date_str: str, crew_id: str):
        try:
            res = await asyncio.to_thread(
                self.databases.list_documents,
                self.db_id,
                config.APPWRITE_ATTENDANCE_COLLECTION_ID,
                queries=[Query.equal("date", date_str), Query.equal("crew_id", crew_id)]
            )
            docs = self._get_documents_list(res)
            return self._clean_doc(docs[0]) if docs else None
        except Exception:
            return None

    async def save_attendance_record(self, date_str: str, crew_id: str, record: dict):
        record_id = record.get("id")
        if not record_id:
            existing = await self.get_attendance_record(date_str, crew_id)
            if existing:
                record_id = existing["id"]
        
        data = {k: v for k, v in record.items() if k != "id"}
        data["date"] = date_str
        data["crew_id"] = crew_id
        
        if record_id:
            doc = await asyncio.to_thread(
                self.databases.update_document,
                self.db_id,
                config.APPWRITE_ATTENDANCE_COLLECTION_ID,
                record_id,
                data
            )
        else:
            doc_id = "att_" + str(uuid.uuid4())[:8]
            doc = await asyncio.to_thread(
                self.databases.create_document,
                self.db_id,
                config.APPWRITE_ATTENDANCE_COLLECTION_ID,
                doc_id,
                data
            )
        return self._clean_doc(doc)

    async def get_all_attendance(self):
        res = await asyncio.to_thread(
            self.databases.list_documents,
            self.db_id,
            config.APPWRITE_ATTENDANCE_COLLECTION_ID,
            queries=[Query.limit(1000)]
        )
        return [self._clean_doc(d) for d in self._get_documents_list(res)]

    # Callbacks CRUD
    async def get_callbacks(self):
        res = await asyncio.to_thread(
            self.databases.list_documents,
            self.db_id,
            config.APPWRITE_CALLBACKS_COLLECTION_ID,
            queries=[Query.limit(1000)]
        )
        all_callbacks = [self._clean_doc(d) for d in self._get_documents_list(res)]
        # Sort newest first based on id (since they have random uuid postfixes, we can sort by id or document metadata)
        # Actually since _clean_doc doesn't expose Appwrite's $createdAt, we can sort by ID or just keep the returned order.
        # Let's sort them by the numeric/timestamp or creation or just keep it default. We'll add a timestamp or sort descending.
        return all_callbacks

    async def create_callback(self, callback_data: dict):
        doc_id = "cb_" + str(uuid.uuid4())[:8]
        callback_data.setdefault("status", "Pending")
        doc = await asyncio.to_thread(
            self.databases.create_document,
            self.db_id,
            config.APPWRITE_CALLBACKS_COLLECTION_ID,
            doc_id,
            callback_data
        )
        return self._clean_doc(doc)

    async def update_callback(self, callback_id: str, callback_data: dict):
        data = {k: v for k, v in callback_data.items() if k != "id"}
        doc = await asyncio.to_thread(
            self.databases.update_document,
            self.db_id,
            config.APPWRITE_CALLBACKS_COLLECTION_ID,
            callback_id,
            data
        )
        return self._clean_doc(doc)

    # Date-Blocking check
    async def check_availability(self, item_id: str, start_date: str, end_date: str, qty_needed: int) -> bool:
        item = await self.get_inventory_item(item_id)
        if not item:
            return False
        owned = item.get("quantity_owned", 0)
        
        # Parse start and end dates
        from datetime import datetime, timedelta
        try:
            s_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            e_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        except Exception:
            return False
            
        # Get all events to verify overlapping items
        events = await self.get_events()
        
        current_date = s_date
        while current_date <= e_date:
            in_use = 0
            for evt in events:
                if evt.get("status") == "Cancelled":
                    continue
                try:
                    evt_start = datetime.strptime(evt.get("start_date", ""), "%Y-%m-%d").date()
                    evt_end = datetime.strptime(evt.get("end_date", ""), "%Y-%m-%d").date()
                except Exception:
                    continue
                
                if evt_start <= current_date <= evt_end:
                    try:
                        booked = json.loads(evt.get("items_booked", "{}"))
                        in_use += booked.get(item_id, 0)
                    except Exception:
                        pass
            
            if (owned - in_use) < qty_needed:
                return False
            current_date += timedelta(days=1)
            
        return True


