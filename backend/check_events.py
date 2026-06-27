import asyncio, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def main():
    import urllib.request
    login_data = json.dumps({'email': 'hello@bhoomidecoration.com', 'password': 'admin123'}).encode()
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        token = json.loads(resp.read().decode())['token']

    req2 = urllib.request.Request('http://127.0.0.1:8000/api/events?page=1&limit=10', headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req2) as resp:
        events_data = json.loads(resp.read().decode())
    
    items_list = events_data.get('items', [])
    print(f"Total events on page: {len(items_list)}")
    
    for ev in items_list:
        ib = ev.get('items_booked', '')
        try:
            parsed = json.loads(ib)
            has_items = isinstance(parsed, dict) and len(parsed) > 0
        except Exception:
            parsed = None
            has_items = False
        
        print(f"  {ev['id'][:20]} | items_booked[:60]={repr(ib[:60])} | valid={parsed is not None} | has_items={has_items}")

    # Also check first event's single endpoint for resolved_items
    if items_list:
        first_id = items_list[0]['id']
        req3 = urllib.request.Request(f'http://127.0.0.1:8000/api/events/{first_id}', headers={'Authorization': f'Bearer {token}'})
        with urllib.request.urlopen(req3) as resp:
            single = json.loads(resp.read().decode())
        print(f"\nSingle event {first_id[:20]}:")
        print(f"  resolved_items count: {len(single.get('resolved_items', []))}")
        print(f"  items_booked: {repr(single.get('items_booked','')[:80])}")
        print(f"  rental_days: {single.get('rental_days')}")

asyncio.run(main())
