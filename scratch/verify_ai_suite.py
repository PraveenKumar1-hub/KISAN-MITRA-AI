import sys
import urllib.request
import urllib.error
import json
import io
from PIL import Image

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://127.0.0.1:8001'
FRONTEND = 'http://127.0.0.1:5173'

def run():
    print("=" * 65)
    print("  COMPREHENSIVE AI ASSISTANT & FULL PLATFORM REGRESSION")
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
    print("\n[Step 3] Testing Unauthenticated Access Protection on POST /api/ai/chat...")
    try:
        req = urllib.request.Request(
            f"{BASE}/api/ai/chat",
            data=json.dumps({"message": "Hello"}).encode(),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
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
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        print("  PASS: Login successful. JWT token acquired.")

    # 5. Empty Message Validation
    print("\n[Step 5] Testing Empty Message Validation...")
    try:
        req_empty = urllib.request.Request(
            f"{BASE}/api/ai/chat",
            data=json.dumps({"message": ""}).encode(),
            headers=headers,
            method="POST"
        )
        urllib.request.urlopen(req_empty)
        print("  FAIL: Empty message should have triggered validation error!")
        return
    except urllib.error.HTTPError as err:
        assert err.code == 422, f"Expected 422, got {err.code}"
        print(f"  PASS: Empty message rejected with HTTP {err.code} Unprocessable Entity.")

    # 6. Message Length > 2000 Characters Validation
    print("\n[Step 6] Testing Message Length Limit (Max 2000 characters)...")
    try:
        req_long = urllib.request.Request(
            f"{BASE}/api/ai/chat",
            data=json.dumps({"message": "A" * 2005}).encode(),
            headers=headers,
            method="POST"
        )
        urllib.request.urlopen(req_long)
        print("  FAIL: Excessively long message should have been rejected!")
        return
    except urllib.error.HTTPError as err:
        assert err.code == 422, f"Expected 422, got {err.code}"
        print(f"  PASS: Long message (> 2000 chars) rejected with HTTP {err.code}.")

    # 7. Test Multilingual Language Detection via Chat Endpoint
    print("\n[Step 7] Testing Multilingual Language Detection on /api/ai/chat...")
    test_queries = [
        ("What crop is suitable for my farm?", "English"),
        ("गेहूं के लिए कौन सी खाद अच्छी है?", "Hindi"),
        ("bhai groundnut ke liye kaunsi khaad use karu?", "Hinglish")
    ]

    for q, expected_lang in test_queries:
        req_q = urllib.request.Request(
            f"{BASE}/api/ai/chat",
            data=json.dumps({"message": q}).encode(),
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req_q) as resp_q:
            res_json = json.loads(resp_q.read().decode())
            print(f"  Query: '{q[:35]}...' -> Detected Language: {res_json.get('language')}")
            assert res_json.get('language') == expected_lang, f"Expected {expected_lang}, got {res_json.get('language')}"
            assert isinstance(res_json.get('sources'), list), "Sources must be a list"
            assert len(res_json.get('sources')) == 0, "No fake sources allowed!"
            assert res_json.get('answer'), "Answer must not be empty"

    print("  PASS: Multilingual detection and response format verified.")

    # 8. Regression Test: Market Prices Module
    print("\n[Step 8] Regression Test: Market Prices (/api/market-prices)...")
    req_mkt = urllib.request.Request(f"{BASE}/api/market-prices", headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req_mkt) as resp:
        mkt_res = json.loads(resp.read().decode())
        assert mkt_res.get('success') is True
        assert mkt_res.get('selected_crop') == 'Groundnut'
        print(f"  PASS: Market Prices operational. Status: {mkt_res.get('status')}, Crop: {mkt_res.get('selected_crop')}")

    # 9. Regression Test: Smart Irrigation Advisory (/api/irrigation/advisory)
    print("\n[Step 9] Regression Test: Smart Irrigation Advisory (/api/irrigation/advisory)...")
    req_irr = urllib.request.Request(f"{BASE}/api/irrigation/advisory", headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req_irr) as resp:
        irr_data = json.loads(resp.read().decode())
        assert irr_data.get('success') is True
        print(f"  PASS: Smart Irrigation operational. Status: {irr_data.get('status')} ({irr_data.get('status_label')})")

    # 10. Regression Test: Weather Intelligence (/api/weather/current)
    print("\n[Step 10] Regression Test: Weather Intelligence (/api/weather/current)...")
    req_weather = urllib.request.Request(f"{BASE}/api/weather/current", headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req_weather) as resp:
        w_data = json.loads(resp.read().decode())
        assert w_data.get('success') is True
        print(f"  PASS: Weather module operational. Location: {w_data.get('location')}, Condition: {w_data.get('current', {}).get('weather_condition')}")

    # 11. Regression Test: Crop Advisory (/api/crop-advisory/recommend)
    print("\n[Step 11] Regression Test: Crop Advisory (/api/crop-advisory/recommend)...")
    req_crop = urllib.request.Request(
        f"{BASE}/api/crop-advisory/recommend",
        data=b'{}',
        headers=headers,
        method='POST'
    )
    with urllib.request.urlopen(req_crop) as resp:
        crop_res = json.loads(resp.read().decode())
        assert crop_res.get('success') is True
        print(f"  PASS: Crop advisory returned {len(crop_res.get('recommendations', []))} recommendations.")

    # 12. Regression Test: Plant Health Vision (/api/plant-health/analyze)
    print("\n[Step 12] Regression Test: Plant Health Vision (/api/plant-health/analyze)...")
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
        print(f"  PASS: Plant health operational. Status: {health_res.get('status')}")

    # 13. Regression Test: Farmer Profile (/api/auth/me)
    print("\n[Step 13] Regression Test: Farmer Profile (/api/auth/me)...")
    req_profile = urllib.request.Request(f"{BASE}/api/auth/me", headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req_profile) as resp:
        p = json.loads(resp.read().decode())
        assert p.get('full_name') == 'Ramesh Patel'
        print(f"  PASS: Profile intact for {p.get('full_name')}, Primary Crop: {p.get('primary_crop')}")

    print("\n" + "=" * 65)
    print("  ALL 13 VERIFICATION CHECKS PASSED - AI ASSISTANT FULLY OPERATIONAL")
    print("=" * 65)

if __name__ == '__main__':
    run()
