from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False) # In production, use hashing!
    role = db.Column(db.String(20), nullable=False) # 'admin', 'engineer'
    name = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'name': self.name
        }

class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address
        }

class ServiceLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    engineer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    lat = db.Column(db.Float, nullable=False)
    long = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships for easier joining (optional but helpful)
    engineer = db.relationship('User', backref='logs')
    client = db.relationship('Client', backref='logs')

    def to_dict(self):
        return {
            'id': self.id,
            'engineer_id': self.engineer_id,
            'engineer_name': self.engineer.email, # Using email as name for simplicity or we can add name field
            'client_id': self.client_id,
            'client_name': self.client.name,
            'description': self.description,
            'lat': self.lat,
            'long': self.long,
            'timestamp': self.timestamp.isoformat()
        }

class Interaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    engineer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    interaction_type = db.Column(db.String(20), nullable=False)  # 'call', 'email', 'message'
    direction = db.Column(db.String(20), nullable=False)  # 'incoming', 'outgoing'
    summary = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'done'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    engineer = db.relationship('User', backref='interactions')
    client = db.relationship('Client', backref='interactions')

    def to_dict(self):
        return {
            'id': self.id,
            'engineer_id': self.engineer_id,
            'engineer_name': self.engineer.name if self.engineer.name else self.engineer.email,
            'client_id': self.client_id,
            'client_name': self.client.name if self.client else 'Unknown',
            'interaction_type': self.interaction_type,
            'direction': self.direction,
            'summary': self.summary,
            'status': self.status,
            'timestamp': self.timestamp.isoformat() if self.timestamp else datetime.utcnow().isoformat()
        }
