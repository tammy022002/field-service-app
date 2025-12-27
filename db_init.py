from dotenv import load_dotenv
load_dotenv()

import pymysql
import os
from urllib.parse import urlparse


from app import app, db

with app.app_context():
    db.create_all()
    print("PostgreSQL database initialized successfully.")

# 🔑 Use Render Environment Variable
uri = os.getenv("SQLALCHEMY_DATABASE_URI")

if not uri:
    raise RuntimeError("SQLALCHEMY_DATABASE_URI environment variable not set")

# Parse MySQL URI
# Example:
# mysql+pymysql://user:password@host:port/dbname
result = urlparse(uri)

username = result.username
password = result.password or ""
hostname = result.hostname
port = result.port or 3306
dbname = result.path.lstrip("/")

def create_database():
    print(f"Connecting to {hostname}:{port} as {username}...")

    try:
        conn = pymysql.connect(
            host=hostname,
            user=username,
            password=password,
            port=port,
            ssl={"ssl_ca": "/etc/ssl/certs/ca-certificates.crt"}  # ✅ Required for Aiven
        )

        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{dbname}`")
        print(f"Database '{dbname}' check/creation successful.")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error creating database: {e}")

if __name__ == "__main__":
    create_database()
