from app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        db.session.execute(text("ALTER TABLE interaction ADD COLUMN status VARCHAR(20) DEFAULT 'pending'"))
        db.session.commit()
        print("Status column added successfully!")
    except Exception as e:
        print(f"Error: {e}")
        if "Duplicate column name" in str(e):
            print("Column already exists!")
