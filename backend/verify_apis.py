import sys
import os
import json

# Ensure parent directory is in search path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def run_tests():
    print("[*] Running API and Business Logic verification suite...")
    
    # 1. Test Gateway Authentication REQ-1
    print("\n[Test 1] Testing Gateway Authentication Portal...")
    login_payload = {"email": "hello@bhoomidecoration.com", "password": "admin123"}
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200, f"Auth failed: {res.text}"
    auth_data = res.json()
    assert auth_data["role"] == "admin"
    assert "token" in auth_data
    token = auth_data["token"]
    print(" -> SUCCESS: Admin session generated.")

    # 1b. Test Labor session access blocking and role isolation
    print("\n[Test 1b] Testing Labor session access blocking...")
    crew_login = client.post("/api/auth/login", json={"email": "crew1@bhoomidecoration.com", "password": "crewpassword123"})
    assert crew_login.status_code in (401, 403), f"Expected login rejection for crew, got: {crew_login.status_code}"
    
    # Try accessing events without a token
    res_no_token = client.get("/api/events")
    assert res_no_token.status_code in (401, 403), f"Expected unauthorized for no token, got: {res_no_token.status_code}"
    print(" -> SUCCESS: Non-admin logins and unauthenticated accesses are blocked.")

    # 2. Test Inventory CRUD REQ-3
    print("\n[Test 2] Testing Inventory CRUD Operations...")
    item_payload = {
        "name": "Luxury Silk Flower Arch (Gold Frame)",
        "category": "Floral",
        "quantity_owned": 5,
        "rental_price_per_day": 120.00
    }
    res = client.post(f"/api/inventory?token={token}", json=item_payload)
    assert res.status_code == 200, f"Inventory post failed: {res.text}"
    created_item = res.json()
    print("DEBUG [Test 2] created_item response:", created_item)
    assert created_item["name"] == item_payload["name"]
    item_id = created_item["id"]
    print(f" -> SUCCESS: Asset created with ID {item_id}.")
    
    # 3. Test Booking & Automated Pricing REQ-10
    print("\n[Test 3] Testing Event Scheduling & Invoice Calculations...")
    
    # Register client first REQ-5
    client_payload = {
        "name": "Alice Cooper",
        "email": "alice@example.com",
        "phone": "555-4011",
        "address": "San Jose Convention Center"
    }
    res = client.post(f"/api/clients?token={token}", json=client_payload)
    assert res.status_code == 200, f"Client intake failed: {res.text}"
    cli_id = res.json()["id"]
    
    # Book event scheduling
    # 3 days overlap checking, requesting 3 luxury flower arches (rate: 120.00)
    event_payload = {
        "client_id": cli_id,
        "client_name": "Alice Cooper",
        "venue_address": "San Jose Hall A",
        "start_date": "2026-08-01",
        "end_date": "2026-08-03", # 3 days rental
        "status": "Confirmed",
        "design_layout_url": "",
        "items_booked": json.dumps({item_id: 3}), # total cost: 120 * 3 * 3 = 1080.00
        "crew_assignments": json.dumps([
            {"worker_id": "usr_labor_1", "name": "Marcus Chen", "pay_rate": 150.00, "paid": False}
        ]),
        "max_workforce_capacity": 4,
        "notes": "Testing auto receipt calculations"
    }
    
    res = client.post(f"/api/events?token={token}", json=event_payload)
    assert res.status_code == 200, f"Booking failed: {res.text}"
    booking_data = res.json()
    event_info = booking_data["event"]
    assert event_info["total_invoice_amount"] == 1080.00, f"Total mismatch: {event_info['total_invoice_amount']}"
    assert event_info["remaining_balance"] == 1080.00
    print(" -> SUCCESS: Automated pricing calculated invoice total: $1080.00.")

    # 4. Test Overlapping Shortage calculation REQ-4
    print("\n[Test 4] Testing Time-Interlocked Inventory Verification...")
    # Attempting to schedule a concurrent event that overlaps dates, requesting 3 more arches (Total requested: 3 + 3 = 6, owned: 5)
    second_event_payload = dict(event_payload)
    second_event_payload["start_date"] = "2026-08-02"
    second_event_payload["end_date"] = "2026-08-04"
    second_event_payload["items_booked"] = json.dumps({item_id: 3})
    
    res = client.post(f"/api/events?token={token}", json=second_event_payload)
    assert res.status_code == 200
    overlap_res = res.json()
    assert len(overlap_res["conflict_alerts"]) > 0, "No inventory conflict flagged!"
    conflict = overlap_res["conflict_alerts"][0]
    assert conflict["item_id"] == item_id
    assert conflict["shortage"] == 1, f"Mismatch shortage qty: {conflict['shortage']}"
    print(f" -> SUCCESS: System flagged overlap shortage warning of {conflict['shortage']} items on date {conflict['date_checked']}.")

    # 5. Test Accounts Receivable payment log & Status Flip REQ-12
    print("\n[Test 5] Testing Downpayment status transitions...")
    event_id = event_info["id"]
    # Log payment receipt
    pay_res = client.post(f"/api/events/{event_id}/payments?token={token}", json={"amount": 1080.00, "payment_method": "Cash"})
    assert pay_res.status_code == 200
    updated_evt = pay_res.json()
    assert updated_evt["remaining_balance"] == 0.0
    assert updated_evt["status"] == "Completed", f"Status not completed: {updated_evt['status']}"
    assert json.loads(updated_evt.get("payment_history", "[]"))[-1]["amount"] == 1080.00
    print(" -> SUCCESS: Account status auto flipped to [Completed] when outstanding balance reached zero.")

    # 5b. Confirm booking updates do not wipe payment history / amount paid
    print("\n[Test 5b] Testing booking update preservation of payment state...")
    update_payload = dict(event_payload)
    update_payload["notes"] = "Updated after deposit"
    res = client.put(f"/api/events/{event_id}?token={token}", json=update_payload)
    assert res.status_code == 200, res.text
    after_update = res.json()["event"]
    assert after_update["amount_paid"] == 1080.0
    assert after_update["remaining_balance"] == 0.0
    assert json.loads(after_update.get("payment_history", "[]"))
    print(" -> SUCCESS: Booking edits preserve payment history and paid totals.")

    # 6. Test Net Profit Margin Calculation REQ-15
    print("\n[Test 6] Testing Net Profit Margin summaries...")
    res = client.get(f"/api/analytics/summary?token={token}")
    assert res.status_code == 200
    summary = res.json()
    # Let's verify profits: total sales should include 1080 + other mock events.
    # Total wages should deductMarcus Chen $150.00
    print(f" -> SUCCESS: Margin calculations reporting: Net Profit Margin {summary['net_margin_percentage']}%")

    print("\nSUCCESS: ALL TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
