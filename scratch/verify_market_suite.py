import urllib.request
import urllib.error
import json
import io
from PIL import Image

BASE = 'http://127.0.0.1:8001'
FRONTEND = 'http://127.0.0.1:5173'

def run():
    print("=" * 65)
    print("  COMPREHENSIVE MARKET PRICES & FULL PLATFORM REGRESSION")
    print("=" * 65)

    # 1. Backend Connectivity
    print("\n[Step 1] Checking Backend Server on port 8001...")
    try:
        with urllib.request.urlopen(f"{BASE}/docs", timeout=5) as resp:
            assert resp.status == 200
            print("  PASS: FastAPI backend is live on http://127.0.0.1:8001")
    except Exception as e:
        print(f"  FAIL: Backend connection error: {e}")
        return

    # 2. Frontend Connectivity
    print("\n[Step 2] Checking Frontend Dev Server on port 5173...")
    try:
        with urllib.request.urlopen(f"{FRONTEND}/", timeout=5) as resp:
            assert resp.status == 200
            print("  PASS: Frontend Vite server is live on http://127.0.0.1:5173")
    except Exception as e:
        print(f"  WARNING: Frontend dev server check: {e}")

    # 3. Unauthenticated Access Protection
    print("\n[Step 3] Testing Unauthenticated Access Protection on /api/market-prices...")
    try:
        req = urllib.request.Request(f"{BASE}/api/market-prices")
        urllib.request.urlopen(req)
        print("  FAIL: Endpoint should have rejected unauthenticated request!")
        return
    except urllib.error.HTTPError as err:
        assert err.code == 401, f"Expected 401, got {err.code}"
        print(f"  PASS: Endpoint returned HTTP {err.code} Unauthorized as expected.")

    # 4. Authenticate as Ramesh Patel
    print("\n[Step 4] Authenticating as Ramesh Patel...")
    login_data = json.dumps({'email': 'ramesh.patel@example.com', 'password': 'StrongPassword123'}).encode()
    req_login = urllib.request.Request(
        f"{BASE}/api/auth/login",
        data=login_data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req_login) as resp:
        tokens = json.loads(resp.read().decode())
        token = tokens['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        print("  PASS: Login successful. JWT token acquired.")

    # 5. Fetch Market Prices (Default crop fallback to user's primary crop)
    print("\n[Step 5] Fetching Market Prices (User's primary crop default)...")
    req_mkt = urllib.request.Request(f"{BASE}/api/market-prices", headers=headers)
    with urllib.request.urlopen(req_mkt) as resp:
        mkt_res = json.loads(resp.read().decode())
        print("  PASS: Received Market Prices Response:")
        print(f"    - Success: {mkt_res.get('success')}")
        print(f"    - Configured: {mkt_res.get('configured')}")
        print(f"    - Status: {mkt_res.get('status')}")
        print(f"    - Source: {mkt_res.get('source')}")
        print(f"    - Selected Crop: {mkt_res.get('selected_crop')}")
        print(f"    - Results Count: {len(mkt_res.get('results', []))}")
        print(f"    - Message: {mkt_res.get('message')}")

        assert mkt_res.get('success') is True, "Success should be True"
        assert mkt_res.get('selected_crop') == 'Groundnut', f"Expected 'Groundnut', got {mkt_res.get('selected_crop')}"
        assert mkt_res.get('status') == 'unconfigured', "Expected 'unconfigured' when no API key is set"
        assert len(mkt_res.get('results', [])) == 0, "Must NEVER invent prices when unconfigured!"
        assert mkt_res.get('summary') is None, "Summary must be None when no real records exist"

    # 6. Test Filtering by Crop and Location
    print("\n[Step 6] Testing Market Prices with explicit query params (crop=Wheat, location=Gujarat)...")
    req_filter = urllib.request.Request(f"{BASE}/api/market-prices?crop=Wheat&location=Gujarat", headers=headers)
    with urllib.request.urlopen(req_filter) as resp:
        filter_res = json.loads(resp.read().decode())
        print(f"  PASS: Filter applied. Crop: '{filter_res.get('selected_crop')}', Location: '{filter_res.get('selected_location')}'")
        assert filter_res.get('selected_crop') == 'Wheat'
        assert filter_res.get('selected_location') == 'Gujarat'

    # 7. Regression Test: Smart Irrigation Module
    print("\n[Step 7] Regression Test: Smart Irrigation Advisory (/api/irrigation/advisory)...")
    req_irr = urllib.request.Request(f"{BASE}/api/irrigation/advisory", headers=headers)
    with urllib.request.urlopen(req_irr) as resp:
        irr_data = json.loads(resp.read().decode())
        assert irr_data.get('success') is True
        print(f"  PASS: Smart Irrigation operational. Status: {irr_data.get('status')} ({irr_data.get('status_label')})")

    # 8. Regression Test: Weather Intelligence (/api/weather/current)
    print("\n[Step 8] Regression Test: Weather Intelligence (/api/weather/current)...")
    req_weather = urllib.request.Request(f"{BASE}/api/weather/current", headers=headers)
    with urllib.request.urlopen(req_weather) as resp:
        w_data = json.loads(resp.read().decode())
        assert w_data.get('success') is True
        print(f"  PASS: Weather module operational. Location: {w_data.get('location')}, Condition: {w_data.get('current', {}).get('weather_condition')}")

    # 9. Regression Test: Crop Advisory (/api/crop-advisory/recommend)
    print("\n[Step 9] Regression Test: Crop Advisory (/api/crop-advisory/recommend)...")
    req_crop = urllib.request.Request(
        f"{BASE}/api/crop-advisory/recommend",
        data=b'{}',
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req_crop) as resp:
        crop_res = json.loads(resp.read().decode())
        assert crop_res.get('success') is True
        print(f"  PASS: Crop advisory returned {len(crop_res.get('recommendations', []))} recommendations.")

    # 10. Regression Test: Plant Health Vision (/api/plant-health/analyze)
    print("\n[Step 10] Regression Test: Plant Health Vision (/api/plant-health/analyze)...")
    img = Image.new("RGB", (64, 64), color="darkgreen")
    img_buf = io.BytesIO()
    img.save(img_buf, format="JPEG")
    img_bytes = img_buf.getvalue()

    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = bytearray()
    body.extend(f'--{boundary}\r\n'.encode('utf-8'))
    body.extend(b'Content-Disposition: form-data; name="file"; filename="healthy_leaf.jpg"\r\n')
    body.extend(b'Content-Type: image/jpeg\r\n\r\n')
    body.extend(img_bytes)
    body.extend(b'\r\n')
    body.extend(f'--{boundary}--\r\n'.encode('utf-8'))

    req_health = urllib.request.Request(
        f"{BASE}/api/plant-health/analyze",
        data=bytes(body),
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': f'multipart/form-data; boundary={boundary}'
        },
        method='POST'
    )
    with urllib.request.urlopen(req_health) as resp:
        health_res = json.loads(resp.read().decode())
        assert health_res.get('image_valid') is True
        print(f"  PASS: Plant health operational. Status: {health_res.get('status')}")

    # 11. Regression Test: Farmer Profile (/api/auth/me)
    print("\n[Step 11] Regression Test: Farmer Profile (/api/auth/me)...")
    req_profile = urllib.request.Request(f"{BASE}/api/auth/me", headers=headers)
    with urllib.request.urlopen(req_profile) as resp:
        p = json.loads(resp.read().decode())
        assert p.get('full_name') == 'Ramesh Patel'
        print(f"  PASS: Profile intact for {p.get('full_name')}, Primary Crop: {p.get('primary_crop')}")

    print("\n" + "=" * 65)
    print("  ALL 11 VERIFICATION CHECKS PASSED - MARKET PRICES MODULE READY")
    print("=" * 65)

if __name__ == '__main__':
    run()
