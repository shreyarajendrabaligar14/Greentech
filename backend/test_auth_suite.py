import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8081"

def http_post(endpoint, data=None, form_data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    if form_data is not None:
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        body = urllib.parse.urlencode(form_data).encode("utf-8")
    else:
        headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode("utf-8") if data is not None else b""

    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            return res.status, json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, err_body
    except Exception as e:
        return 0, str(e)

def http_get(endpoint, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            return res.status, json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, err_body
    except Exception as e:
        return 0, str(e)

def run_tests():
    passed = 0
    total = 0

    def assert_test(cond, title, details=""):
        nonlocal passed, total
        total += 1
        if cond:
            print(f"[PASS] {title}")
            passed += 1
        else:
            print(f"[FAIL] {title}: {details}")

    print("\n--- 1. Health Check ---")
    status, body = http_get("/api/health")
    assert_test(status == 200 and body.get("status") == "healthy", "Health endpoint returns 200 and healthy", f"status={status}, body={body}")

    print("\n--- 2. Standard Demo User Login (JSON) ---")
    status, body = http_post("/api/auth/login", data={"email": "user@carbontrack.ai", "password": "User@2026"})
    user_token = body.get("access_token") if isinstance(body, dict) else None
    assert_test(status == 200 and user_token, "Demo user logs in successfully via JSON", f"status={status}, body={body}")
    assert_test(isinstance(body, dict) and body.get("user", {}).get("role") == "user", "Demo user has role 'user'", f"body={body}")

    print("\n--- 3. Standard Admin User Login (JSON) ---")
    status, body = http_post("/api/auth/login", data={"email": "admin@carbontrack.ai", "password": "Admin@2026"})
    admin_token = body.get("access_token") if isinstance(body, dict) else None
    assert_test(status == 200 and admin_token, "Admin logs in successfully via JSON", f"status={status}, body={body}")
    assert_test(isinstance(body, dict) and body.get("user", {}).get("role") == "admin", "Admin user has role 'admin'", f"body={body}")

    print("\n--- 4. Form-Encoded Login (OAuth2 standard) ---")
    status, body = http_post("/api/auth/login", form_data={"username": "user@carbontrack.ai", "password": "User@2026"})
    assert_test(status == 200 and isinstance(body, dict) and body.get("access_token"), "Login works with form-encoded username/password", f"status={status}, body={body}")

    print("\n--- 5. Invalid Credentials Login ---")
    status, body = http_post("/api/auth/login", data={"email": "user@carbontrack.ai", "password": "WrongPassword!"})
    assert_test(status == 401, "Invalid password rejected with 401", f"status={status}, body={body}")

    status, body = http_post("/api/auth/login", data={"email": "nobody@example.com", "password": "Password123!"})
    assert_test(status == 401, "Nonexistent email rejected with 401", f"status={status}, body={body}")

    print("\n--- 6. User Registration ---")
    new_email = f"testuser_{urllib.parse.quote('rnd')}@carbontrack.test"
    # Registration with short password
    status, body = http_post("/api/auth/register", data={"email": "short@test.com", "full_name": "Short", "password": "123"})
    assert_test(status == 400, "Password under 6 chars rejected with 400", f"status={status}, body={body}")

    # Registration with invalid email
    status, body = http_post("/api/auth/register", data={"email": "notanemail", "full_name": "Invalid", "password": "ValidPassword123!"})
    assert_test(status == 400, "Invalid email format rejected with 400", f"status={status}, body={body}")

    # Valid Registration
    import time
    test_email = f"tester_{int(time.time())}@carbontrack.ai"
    status, body = http_post("/api/auth/register", data={"email": test_email, "full_name": "Test Runner", "password": "SecurePassword123!"})
    reg_token = body.get("access_token") if isinstance(body, dict) else None
    assert_test(status == 200 and reg_token, "Valid registration creates user and returns JWT", f"status={status}, body={body}")
    assert_test(isinstance(body, dict) and body.get("user", {}).get("role") == "user", "Registered user role is strictly 'user'", f"body={body}")

    # Duplicate registration
    status, body = http_post("/api/auth/register", data={"email": test_email, "full_name": "Duplicate Runner", "password": "SecurePassword123!"})
    assert_test(status == 409, "Duplicate email registration rejected with 409", f"status={status}, body={body}")

    print("\n--- 7. Protected Profile Endpoint (/api/auth/me) ---")
    status, body = http_get("/api/auth/me", token=user_token)
    assert_test(status == 200 and body.get("email") == "user@carbontrack.ai", "User can retrieve profile with Bearer token", f"status={status}, body={body}")

    status, body = http_get("/api/auth/me", token="invalid_jwt_token_string")
    assert_test(status == 401, "Invalid token rejected with 401", f"status={status}, body={body}")

    status, body = http_get("/api/auth/me")
    assert_test(status == 401, "Unauthenticated request rejected with 401", f"status={status}, body={body}")

    print("\n--- 8. Role-Based Access Control (Admin vs User) ---")
    # Admin accesses admin stats
    status, body = http_get("/api/auth/admin/stats", token=admin_token)
    assert_test(status == 200 and "total_users" in body, "Admin can access /api/auth/admin/stats", f"status={status}, body={body}")

    # Admin accesses user list
    status, body = http_get("/api/auth/admin/users", token=admin_token)
    assert_test(status == 200 and isinstance(body, list), "Admin can access /api/auth/admin/users", f"status={status}, body={body}")

    # Normal user attempts admin stats
    status, body = http_get("/api/auth/admin/stats", token=user_token)
    assert_test(status == 403, "Normal user forbidden (403) from /api/auth/admin/stats", f"status={status}, body={body}")

    # Normal user attempts user list
    status, body = http_get("/api/auth/admin/users", token=user_token)
    assert_test(status == 403, "Normal user forbidden (403) from /api/auth/admin/users", f"status={status}, body={body}")

    # Unauthenticated attempts admin stats
    status, body = http_get("/api/auth/admin/stats")
    assert_test(status == 401, "Unauthenticated request to admin stats rejected (401)", f"status={status}, body={body}")

    print(f"\n==========================================")
    print(f"Results: {passed} / {total} tests passed ({(passed/total)*100:.1f}%)")
    print(f"==========================================")
    if passed != total:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()

