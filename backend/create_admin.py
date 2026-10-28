"""
CLI script to securely create an Administrator account for CarbonTrack AI.
Usage:
    python create_admin.py --email admin@example.com --name "Lead Auditor" --password "StrongPassword123!"
Or interactively:
    python create_admin.py
"""
import sys
import getpass
import argparse
from database import get_db, init_db
from auth import hash_password

def create_admin(email: str, name: str, password: str):
    email = email.strip().lower()
    if not email or "@" not in email:
        print("Error: A valid email address is required.")
        sys.exit(1)
    if len(password) < 6:
        print("Error: Password must be at least 6 characters long.")
        sys.exit(1)

    init_db()
    hashed = hash_password(password)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, role FROM users WHERE email = ?", (email,))
        existing = cursor.fetchone()
        if existing:
            cursor.execute("UPDATE users SET full_name = ?, hashed_password = ?, role = 'admin', is_active = 1 WHERE email = ?", (name, hashed, email))
            print(f"Success: Existing account for '{email}' was promoted to Administrator with new password.")
        else:
            cursor.execute("INSERT INTO users (email, full_name, hashed_password, role, is_active) VALUES (?, ?, ?, 'admin', 1)", (email, name, hashed))
            print(f"Success: Created new Administrator account for '{email}'.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a CarbonTrack AI administrator.")
    parser.add_argument("--email", help="Administrator email address")
    parser.add_argument("--name", help="Full name", default="Administrator")
    parser.add_argument("--password", help="Password")
    args = parser.parse_args()

    email = args.email
    name = args.name
    password = args.password

    if not email:
        email = input("Enter admin email address: ").strip()
    if not name or name == "Administrator":
        input_name = input("Enter admin full name [Administrator]: ").strip()
        if input_name:
            name = input_name
    if not password:
        password = getpass.getpass("Enter secure password (min 6 chars): ")

    create_admin(email, name, password)
