from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from ..models import db, Users, Character, GameState, TokenBlocklist
import re

bcrypt = Bcrypt()
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 6:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, "Password is valid"

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or not all(key in data for key in ['email', 'username', 'password']):
            return jsonify({'error': 'Missing required fields: email, username, password'}), 400
        
        # Validate the input data and ensure all required fields are present
        # Strip whitespace and convert to lowercase for email and username 
        email = data['email'].strip().lower()
        username = data['username'].strip()
        password = data['password'].strip()

        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400

        # Validate the username and password length and return an error if not met 
        if len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters long'}), 400
        
        # Validate password strength
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400

        existing_user = Users.query.filter((Users.email == email) | (Users.username == username)).first()
        if existing_user:
            return jsonify({'error': 'User already exists'}), 400
        
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = Users(email=email, username=username, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.flush()  # Get the user ID without committing yet

        default_character = Character(
            user_id=new_user.id,
            name=username,
            fear=0,
            sanity=100)
        db.session.add(default_character)
        db.session.flush()

        initial_game_state = GameState( 
            character_id=default_character.id,
            current_stage='start',
            scene_id='start',
            choice_history=[],
            current_stats={'fear': 0, 'sanity': 100},
            inventory_snapshot=[]
        )
        db.session.add(initial_game_state)
        db.session.commit()
        access_token = create_access_token(identity=new_user.id)

        return jsonify({'message': 'User registered successfully', 'access_token': access_token, 'character': default_character.to_dict(), 'game_state': initial_game_state.to_dict()}), 201
    except Exception as e:
        return jsonify({'error':'Registration failed', 'details': str(e)}), 500

# Login route
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not all(key in data for key in ['username', 'password']):
            return jsonify({'error': 'Missing required fields: username, password'}), 400
        
        username = data['username'].strip()
        password = data['password']
        user = Users.query.filter((Users.username == username) | (Users.email == username)).first()
        
        if not user or not bcrypt.check_password_hash(user.password_hash, password):
            return jsonify({'error': 'invalid credentials'}), 401
        access_token = create_access_token(identity=user.id)
        
        return jsonify({'message': 'Login successful', 'access_token': access_token}), 200
    except Exception as e:
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        token = request.headers.get('Authorization').split(' ')[1]

        blacklist_token = TokenBlocklist(token=token)
        db.session.add(blacklist_token)
        db.session.commit()

        return jsonify({'message': 'Successfully logged out'}), 200
    except Exception as e:
        return jsonify({'error': 'Logout failed', 'details': str(e)}), 500

@auth_bp.route('/save', methods=['POST'])
@jwt_required()
def save_game():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        character = Character.query.filter_by(user_id=user_id).first()
        if not character:
            return jsonify({'error': 'Character not found'}), 404

        # If the current stage is an ending, delete the save if it exists
        current_stage = data.get('current_stage')
        if current_stage and str(current_stage).startswith('ending'):
            game_state = GameState.query.filter_by(character_id=character.id).first()
            if game_state:
                db.session.delete(game_state)
                db.session.commit()
            return jsonify({'message': 'Game ended, save deleted.'}), 200

        # Save or update the game state
        game_state = GameState.query.filter_by(character_id=character.id).first()
        if not game_state:
            game_state = GameState(character_id=character.id)
            db.session.add(game_state)
            
        game_state.current_stage = current_stage
        game_state.choice_history = data.get('choice_history')
        game_state.current_stats = data.get('current_stats')
        game_state.inventory_snapshot = data.get('inventory_snapshot')
        db.session.commit()
        return jsonify({'message': 'Game saved successfully.'}), 200
    except Exception as e:
        return jsonify({'error': 'Save failed', 'details': str(e)}), 500


@auth_bp.route('/load', methods=['GET'])
@jwt_required()
def load_game():
    try:
        user_id = get_jwt_identity()
        character = Character.query.filter_by(user_id=user_id).first()
        if not character:
            return jsonify({'error': 'Character not found'}), 404

        game_state = GameState.query.filter_by(character_id=character.id).order_by(GameState.last_updated.desc()).first()
        if not game_state:
          return jsonify({'error': 'No saved game found.'}), 404

        return jsonify({'current_stage': game_state.current_stage,
        'choice_history': game_state.choice_history,
            'current_stats': game_state.current_stats,
            'inventory_snapshot': game_state.inventory_snapshot
        }), 200
    except Exception as e:
        return jsonify({'error': 'Load failed', 'details': str(e)}), 500