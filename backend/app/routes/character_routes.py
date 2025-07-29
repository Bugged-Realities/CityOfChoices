from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Users, Character, GameState
# from datetime import datetime

character_bp = Blueprint('character', __name__)

@character_bp.route('/create', methods=['POST'])
@jwt_required()
def create_character():
    try:
        user_id = get_jwt_identity()
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        existing_character = Character.query.filter_by(user_id=user_id).first()
        if existing_character:
            return jsonify({'error': 'Character already exists'}), 400
        
        data = request.get_json()

        if not data or 'name' not in data:
            return jsonify({'error': 'Name is required'}), 400
        
        name = data['name'].strip()
        if len(name) < 3:
            return jsonify({'error': 'Name must be at least 3 characters long'}), 400
        
        new_character = Character(name=name, user_id=user_id, fear=0, sanity=100)
        db.session.add(new_character)
        db.session.flush()

        initial_game_state = GameState(character_id=new_character.id, current_stage='start', scene_id=1, choice_history=[], current_stats={'fear': 0, 'sanity': 100}, inventory_snapshot=[])
        db.session.add(initial_game_state)
        db.session.commit()
        return jsonify({'message': 'Character created successfully', 'character': new_character.to_dict(), 'game_state': initial_game_state.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Character creation failed', 'details': str(e)}), 500

@character_bp.route('/get', methods=['GET'])
@jwt_required()
def get_character():
    try:
        user_id = get_jwt_identity()
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        character = Character.query.filter_by(user_id=user_id).first()
        if not character:
            return jsonify({'error': 'Character not found'}), 404
        
        game_state = GameState.query.filter_by(character_id=character.id).order_by(GameState.last_updated.desc()).first()
        
        return jsonify({'character': character.to_dict(), 'game_state': game_state.to_dict() if game_state else None}), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to get character', 'details': str(e)}), 500



@character_bp.route('/update-stats', methods=['POST'])
@jwt_required()
def update_character_stats():
    """Update character stats (health, fear, sanity)"""
    try:
        user_id = get_jwt_identity()
        character = Character.query.filter_by(user_id=user_id).first()
        if not character:
            return jsonify({'error': 'Character not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update stats if provided
        if 'fear' in data:
            character.fear = max(0, min(100, data['fear']))  # Clamp between 0-100
        if 'sanity' in data:
            character.sanity = max(0, min(100, data['sanity']))  # Clamp between 0-100
        
        db.session.commit()
        
        return jsonify({
            'message': 'Character stats updated successfully',
            'character': character.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update character stats', 'details': str(e)}), 500

@character_bp.route('/reset', methods=['POST'])
@jwt_required()
def reset_character():
    """Reset character stats to initial values"""
    try:
        user_id = get_jwt_identity()
        character = Character.query.filter_by(user_id=user_id).first()
        if not character:
            return jsonify({'error': 'Character not found'}), 404
        
        # Reset stats to initial values
        character.fear = 0
        character.sanity = 100
        
        # Reset game state to start
        game_state = GameState.query.filter_by(character_id=character.id).first()
        if game_state:
            game_state.current_stage = 'start'
            game_state.scene_id = 'start'
            game_state.choice_history = []
            game_state.current_stats = {'fear': 0, 'sanity': 100}
            game_state.inventory_snapshot = []
        
        db.session.commit()
        
        return jsonify({
            'message': 'Character reset successfully',
            'character': character.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reset character', 'details': str(e)}), 500
        


