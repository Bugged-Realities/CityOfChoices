from flask import Blueprint, request, jsonify
from backend.app import db
from backend.app.models.user import User
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

bcrypt = Bcrypt()
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    if not email or not username or not password:
        return jsonify({'msg': 'Missing required fields'}), 400
    if User.query.filter((User.email == email) | (User.username == username)).first():
        return jsonify({'msg': 'User already exists'}), 409
    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(email=email, username=username, password_hash=pw_hash)
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': 'User created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'msg': 'Missing email or password'}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'msg': 'Invalid credentials'}), 401
    access_token = create_access_token(identity=user.id)
    return jsonify({'access_token': access_token, 'user_id': user.id, 'username': user.username}), 200
