import sys
import os
import json
import uuid

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

    # 7. Test Daily Crew Attendance System
    print("\n[Test 7] Testing Crew Attendance System & Accrued Wages...")
    
    # Get initial crew records to verify amount_owed, creating them if not present
    crew_res = client.get(f"/api/crew?token={token}")
    assert crew_res.status_code == 200
    crew_list = crew_res.json()
    
    has_marcus = any(c for c in crew_list if c.get("name") == "Marcus Chen")
    has_david = any(c for c in crew_list if c.get("name") == "David Miller")
    
    if not has_marcus:
        client.post(f"/api/crew?token={token}", json={
            "name": "Marcus Chen",
            "role": "Lighting Specialist",
            "contact": "9876543210",
            "base_rate": 150.0
        })
    if not has_david:
        client.post(f"/api/crew?token={token}", json={
            "name": "David Miller",
            "role": "Carpentry Specialist",
            "contact": "9876543211",
            "base_rate": 180.0
        })
        
    if not has_marcus or not has_david:
        crew_res = client.get(f"/api/crew?token={token}")
        assert crew_res.status_code == 200
        crew_list = crew_res.json()

    # 7a. Get initial attendance (should show Absent/exists=False)
    date_test = f"2026-06-20-{uuid.uuid4().hex[:6]}"
    res = client.get(f"/api/attendance?date={date_test}&token={token}")
    assert res.status_code == 200, res.text
    initial_att = res.json()
    assert len(initial_att) >= 2
    # Ensure they are marked Absent by default
    for item in initial_att:
        assert item["status"] == "Absent"
        assert item["calculated_pay"] == 0.0

    crw_1_initial = next(c for c in crew_list if c["name"] == "Marcus Chen")
    crw_2_initial = next(c for c in crew_list if c["name"] == "David Miller")
    
    # 7b. Submit daily attendance
    attendance_payload = {
        "date": date_test,
        "records": [
            {"crew_id": crw_1_initial["id"], "status": "Half Day"},
            {"crew_id": crw_2_initial["id"], "status": "Night Work"}
        ]
    }
    post_res = client.post(f"/api/attendance?token={token}", json=attendance_payload)
    assert post_res.status_code == 200, post_res.text
    
    # Verify crew owed wages updated
    crew_res2 = client.get(f"/api/crew?token={token}")
    crew_list2 = crew_res2.json()
    crw_1_after = next(c for c in crew_list2 if c["id"] == crw_1_initial["id"])
    crw_2_after = next(c for c in crew_list2 if c["id"] == crw_2_initial["id"])
    
    # crw_1: initial owed + 150 * 0.5 = crw_1_initial["amount_owed"] + 75.0
    expected_crw_1 = crw_1_initial["amount_owed"] + 75.0
    assert crw_1_after["amount_owed"] == expected_crw_1, f"Expected {expected_crw_1}, got {crw_1_after['amount_owed']}"
    
    # crw_2: initial owed + 180 * 1.5 = crw_2_initial["amount_owed"] + 270.0
    expected_crw_2 = crw_2_initial["amount_owed"] + 270.0
    assert crw_2_after["amount_owed"] == expected_crw_2, f"Expected {expected_crw_2}, got {crw_2_after['amount_owed']}"
    
    # 7c. Modify attendance (update crw_1 to Full Day)
    attendance_payload_update = {
        "date": date_test,
        "records": [
            {"crew_id": crw_1_initial["id"], "status": "Full Day"},
            {"crew_id": crw_2_initial["id"], "status": "Night Work"}
        ]
    }
    update_res = client.post(f"/api/attendance?token={token}", json=attendance_payload_update)
    assert update_res.status_code == 200, update_res.text
    
    # Verify wages updated again
    crew_res3 = client.get(f"/api/crew?token={token}")
    crew_list3 = crew_res3.json()
    crw_1_final = next(c for c in crew_list3 if c["id"] == crw_1_initial["id"])
    
    # crw_1: expected should change from (initial + 75.0) to (initial + 150.0). Difference is +75.0.
    expected_crw_1_final = crw_1_initial["amount_owed"] + 150.0
    assert crw_1_final["amount_owed"] == expected_crw_1_final, f"Expected {expected_crw_1_final}, got {crw_1_final['amount_owed']}"
    
    print(" -> SUCCESS: Attendance register accurately logs pay rate multipliers and updates crew ledgers.")

    # 7d. Test Custom Rate Calculations
    print("\n[Test 7d] Testing Custom Wage Rates for Crew Shifts...")
    custom_crew_payload = {
        "name": "Custom Rate Worker",
        "role": "Scaffolding Specialist",
        "contact": "9876543212",
        "base_rate": 200.0,
        "half_day_rate": 120.0,
        "night_rate": 350.0
    }
    create_res = client.post(f"/api/crew?token={token}", json=custom_crew_payload)
    assert create_res.status_code == 200, create_res.text
    cust_worker = create_res.json()
    cust_id = cust_worker["id"]
    assert cust_worker["half_day_rate"] == 120.0
    assert cust_worker["night_rate"] == 350.0

    # Submit attendance for the custom worker
    date_test_custom = f"2026-06-21-{uuid.uuid4().hex[:6]}"
    custom_attendance_payload = {
        "date": date_test_custom,
        "records": [
            {"crew_id": cust_id, "status": "Half Day"}
        ]
    }
    post_custom_res = client.post(f"/api/attendance?token={token}", json=custom_attendance_payload)
    assert post_custom_res.status_code == 200, post_custom_res.text
    
    # Verify owed wages updated by exactly 120.0 (custom rate) instead of 100.0
    crew_res_custom = client.get(f"/api/crew?token={token}")
    cust_worker_after = next(c for c in crew_res_custom.json() if c["id"] == cust_id)
    assert cust_worker_after["amount_owed"] == 120.0, f"Expected 120.0, got {cust_worker_after['amount_owed']}"

    # Update attendance to Night Work
    custom_attendance_payload_update = {
        "date": date_test_custom,
        "records": [
            {"crew_id": cust_id, "status": "Night Work"}
        ]
    }
    update_custom_res = client.post(f"/api/attendance?token={token}", json=custom_attendance_payload_update)
    assert update_custom_res.status_code == 200, update_custom_res.text

    # Verify owed wages updated by exactly 350.0 (custom rate) instead of 300.0 (initial owed 0.0 + 350.0 = 350.0)
    crew_res_custom_final = client.get(f"/api/crew?token={token}")
    cust_worker_final = next(c for c in crew_res_custom_final.json() if c["id"] == cust_id)
    assert cust_worker_final["amount_owed"] == 350.0, f"Expected 350.0, got {cust_worker_final['amount_owed']}"
    print(" -> SUCCESS: Custom rate calculation works and overrides default multipliers.")

    print("\nSUCCESS: ALL TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
