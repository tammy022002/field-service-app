import pymysql
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

uri = os.getenv('DATABASE_URI')
# Example: mysql+pymysql://root:password@localhost/field_service_db
# Parse it
result = urlparse(uri)
username = result.username
password = result.password or ""
hostname = result.hostname
dbname = result.path[1:]

def create_database():
    print(f"Connecting to {hostname} as {username} with password '{password}'...")
    try:
        conn = pymysql.connect(host=hostname, user=username, password=password)
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {dbname}")
        print(f"Database {dbname} check/creation successful.")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_database()
