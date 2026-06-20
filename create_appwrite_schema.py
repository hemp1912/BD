import os
import time
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.permission import Permission
from appwrite.role import Role
from appwrite.exception import AppwriteException

# Load environment configuration
load_dotenv(override=True)

APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT", "")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID", "")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY", "")
DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID", "bhoomi_db")

def init_appwrite_client():
    if not (APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID and APPWRITE_API_KEY):
        print("[!] Error: Appwrite credentials missing in .env file.")
        print("    Please populate APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY in your .env file.")
        return None, None
    
    print(f"[*] Initializing Appwrite client (Endpoint: {APPWRITE_ENDPOINT}, Project: {APPWRITE_PROJECT_ID})")
    client = Client()
    client.set_endpoint(APPWRITE_ENDPOINT)
    client.set_project(APPWRITE_PROJECT_ID)
    client.set_key(APPWRITE_API_KEY)
    
    databases = Databases(client)
    return client, databases

def wait_for_attributes(databases, db_id, coll_id, attributes):
    """
    Appwrite creates attributes asynchronously in the background. 
    Before creating indexes, we must wait until all attributes are 'available'.
    """
    print(f"    [*] Waiting for attributes in collection '{coll_id}' to become available...")
    pending = list(attributes)
    start_time = time.time()
    timeout = 45  # 45 seconds timeout
    
    while pending and (time.time() - start_time) < timeout:
        time.sleep(1)
        for attr_key in list(pending):
            try:
                attr = databases.get_attribute(db_id, coll_id, attr_key)
                status = None
                if hasattr(attr, "status"):
                    status = attr.status
                elif hasattr(attr, "to_dict"):
                    status = attr.to_dict().get("status")
                elif isinstance(attr, dict):
                    status = attr.get("status")
                
                if status == "available":
                    pending.remove(attr_key)
                    print(f"    [+] Attribute '{attr_key}' is ready.")
                elif status == "failed":
                    print(f"    [!] Attribute '{attr_key}' creation failed.")
                    pending.remove(attr_key)
            except Exception:
                # If get_attribute fails, keep waiting
                pass
    if pending:
        print(f"    [!] Warning: Attributes {pending} did not become available.")

def bootstrap_collections():
    client, databases = init_appwrite_client()
    if not client or not databases:
        return

    # Define standard collections schema
    collections_schema = {
        "inventory": {
            "name": "Inventory",
            "attributes": [
                {"type": "string", "key": "name", "size": 255, "required": True},
                {"type": "string", "key": "category", "size": 100, "required": True},
                {"type": "integer", "key": "quantity_owned", "required": True},
                {"type": "float", "key": "rental_price_per_day", "required": True}
            ],
            "indexes": []
        },
        "clients": {
            "name": "Clients",
            "attributes": [
                {"type": "string", "key": "name", "size": 255, "required": True},
                {"type": "string", "key": "email", "size": 255, "required": True},
                {"type": "string", "key": "phone", "size": 50, "required": True},
                {"type": "string", "key": "address", "size": 500, "required": True}
            ],
            "indexes": []
        },
        "events": {
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
                {"type": "string", "key": "notes", "size": 5000, "required": False, "default": ""}
            ],
            "indexes": []
        },
        "tasks": {
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
        "users": {
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
        }
    }

    # Grant read, create, update, delete permissions to Role.any()
    permissions = [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
    ]

    # Verify if database exists
    try:
        databases.get(DATABASE_ID)
        print(f"[+] Found existing database: '{DATABASE_ID}'")
    except AppwriteException as e:
        print(f"[*] Database '{DATABASE_ID}' not found. Attempting to create it...")
        try:
            databases.create(DATABASE_ID, "Bhoomi Db")
            print(f"[+] Database '{DATABASE_ID}' successfully created.")
        except AppwriteException as e_create:
            print(f"[!] Error: Could not create database '{DATABASE_ID}': {e_create.message}")
            return

    # Loop through collections and create them
    for coll_id, schema in collections_schema.items():
        name = schema["name"]
        print(f"\n[*] Processing collection '{name}' ({coll_id})...")

        # 1. Create collection
        try:
            databases.create_collection(
                database_id=DATABASE_ID,
                collection_id=coll_id,
                name=name,
                permissions=permissions
            )
            print(f"  [+] Collection '{name}' created.")
        except AppwriteException as e:
            if "already exists" in e.message.lower() or e.code == 409:
                print(f"  [-] Collection '{name}' already exists. Skipping creation.")
            else:
                print(f"  [!] Error creating collection '{name}': {e.message}")
                continue

        # 2. Create Attributes
        attribute_keys = []
        for attr in schema["attributes"]:
            key = attr["key"]
            attr_type = attr["type"]
            required = attr["required"]
            default = attr.get("default", None)
            attribute_keys.append(key)

            try:
                if attr_type == "string":
                    size = attr["size"]
                    databases.create_string_attribute(
                        database_id=DATABASE_ID,
                        collection_id=coll_id,
                        key=key,
                        size=size,
                        required=required,
                        default=default
                    )
                elif attr_type == "integer":
                    databases.create_integer_attribute(
                        database_id=DATABASE_ID,
                        collection_id=coll_id,
                        key=key,
                        required=required,
                        default=default
                    )
                elif attr_type == "float":
                    databases.create_float_attribute(
                        database_id=DATABASE_ID,
                        collection_id=coll_id,
                        key=key,
                        required=required,
                        default=default
                    )
                elif attr_type == "boolean":
                    databases.create_boolean_attribute(
                        database_id=DATABASE_ID,
                        collection_id=coll_id,
                        key=key,
                        required=required,
                        default=default
                    )
                print(f"    [+] Attribute creation request sent: '{key}' ({attr_type})")
            except AppwriteException as e:
                if "already exists" in e.message.lower() or e.code == 409:
                    print(f"    [-] Attribute '{key}' already exists.")
                else:
                    print(f"    [!] Error creating attribute '{key}': {e.message}")

        # 3. Wait for attributes to process
        wait_for_attributes(databases, DATABASE_ID, coll_id, attribute_keys)

        # 4. Create Indexes
        for idx in schema["indexes"]:
            idx_key = idx["key"]
            idx_type = idx["type"]
            idx_attrs = idx["attributes"]

            try:
                databases.create_index(
                    database_id=DATABASE_ID,
                    collection_id=coll_id,
                    key=idx_key,
                    type=idx_type,
                    attributes=idx_attrs
                )
                print(f"  [+] Index '{idx_key}' created.")
            except AppwriteException as e:
                if "already exists" in e.message.lower() or e.code == 409:
                    print(f"  [-] Index '{idx_key}' already exists.")
                else:
                    print(f"  [!] Error creating index '{idx_key}': {e.message}")

    print("\n[+] Appwrite Database Seeding Setup Finished Successfully!")

if __name__ == "__main__":
    bootstrap_collections()
