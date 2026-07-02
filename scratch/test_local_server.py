import sys
import os
import json
import requests

sys.path.append(r"H:\CODE (HEM)\Somthing Crazy")

def main():
    # Load session cache to get latest token
    cache_path = r"H:\CODE (HEM)\Somthing Crazy\backend\sessions_cache.json"
    with open(cache_path, "r", encoding="utf-8") as f:
        cache = json.load(f)
    
    # Sort sessions by verification time to find the newest one
    sessions = []
    for k, v in cache.items():
        if isinstance(v, dict) and "verified_at" in v:
            sessions.append((v["verified_at"], k))
    
    if not sessions:
        print("[-] No sessions found in cache.")
        return
        
    sessions.sort(reverse=True)
    latest_token = sessions[0][1]
    print(f"[*] Using latest session token: {latest_token}")
    
    headers = {"Authorization": f"Bearer {latest_token}"}
    url = "http://127.0.0.1:8000/api/admin/settings"
    
    try:
        print(f"[*] Querying local server at {url}...")
        response = requests.get(url, headers=headers, timeout=5)
        print(f"[+] Status Code: {response.status_code}")
        print("Response JSON:")
        import pprint
        pprint.pprint(response.json())
    except Exception as e:
        print(f"[-] Request failed: {e}")

if __name__ == "__main__":
    main()
