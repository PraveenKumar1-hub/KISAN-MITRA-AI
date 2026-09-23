import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8001"

def run_tests():
    print("=" * 60)
    print("RUNNING CROP ADVISORY VERIFICATION SUITE")
    print("=" * 60)

    # 1. Test Unauthorized Access (No Token)
    print("\n[Test 1] Unauthorized access without JWT token...")
    req_unauth = urllib.request.Request(
        f"{BASE_URL}/api/crop-advisory/recommend",
        data=b"{}",
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req_unauth) as resp:
            print("FAILED: Expected 401, got:", resp.status)
            sys.exit(1)
    except urllib.error.HTTPError as e:
        assert e.code == 401, f"Expected 401, got {e.code}"
        print(f"PASSED: Received expected HTTP 401 Unauthorized ({e.reason})")

    # Authenticate test user
    print("\n[Auth] Logging in as Ramesh Patel...")
    req_login = urllib.request.Request(
        f"{BASE_URL}/api/auth/login",
        data=json.dumps({"email": "ramesh.patel@example.com", "password": "StrongPassword123"}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req_login) as resp:
        auth_data = json.loads(resp.read().decode())
        token = auth_data["access_token"]
        print("Logged in successfully. Token acquired.")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 2. Test Missing Required Input (soil_type is empty)
    print("\n[Test 2] Missing required input (soil_type = '')...")
    req_missing = urllib.request.Request(
        f"{BASE_URL}/api/crop-advisory/recommend",
        data=json.dumps({"soil_type": "", "location": "Anand, Gujarat"}).encode(),
        headers=headers,
        method="POST"
    )
    try:
        with urllib.request.urlopen(req_missing) as resp:
            print("FAILED: Expected 400 for empty soil_type, got:", resp.status)
            sys.exit(1)
    except urllib.error.HTTPError as e:
        assert e.code == 400, f"Expected 400, got {e.code}"
        err_body = json.loads(e.read().decode())
        print(f"PASSED: Received HTTP 400 with detail: '{err_body.get('detail')}'")

    # 3. Test Invalid Input (negative farm size: -5)
    print("\n[Test 3] Invalid input (farm_size = '-5')...")
    req_invalid = urllib.request.Request(
        f"{BASE_URL}/api/crop-advisory/recommend",
        data=json.dumps({"soil_type": "Black", "location": "Anand, Gujarat", "farm_size": "-5"}).encode(),
        headers=headers,
        method="POST"
    )
    try:
        with urllib.request.urlopen(req_invalid) as resp:
            print("FAILED: Expected 400 for negative farm size, got:", resp.status)
            sys.exit(1)
    except urllib.error.HTTPError as e:
        assert e.code == 400, f"Expected 400, got {e.code}"
        err_body = json.loads(e.read().decode())
        print(f"PASSED: Received HTTP 400 with detail: '{err_body.get('detail')}'")

    # 4. Test Valid Input using User Profile Defaults
    print("\n[Test 4] Valid request using profile defaults...")
    req_default = urllib.request.Request(
        f"{BASE_URL}/api/crop-advisory/recommend",
        data=json.dumps({}).encode(),
        headers=headers,
        method="POST"
    )
    with urllib.request.urlopen(req_default) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        data1 = json.loads(resp.read().decode())
        assert data1["success"] is True
        assert len(data1["recommendations"]) == 3
        print(f"PASSED: 3 recommendations returned. Top: {data1['recommendations'][0]['crop']} ({data1['recommendations'][0]['match_score']}%)")

    # 5. Test Parameter Change: Override with Black Soil + Maharashtra + Cotton
    print("\n[Test 5] Changing inputs to Black soil, Drip irrigation, Maharashtra, Cotton...")
    req_black = urllib.request.Request(
        f"{BASE_URL}/api/crop-advisory/recommend",
        data=json.dumps({
            "soil_type": "Black",
            "irrigation_type": "Drip",
            "location": "Nagpur, Maharashtra",
            "farm_size": "10 Acres",
            "primary_crop": "Cotton"
        }).encode(),
        headers=headers,
        method="POST"
    )
    with urllib.request.urlopen(req_black) as resp:
        assert resp.status == 200
        data_black = json.loads(resp.read().decode())
        top_crops = [r["crop"] for r in data_black["recommendations"]]
        assert "Cotton" in top_crops, f"Expected Cotton in top crops for Black soil/Maharashtra, got {top_crops}"
        print(f"PASSED: Successfully responds to changed inputs. Top recommendations: {top_crops} ({data_black['recommendations'][0]['match_score']}% Match)")
        print(f"Top Crop Reasons: {data_black['recommendations'][0]['reasons']}")

    # 6. Test Parameter Change: Override with Sandy Loam Soil + Sprinkler + Rajasthan + Mustard
    print("\n[Test 6] Changing inputs to Sandy Loam, Sprinkler, Rajasthan, Mustard...")
    req_sandy = urllib.request.Request(
        f"{BASE_URL}/api/crop-advisory/recommend",
        data=json.dumps({
            "soil_type": "Sandy Loam",
            "irrigation_type": "Sprinkler",
            "location": "Alwar, Rajasthan",
            "farm_size": "4 Acres",
            "primary_crop": "Mustard"
        }).encode(),
        headers=headers,
        method="POST"
    )
    with urllib.request.urlopen(req_sandy) as resp:
        assert resp.status == 200
        data_sandy = json.loads(resp.read().decode())
        top_crop_sandy = data_sandy["recommendations"][0]
        assert top_crop_sandy["crop"] in ["Mustard", "Groundnut"], f"Expected Mustard or Groundnut, got {top_crop_sandy['crop']}"
        print(f"PASSED: Output changes dynamically and accurately. Top crop: {top_crop_sandy['crop']} ({top_crop_sandy['match_score']}% Match)")

    # 7. Test Determinism & Consistency (Repeat same request 3 times)
    print("\n[Test 7] Determinism verification (repeating test 6 three times)...")
    for idx in range(3):
        with urllib.request.urlopen(req_sandy) as resp:
            repeat_data = json.loads(resp.read().decode())
            assert repeat_data == data_sandy, f"Run {idx+1} produced inconsistent scores!"
    print("PASSED: 100% deterministic, no random scoring, perfectly consistent.")

    # 8. Schema Integrity Check: Ensure NO fake or unvetted fields
    print("\n[Test 8] Schema integrity check...")
    for rec in data_black["recommendations"]:
        allowed_keys = {"crop", "match_score", "confidence", "reasons", "water_requirement", "season", "cultivation_note"}
        actual_keys = set(rec.keys())
        assert actual_keys == allowed_keys, f"Found unexpected fields: {actual_keys - allowed_keys}"
        # Ensure no fake yield, fake profit, fake market price, fake weather
        assert "yield" not in rec
        assert "profit" not in rec
        assert "price" not in rec
        assert "weather" not in rec
    print("PASSED: Clean agronomic recommendation schema with no fake fields.")

    print("\n" + "=" * 60)
    print("ALL CROP ADVISORY TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
