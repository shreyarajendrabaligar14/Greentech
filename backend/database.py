import sqlite3
import json
import os
import bcrypt
from contextlib import contextmanager

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "carbontrack.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def hash_pw_helper(password: str) -> str:
    """Internal helper to hash password with bcrypt for initial database seeding."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                hashed_password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 2. Activities table (with user_id support)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT NOT NULL,
                date TEXT NOT NULL,
                total_emissions REAL NOT NULL,
                electricity_emissions REAL NOT NULL DEFAULT 0.0,
                transportation_emissions REAL NOT NULL DEFAULT 0.0,
                fuel_emissions REAL NOT NULL DEFAULT 0.0,
                waste_emissions REAL NOT NULL DEFAULT 0.0,
                details_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)

        # Migrate activities table to add user_id column if it exists without it
        try:
            cursor.execute("SELECT user_id FROM activities LIMIT 1")
        except sqlite3.OperationalError:
            cursor.execute("ALTER TABLE activities ADD COLUMN user_id INTEGER REFERENCES users(id)")

        # 3. Reduction Targets table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS targets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                reduction_percentage REAL NOT NULL DEFAULT 20.0,
                target_year TEXT NOT NULL DEFAULT '2026',
                baseline_emissions REAL NOT NULL DEFAULT 0.0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)

        try:
            cursor.execute("SELECT user_id FROM targets LIMIT 1")
        except sqlite3.OperationalError:
            cursor.execute("ALTER TABLE targets ADD COLUMN user_id INTEGER REFERENCES users(id)")

        # Initialize default target if not present
        cursor.execute("SELECT COUNT(*) as cnt FROM targets")
        if cursor.fetchone()["cnt"] == 0:
            cursor.execute("""
                INSERT INTO targets (reduction_percentage, target_year, baseline_emissions, user_id)
                VALUES (20.0, '2026', 0.0, NULL)
            """)

        # 4. Challenges table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS challenges (
                id INTEGER PRIMARY KEY,
                user_id INTEGER,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                duration TEXT NOT NULL,
                impact TEXT NOT NULL,
                points INTEGER NOT NULL DEFAULT 50,
                completed INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)

        try:
            cursor.execute("SELECT user_id FROM challenges LIMIT 1")
        except sqlite3.OperationalError:
            cursor.execute("ALTER TABLE challenges ADD COLUMN user_id INTEGER REFERENCES users(id)")

        # Seed initial standard challenges if empty
        cursor.execute("SELECT COUNT(*) as cnt FROM challenges")
        if cursor.fetchone()["cnt"] == 0:
            initial_challenges = [
                (1, "Public Transit Week", "Use metro, city bus, or shared transit for all weekday commutes.", "Transportation", "5 Days", "~18.5 kg CO2e saved", 80, 0),
                (2, "Zero Vampire Power Audit", "Inspect workspace or home to unplug idle computer chargers and monitors.", "Electricity", "Single Audit", "~6.2 kg CO2e saved/mo", 40, 0),
                (3, "Organic Waste Segregation & Compost", "Divert food scraps from landfill into composting or biogas.", "Waste", "7 Days", "~4.5 kg CO2e prevented", 60, 0),
                (4, "Plant-Rich Green Monday", "Opt for plant-based meals to minimize intensive livestock footprints.", "Diet", "1 Day", "~3.8 kg CO2e saved", 50, 0),
                (5, "Thermostat 24°C Standard", "Maintain indoor cooling setpoint at or above 24°C.", "Electricity", "2 Weeks", "~14.0 kg CO2e saved", 75, 0),
                (6, "Zero Single-Use Plastic Week", "Carry a reusable bottle, cloth bag, and metal straw for 7 days.", "Waste", "7 Days", "~2.1 kg CO2e lifecycle saved", 45, 0),
            ]
            cursor.executemany("""
                INSERT INTO challenges (id, title, description, category, duration, impact, points, completed)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, initial_challenges)

        # 5. Chat Messages Table (for EcoBot assistant)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                role TEXT NOT NULL, -- 'user' or 'assistant'
                message TEXT NOT NULL,
                suggestions_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)

        # 6. Settings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """)

        # Initialize default settings
        cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('profile_type', 'individual')")
        cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('grid_factor', '0.82')")
        cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('org_name', 'Eco Pioneer')")

        # 7. Seed initial Administrator account if no admin exists
        cursor.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
        if not cursor.fetchone():
            admin_email = os.environ.get("ADMIN_EMAIL", "admin@carbontrack.ai").lower()
            admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@2026")
            admin_name = os.environ.get("ADMIN_NAME", "System Administrator")
            hashed_admin_pw = hash_pw_helper(admin_password)

            cursor.execute("""
                INSERT INTO users (email, full_name, hashed_password, role, is_active)
                VALUES (?, ?, ?, 'admin', 1)
            """, (admin_email, admin_name, hashed_admin_pw))

        # 8. Seed standard Demo User account if no user with that email exists
        demo_email = os.environ.get("DEMO_USER_EMAIL", "user@carbontrack.ai").lower()
        cursor.execute("SELECT id FROM users WHERE email = ? LIMIT 1", (demo_email,))
        if not cursor.fetchone():
            demo_password = os.environ.get("DEMO_USER_PASSWORD", "User@2026")
            demo_name = os.environ.get("DEMO_USER_NAME", "Eco Champion User")
            hashed_demo_pw = hash_pw_helper(demo_password)

            cursor.execute("""
                INSERT INTO users (email, full_name, hashed_password, role, is_active)
                VALUES (?, ?, ?, 'user', 1)
            """, (demo_email, demo_name, hashed_demo_pw))

def reset_database():
    """Purges user activities, targets, and chat history while preserving user accounts."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM activities")
        cursor.execute("DELETE FROM chat_messages")
        cursor.execute("UPDATE challenges SET completed = 0")
        cursor.execute("UPDATE targets SET baseline_emissions = 0.0, reduction_percentage = 20.0, target_year = '2026'")
