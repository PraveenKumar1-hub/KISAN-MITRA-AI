import urllib.request
import json
import urllib.error
import sqlite3

BASE_URL = 'http://127.0.0.1:8000'

def make_req(url, data=None, headers=None, method='GET'):
    h = headers or {}
    body = None
    if data is not None:
        body = json.dumps(data).encode('utf-8')
        h['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf-8')
        try:
            return e.code, json.loads(raw)
        except Exception:
            print(f"HTTPError {e.code} raw response: {raw}")
            return e.code, raw


user_payload = {
    'full_name': 'Ramesh Patel',
    'email': 'ramesh.patel@example.com',
    'password': 'StrongPassword123',
    'confirm_password': 'StrongPassword123',
    'location': 'Anand, Gujarat',
    'farm_size': '4.5',
    'soil_type': 'Alluvial',
    'irrigation_type': 'Drip',
    'primary_crop': 'Groundnut'
}

print('1. Registering user...')
status, resp = make_req(f'{BASE_URL}/api/auth/register', data=user_payload, method='POST')
print(f'Status: {status}, Resp: {resp}')
assert status == 200, f'Registration failed: {resp}'

print('\n2. Verifying user in SQLite database...')
conn = sqlite3.connect('kisan_mitra.db')
c = conn.cursor()
row = c.execute('SELECT id, full_name, email, password_hash, location, farm_size, soil_type, irrigation_type, primary_crop FROM users WHERE email = ?', ('ramesh.patel@example.com',)).fetchone()
print(f'SQLite Row: {row}')
assert row is not None, 'User not in database!'
assert row[1] == 'Ramesh Patel'
assert row[3].startswith('$2b$') or row[3].startswith('$2a$'), 'Password is not properly bcrypt hashed!'
conn.close()

print('\n3. Testing Duplicate Registration...')
status, resp = make_req(f'{BASE_URL}/api/auth/register', data=user_payload, method='POST')
print(f'Status: {status}, Resp: {resp}')
assert status == 400, 'Duplicate registration was not rejected!'

print('\n4. Testing Wrong Password...')
status, resp = make_req(f'{BASE_URL}/api/auth/login', data={'email': 'ramesh.patel@example.com', 'password': 'WrongPassword999'}, method='POST')
print(f'Status: {status}, Resp: {resp}')
assert status == 401, 'Wrong password was not rejected!'

print('\n5. Testing Correct Login...')
status, resp = make_req(f'{BASE_URL}/api/auth/login', data={'email': 'ramesh.patel@example.com', 'password': 'StrongPassword123'}, method='POST')
token_present = 'access_token' in resp
print(f'Status: {status}, Token present: {token_present}')
assert status == 200 and token_present, 'Login failed!'
token = resp['access_token']

print('\n6. Testing /api/auth/me with Bearer Token...')
status, resp = make_req(f'{BASE_URL}/api/auth/me', headers={'Authorization': f'Bearer {token}'})
print(f'Status: {status}, User: {resp.get("full_name")}')
assert status == 200 and resp.get('full_name') == 'Ramesh Patel', 'Get me failed!'

print('\n7. Testing /api/auth/me with Invalid Token...')
status, resp = make_req(f'{BASE_URL}/api/auth/me', headers={'Authorization': 'Bearer invalid_token_123'})
print(f'Status: {status}, Detail: {resp.get("detail")}')
assert status == 401, 'Invalid token was not rejected!'

print('\n=== ALL FASTAPI & SQLITE AUTH TESTS PASSED PERFECTLY ===')
