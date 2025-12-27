from app import app
from models import db, User, Client

def seed():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()

        # Admin
        admin = User(email='admin@test.com', password='password', role='admin')
        
        # Engineer
        engineer = User(email='engineer@test.com', password='password', role='engineer')

        db.session.add(admin)
        db.session.add(engineer)

        # Clients
        clients = [
            Client(name='ABC Corp', address='123 Main St, New York, NY'),
            Client(name='XYZ Ltd', address='456 Elm St, San Francisco, CA'),
            Client(name='Global Tech', address='789 Oak St, Chicago, IL')
        ]

        for client in clients:
            db.session.add(client)

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed()
