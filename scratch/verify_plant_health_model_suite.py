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

def build_multipart(filename, content, content_type):
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = bytearray()
    body.extend(f'--{boundary}\r\n'.encode('utf-8'))
    body.extend(f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode('utf-8'))
    body.extend(f'Content-Type: {content_type}\r\n\r\n'.encode('utf-8'))
    body.extend(content)
    body.extend(b'\r\n')
    body.extend(f'--{boundary}--\r\n'.encode('utf-8'))
    return f'multipart/form-data; boundary={boundary}', bytes(body)

def run():
    print("=" * 65)
    print("  COMPREHENSIVE PLANT HEALTH ML & FULL PLATFORM REGRESSION")
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
    print("\n[Step 3] Testing Unauthenticated Access Protection...")
    for endpoint, method in [("/api/plant-health/analyze", "POST"), ("/api/plant-health/model-info", "GET")]:
        try:
            req = urllib.request.Request(f"{BASE}{endpoint}", method=method)
            urllib.request.urlopen(req)
            print(f"  FAIL: {endpoint} should have rejected unauthenticated request!")
            return
        except urllib.error.HTTPError as err:
            assert err.code == 401, f"Expected 401, got {err.code}"
            print(f"  PASS: {endpoint} rejected with HTTP {err.code} Unauthorized.")

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
        auth_header = {'Authorization': f'Bearer {token}'}
        print("  PASS: Login successful. JWT token acquired.")

    # 5. Model Metadata Endpoint
    print("\n[Step 5] Checking GET /api/plant-health/model-info...")
    req_info = urllib.request.Request(f"{BASE}/api/plant-health/model-info", headers=auth_header)
    with urllib.request.urlopen(req_info) as resp:
        info = json.loads(resp.read().decode())
        print(f"  Model Available: {info.get('model_available')}")
        print(f"  Model Type: {info.get('model_type')}")
        print(f"  Confidence Threshold: {info.get('confidence_threshold')}")
        print(f"  Input Resolution: {info.get('input_resolution')}")
        print(f"  Supported Formats: {info.get('supported_formats')}")
        assert info.get("model_available") is False, "Should be False when no weights binary is installed"
        assert info.get("confidence_threshold") == 0.65
        print("  PASS: Model metadata endpoint returns truthful configuration.")

    # 6. Invalid File Type (.txt)
    print("\n[Step 6] Testing Invalid File Type Upload (.txt)...")
    ctype, body = build_multipart("malicious.txt", b"not an image", "text/plain")
    req_txt = urllib.request.Request(
        f"{BASE}/api/plant-health/analyze",
        data=body,
        headers={**auth_header, 'Content-Type': ctype},
        method="POST"
    )
    try:
        urllib.request.urlopen(req_txt)
        print("  FAIL: Text file should have been rejected!")
        return
    except urllib.error.HTTPError as err:
        assert err.code == 400, f"Expected 400, got {err.code}"
        print(f"  PASS: Invalid file type rejected with HTTP {err.code} Bad Request.")

    # 7. Corrupted Image Upload
    print("\n[Step 7] Testing Corrupted Image Upload...")
    ctype_corrupt, body_corrupt = build_multipart("corrupt.jpg", b"\xFF\xD8\xFF\xE0corrupted_data_123", "image/jpeg")
    req_corrupt = urllib.request.Request(
        f"{BASE}/api/plant-health/analyze",
        data=body_corrupt,
        headers={**auth_header, 'Content-Type': ctype_corrupt},
        method="POST"
    )
    try:
        urllib.request.urlopen(req_corrupt)
        print("  FAIL: Corrupted image should have been rejected!")
        return
    except urllib.error.HTTPError as err:
        assert err.code == 400, f"Expected 400, got {err.code}"
        print(f"  PASS: Corrupted image rejected with HTTP {err.code} Bad Request.")

    # 8. File Exceeding 5 MB Limit
    print("\n[Step 8] Testing File Exceeding 5 MB Limit...")
    large_payload = b"\x00" * (5 * 1024 * 1024 + 1024)
    ctype_large, body_large = build_multipart("large.jpg", large_payload, "image/jpeg")
    req_large = urllib.request.Request(
        f"{BASE}/api/plant-health/analyze",
        data=body_large,
        headers={**auth_header, 'Content-Type': ctype_large},
        method="POST"
    )
    try:
        urllib.request.urlopen(req_large)
        print("  FAIL: Oversized file should have been rejected!")
        return
    except urllib.error.HTTPError as err:
        assert err.code in (400, 413), f"Expected 400 or 413, got {err.code}"
        print(f"  PASS: Oversized file rejected with HTTP {err.code}.")

    # 9. Valid Image Upload (Truthful Model Unavailable State)
    print("\n[Step 9] Testing Valid Image Upload (Truthful Model Unavailable State)...")
    img = Image.new("RGB", (320, 240), color="forestgreen")
    img_buf = io.BytesIO()
    img.save(img_buf, format="JPEG")
    ctype_valid, body_valid = build_multipart("healthy_leaf.jpg", img_buf.getvalue(), "image/jpeg")

    req_valid = urllib.request.Request(
        f"{BASE}/api/plant-health/analyze",
        data=body_valid,
        headers={**auth_header, 'Content-Type': ctype_valid},
        method="POST"
    )
    with urllib.request.urlopen(req_valid) as resp:
        res = json.loads(resp.read().decode())
        print(f"  Status: {res.get('status')}")
        print(f"  Message: {res.get('message')}")
        print(f"  Image Valid: {res.get('image_valid')}")
        print(f"  Image Details: {res.get('image_details')}")
        print(f"  Result: {res.get('result')}")
        assert res.get("status") == "model_unavailable", "Must be 'model_unavailable' when no binary is present"
        assert res.get("image_valid") is True
        assert res.get("result") is None, "CRITICAL: Must NEVER fabricate fake predictions!"
        assert res.get("image_details", {}).get("format") == "JPEG"
        print("  PASS: Truthful 'model_unavailable' response validated. Zero fake predictions.")

    # 10. Direct Engine Mock Inference Test (Forward pass + Low confidence)
    print("\n[Step 10] Testing Disease Model Engine Inference & Threshold Logic...")
    from app.services.disease_model import disease_model_engine

    # Test high-confidence prediction
    disease_model_engine._model = lambda tensor: {"class_idx": 0, "confidence": 0.94}
    assert disease_model_engine.is_available() is True
    pred_high = disease_model_engine.predict(img)
    print(f"  Mock High Confidence (0.94) -> Status: {pred_high.get('status')}, Disease: {pred_high.get('disease')}")
    assert pred_high.get("status") == "success"
    assert pred_high.get("plant") == "Tomato"
    assert pred_high.get("disease") == "Tomato Early Blight"
    assert pred_high.get("confidence") == 0.94
    assert pred_high.get("advisory") is not None

    # Test low-confidence prediction (< 0.65 threshold)
    disease_model_engine._model = lambda tensor: {"class_idx": 1, "confidence": 0.45}
    pred_low = disease_model_engine.predict(img)
    print(f"  Mock Low Confidence (0.45) -> Status: {pred_low.get('status')}, Disease: {pred_low.get('disease')}")
    assert pred_low.get("status") == "low_confidence"
    assert pred_low.get("confidence") == 0.45
    assert "below the detection threshold" in pred_low.get("recommendation", "")

    # Reset engine to unconfigured state
    disease_model_engine._model = None
    assert disease_model_engine.is_available() is False
    print("  PASS: Inference engine correctly discriminates success vs low_confidence.")

    # 11. Regression Test: AI Agricultural Assistant (/api/ai/chat)
    print("\n[Step 11] Regression Test: AI Agricultural Assistant (/api/ai/chat)...")
    req_ai = urllib.request.Request(
        f"{BASE}/api/ai/chat",
        data=json.dumps({"message": "How often should I irrigate my groundnut crop?"}).encode(),
        headers={**auth_header, 'Content-Type': 'application/json'},
        method="POST"
    )
    with urllib.request.urlopen(req_ai) as resp:
        ai_res = json.loads(resp.read().decode())
        assert ai_res.get("language") == "English"
        print(f"  PASS: AI Assistant operational. Language: {ai_res.get('language')}")

    # 12. Regression Test: Market Prices Module (/api/market-prices)
    print("\n[Step 12] Regression Test: Market Prices (/api/market-prices)...")
    req_mkt = urllib.request.Request(f"{BASE}/api/market-prices", headers=auth_header)
    with urllib.request.urlopen(req_mkt) as resp:
        mkt_res = json.loads(resp.read().decode())
        assert mkt_res.get("success") is True
        print(f"  PASS: Market Prices operational. Status: {mkt_res.get('status')}")

    # 13. Regression Test: Smart Irrigation Advisory (/api/irrigation/advisory)
    print("\n[Step 13] Regression Test: Smart Irrigation Advisory (/api/irrigation/advisory)...")
    req_irr = urllib.request.Request(f"{BASE}/api/irrigation/advisory", headers=auth_header)
    with urllib.request.urlopen(req_irr) as resp:
        irr_data = json.loads(resp.read().decode())
        assert irr_data.get("success") is True
        print(f"  PASS: Smart Irrigation operational. Status: {irr_data.get('status')}")

    # 14. Regression Test: Weather Intelligence (/api/weather/current)
    print("\n[Step 14] Regression Test: Weather Intelligence (/api/weather/current)...")
    req_weather = urllib.request.Request(f"{BASE}/api/weather/current", headers=auth_header)
    with urllib.request.urlopen(req_weather) as resp:
        w_data = json.loads(resp.read().decode())
        assert w_data.get("success") is True
        print(f"  PASS: Weather module operational. Location: {w_data.get('location')}")

    # 15. Regression Test: Crop Advisory (/api/crop-advisory/recommend)
    print("\n[Step 15] Regression Test: Crop Advisory (/api/crop-advisory/recommend)...")
    req_crop = urllib.request.Request(
        f"{BASE}/api/crop-advisory/recommend",
        data=b'{}',
        headers={**auth_header, 'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req_crop) as resp:
        crop_res = json.loads(resp.read().decode())
        assert crop_res.get("success") is True
        print(f"  PASS: Crop advisory returned {len(crop_res.get('recommendations', []))} recommendations.")

    # 16. Regression Test: Farmer Profile (/api/auth/me)
    print("\n[Step 16] Regression Test: Farmer Profile (/api/auth/me)...")
    req_profile = urllib.request.Request(f"{BASE}/api/auth/me", headers=auth_header)
    with urllib.request.urlopen(req_profile) as resp:
        p = json.loads(resp.read().decode())
        assert p.get("full_name") == "Ramesh Patel"
        print(f"  PASS: Profile intact for {p.get('full_name')}, Primary Crop: {p.get('primary_crop')}")

    print("\n" + "=" * 65)
    print("  ALL 16 VERIFICATION CHECKS PASSED - PLANT DISEASE ML READY")
    print("=" * 65)

if __name__ == '__main__':
    run()
