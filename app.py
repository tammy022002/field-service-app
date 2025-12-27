from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
from models import db, User, Client, ServiceLog, Interaction
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

CORS(app)
db.init_app(app)
jwt = JWTManager(app)

# Ensure tables exist
with app.app_context():
    db.create_all()

@app.route("/", methods=["GET"])
def root():
    return {"status": "Backend running"}, 200


@app.route("/api", methods=["GET"])
@app.route("/api/", methods=["GET"])
def api_root():
    return {"status": "API running"}, 200


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role}
        )
        return jsonify(
            access_token=access_token,
            role=user.role,
            user_id=str(user.id)
        )

    return jsonify({"msg": "Bad username or password"}), 401


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'engineer') # Default to engineer

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 400

    new_user = User(
    email=email,
    password_hash=generate_password_hash(password),
    role=role
	)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created successfully"}), 201

@app.route('/clients', methods=['GET'])
def get_clients():
    clients = Client.query.all()
    return jsonify([client.to_dict() for client in clients])

@app.route('/log', methods=['POST'])
@jwt_required()
def create_log():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    if claims['role'] != 'engineer':
        return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.get_json()
    new_log = ServiceLog(
        engineer_id=int(current_user_id),
        client_id=data['client_id'],
        description=data['description'],
        lat=data['lat'],
        long=data['long']
    )
    db.session.add(new_log)
    db.session.commit()
    return jsonify({"msg": "Log created successfully"}), 201

@app.route('/logs', methods=['GET'])
def get_logs():
    # In a real app, maybe protect this or only allow admin
    logs = ServiceLog.query.order_by(ServiceLog.timestamp.desc()).all()
    return jsonify([log.to_dict() for log in logs])

@app.route('/interaction', methods=['POST'])
@jwt_required()
def create_interaction():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    if claims['role'] != 'engineer':
        return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.get_json()
    client_name = data.get('client_name', '').strip()
    
    if not client_name:
        return jsonify({"msg": "Client name is required"}), 400
    
    # Find or create client
    client = Client.query.filter_by(name=client_name).first()
    if not client:
        # Create new client with generic address
        client = Client(name=client_name, address='Not specified')
        db.session.add(client)
        db.session.commit()
    
    new_interaction = Interaction(
        engineer_id=int(current_user_id),
        client_id=client.id,
        interaction_type=data['interaction_type'],
        direction=data['direction'],
        summary=data['summary'],
        status=data.get('status', 'pending')
    )
    db.session.add(new_interaction)
    db.session.commit()
    return jsonify({"msg": "Interaction created successfully"}), 201

@app.route('/interaction/<int:interaction_id>/status', methods=['PUT'])
@jwt_required()
def update_interaction_status(interaction_id):
    """Update the status of an interaction (e.g., mark as done)"""
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    
    interaction = Interaction.query.get(interaction_id)
    if not interaction:
        return jsonify({"msg": "Interaction not found"}), 404
    
    # Only the engineer who created it or an admin can update
    if claims['role'] != 'admin' and interaction.engineer_id != int(current_user_id):
        return jsonify({"msg": "Unauthorized - You can only update your own interactions"}), 403
    
    data = request.get_json()
    new_status = data.get('status')
    
    if new_status not in ['pending', 'done']:
        return jsonify({"msg": "Invalid status. Must be 'pending' or 'done'"}), 400
    
    interaction.status = new_status
    db.session.commit()
    
    return jsonify({"msg": f"Interaction status updated to '{new_status}'"}), 200

@app.route('/interaction/<int:interaction_id>/reassign', methods=['PUT'])
@jwt_required()
def reassign_interaction(interaction_id):
    """Reassign an interaction to another engineer"""
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    
    interaction = Interaction.query.get(interaction_id)
    if not interaction:
        return jsonify({"msg": "Interaction not found"}), 404
    
    # Only the current owner or admin can reassign
    if claims['role'] != 'admin' and interaction.engineer_id != int(current_user_id):
        return jsonify({"msg": "Unauthorized - You can only reassign your own interactions"}), 403
    
    data = request.get_json()
    new_engineer_id = data.get('engineer_id')
    
    if not new_engineer_id:
        return jsonify({"msg": "New engineer ID is required"}), 400
    
    # Verify the new engineer exists and is an engineer
    new_engineer = User.query.get(new_engineer_id)
    if not new_engineer:
        return jsonify({"msg": "Engineer not found"}), 404
    
    if new_engineer.role != 'engineer':
        return jsonify({"msg": "Can only assign to engineers"}), 400
    
    old_engineer_name = User.query.get(interaction.engineer_id).name or "Unknown"
    interaction.engineer_id = new_engineer_id
    db.session.commit()
    
    new_engineer_name = new_engineer.name or new_engineer.email.split('@')[0]
    return jsonify({
        "msg": f"Task reassigned to {new_engineer_name}",
        "new_engineer_id": new_engineer_id,
        "new_engineer_name": new_engineer_name
    }), 200

@app.route('/interactions', methods=['GET'])
def get_interactions():
    interactions = Interaction.query.order_by(Interaction.timestamp.desc()).all()
    return jsonify([interaction.to_dict() for interaction in interactions])

@app.route('/interactions/<int:engineer_id>', methods=['GET'])
@jwt_required()
def get_engineer_interactions(engineer_id):
    current_user_id = get_jwt_identity()
    # Engineers can only see their own interactions, admins can see all
    claims = get_jwt()
    if claims['role'] != 'admin' and int(current_user_id) != engineer_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    interactions = Interaction.query.filter_by(engineer_id=engineer_id).order_by(Interaction.timestamp.desc()).all()
    return jsonify([interaction.to_dict() for interaction in interactions])

@app.route('/my-interactions', methods=['GET'])
@jwt_required()
def get_my_interactions():
    """Get current engineer's own interactions"""
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    if claims['role'] != 'engineer':
        return jsonify({"msg": "Unauthorized"}), 403
    
    interactions = Interaction.query.filter_by(engineer_id=int(current_user_id)).order_by(Interaction.timestamp.desc()).all()
    return jsonify([interaction.to_dict() for interaction in interactions])

@app.route('/team-interactions', methods=['GET'])
@jwt_required()
def get_team_interactions():
    """Get all team interactions - accessible by engineers to view team's work"""
    claims = get_jwt()
    if claims['role'] != 'engineer':
        return jsonify({"msg": "Unauthorized"}), 403
    
    client_id = request.args.get('client_id')
    engineer_id = request.args.get('engineer_id')
    query = Interaction.query
    
    if client_id:
        query = query.filter_by(client_id=int(client_id))
    if engineer_id:
        query = query.filter_by(engineer_id=int(engineer_id))
    
    interactions = query.order_by(Interaction.timestamp.desc()).all()
    return jsonify([interaction.to_dict() for interaction in interactions])

@app.route('/team-engineers', methods=['GET'])
@jwt_required()
def get_team_engineers():
    """Get list of engineers - accessible by engineers for filtering"""
    claims = get_jwt()
    if claims['role'] != 'engineer':
        return jsonify({"msg": "Unauthorized"}), 403
    
    engineers = User.query.filter_by(role='engineer').all()
    result = []
    for engineer in engineers:
        result.append({
            'id': engineer.id,
            'email': engineer.email,
            'name': engineer.name or engineer.email.split('@')[0]
        })
    return jsonify(result)

@app.route('/engineers', methods=['GET'])
@jwt_required()
def get_engineers():
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({"msg": "Unauthorized"}), 403
    
    # Get all engineers with their interaction counts
    engineers = User.query.filter_by(role='engineer').all()
    result = []
    for engineer in engineers:
        interaction_count = Interaction.query.filter_by(engineer_id=engineer.id).count()
        result.append({
            'id': engineer.id,
            'email': engineer.email,
            'interaction_count': interaction_count
        })
    return jsonify(result)

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify(user.to_dict())

@app.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    data = request.get_json()
    if 'name' in data:
        user.name = data['name']
        db.session.commit()
        return jsonify({"msg": "Profile updated successfully"}), 200
    
    return jsonify({"msg": "No data to update"}), 400


@app.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({"msg": "Old and new passwords required"}), 400

    if not check_password_hash(user.password_hash, old_password):
        return jsonify({"msg": "Incorrect old password"}), 401

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"msg": "Password changed successfully"}), 200


@app.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Permanently delete the current user's account and all associated data"""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    try:
        # Delete all interactions by this user
        Interaction.query.filter_by(engineer_id=int(current_user_id)).delete()
        
        # Delete all service logs by this user
        ServiceLog.query.filter_by(engineer_id=int(current_user_id)).delete()
        
        # Delete the user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({"msg": "Account deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Failed to delete account: {str(e)}"}), 500

@app.route('/admin/delete-user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(user_id):
    """Admin endpoint to delete any user's account and all associated data"""
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({"msg": "Unauthorized - Admin access required"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    # Prevent admin from deleting themselves
    current_user_id = get_jwt_identity()
    if int(current_user_id) == user_id:
        return jsonify({"msg": "Cannot delete your own admin account"}), 400
    
    try:
        # Delete all interactions by this user
        Interaction.query.filter_by(engineer_id=user_id).delete()
        
        # Delete all service logs by this user
        ServiceLog.query.filter_by(engineer_id=user_id).delete()
        
        # Delete the user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({"msg": f"User '{user.email}' deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Failed to delete user: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
