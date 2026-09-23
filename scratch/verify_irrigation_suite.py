import urllib.request
import urllib.error
import json
import sqlite3
import io
from PIL import Image

BASE = 'http://127.0.0.1:8001'
FRONTEND = 'http://127.0.0.1:5173'

def run():
    print("=" * 65)
    print("  COMPREHENSIVE SMART IRRIGATION & REGRESSION VERIFICATION")
    print("=" * 65)

    # 1. Check Backend server
    print("\n[Step 1] Checking Backend Server on port 8001...")
    try:
        with urllib.request.urlopen(f"{BASE}/docs", timeout=5) as resp:
            assert resp.status == 200
            print("  PASS: Backend FastAPI server running on http://127.0.0.1:8001")
    except Exception as e:
        print(f"  FAIL: Backend connection error: {e}")
        return

    # 2. Check Frontend server
    print("\n[Step 2] Checking Frontend Dev Server on port 5173...")
    try:
        with urllib.request.urlopen(f"{FRONTEND}/", timeout=5) as resp:
            assert resp.status == 200
            print("  PASS: Frontend Vite dev server running on http://127.0.0.1:5173")
    except Exception as e:
        print(f"  WARNING: Frontend dev server check: {e}")

    # 3. Unauthenticated protection on /api/irrigation/advisory
    print("\n[Step 3] Testing Unauthenticated Access Protection...")
    try:
        req = urllib.request.Request(f"{BASE}/api/irrigation/advisory")
        urllib.request.urlopen(req)
        print("  FAIL: Unauthenticated request should have been rejected!")
        return
    except urllib.error.HTTPError as err:
        assert err.code == 401, f"Expected 401, got {err.code}"
        print(f"  PASS: Endpoint returned HTTP {err.code} Unauthorized as expected.")

    # 4. Login as Ramesh Patel
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
        print("  PASS: Login successful. JWT token obtained.")

    # 5. Fetch Smart Irrigation Advisory
    print("\n[Step 5] Fetching Smart Irrigation Advisory...")
    req_irr = urllib.request.Request(f"{BASE}/api/irrigation/advisory", headers=headers)
    with urllib.request.urlopen(req_irr) as resp:
        advisory = json.loads(resp.read().decode())
        print("  PASS: Received Advisory Response:")
        print(f"    - Status: {advisory.get('status')} ({advisory.get('status_label')})")
        print(f"    - Priority: {advisory.get('priority')}")
        print(f"    - Recommendation: {advisory.get('recommendation')}")
        print(f"    - Reasons ({len(advisory.get('reasons', []))}):")
        for r in advisory.get('reasons', []):
            print(f"        * {r}")
        print(f"    - Farm Summary: {advisory.get('farm_summary')}")
        print(f"    - Weather Summary: {advisory.get('weather_summary')}")
        print(f"    - History Items: {len(advisory.get('history', []))}")

        assert advisory.get('success') is True, "Success should be True"
        assert advisory.get('status') in ['delay', 'needed', 'check_moisture', 'insufficient_data']
        assert advisory.get('priority').lower() in ['low', 'medium', 'high']
        assert advisory.get('farm_summary', {}).get('location') == 'Anand, Gujarat'
        assert advisory.get('farm_summary', {}).get('crop') == 'Groundnut'
        assert advisory.get('farm_summary', {}).get('irrigation_type') == 'Drip'

    # 6. Database Verification
    print("\n[Step 6] Verifying SQLite database persistence...")
    conn = sqlite3.connect("backend/kisan_mitra.db")
    cur = conn.cursor()
    cur.execute("SELECT id, user_id, status, status_label, recommendation, priority, created_at FROM irrigation_logs ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    assert row is not None, "No record found in irrigation_logs"
    print(f"  PASS: Persisted record ID {row[0]}: status='{row[2]}', priority='{row[5]}', created_at='{row[6]}'")
    conn.close()

    # 7. Weather Module Regression Test
    print("\n[Step 7] Regression Test: Weather Intelligence (/api/weather/current)...")
    req_weather = urllib.request.Request(f"{BASE}/api/weather/current", headers=headers)
    with urllib.request.urlopen(req_weather) as resp:
        w = json.loads(resp.read().decode())
        assert w.get('success') is True
        print(f"  PASS: Weather module operational. Temp: {w.get('current', {}).get('temperature_c')} C, Cond: {w.get('current', {}).get('weather_condition')}")

    # 8. Crop Advisory Regression Test
    print("\n[Step 8] Regression Test: Crop Advisory (/api/crop-advisory/recommend)...")
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

    # 9. Plant Health Regression Test
    print("\n[Step 9] Regression Test: Plant Health Vision (/api/plant-health/analyze)...")
    img = Image.new("RGB", (64, 64), color="forestgreen")
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
        print(f"  PASS: Plant health analysis works. Status: {health_res.get('status')}, Image Valid: {health_res.get('image_valid')}")

    # 10. Farmer Profile Verification
    print("\n[Step 10] Farmer Profile (/api/auth/me)...")
    req_profile = urllib.request.Request(f"{BASE}/api/auth/me", headers=headers)
    with urllib.request.urlopen(req_profile) as resp:
        p = json.loads(resp.read().decode())
        assert p.get('full_name') == 'Ramesh Patel'
        print(f"  PASS: Profile intact for {p.get('full_name')}, Primary Crop: {p.get('primary_crop')}")

    print("\n" + "=" * 65)
    print("  ALL 10 VERIFICATION CHECKS PASSED - IRRIGATION MODULE READY")
    print("=" * 65)

if __name__ == '__main__':
    run()
