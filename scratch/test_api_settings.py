import sys
import os
import time
from fastapi.testclient import TestClient

sys.path.append(r"H:\CODE (HEM)\Somthing Crazy")

from backend.main import app
from backend.auth import MOCK_SESSIONS

def main():
    client = TestClient(app)
    
    # Insert a dummy session in MOCK_SESSIONS
    token = "test_admin_token_123"
    MOCK_SESSIONS[token] = {
        "email": "hello@bhoomidecoration.com",
        "role": "admin",
        "name": "Admin Manager",
        "id": "usr_admin",
        "token": token,
        "expire": "",
        "verified_at": time.time()
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("[*] Sending GET to /api/admin/settings...")
    response = client.get("/api/admin/settings", headers=headers)
    print(f"Response Status: {response.status_code}")
    print("Response JSON:")
    import pprint
    pprint.pprint(response.json())

if __name__ == "__main__":
    main()
