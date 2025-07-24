from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.game_state import GameState
from app.models.character import Character
from app import db

game_bp = Blueprint('game', __name__)

@game_bp.route('/save', methods=['POST'])
@jwt_required()
def save_game():
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

@game_bp.route('/load', methods=['GET'])
@jwt_required()
def load_game():
    user_id = get_jwt_identity()
    character = Character.query.filter_by(user_id=user_id).first()
    if not character:
        return jsonify({'error': 'Character not found'}), 404

    game_state = GameState.query.filter_by(character_id=character.id).first()
    if not game_state:
        return jsonify({'error': 'No saved game found.'}), 404

    return jsonify({
        'current_stage': game_state.current_stage,
        'choice_history': game_state.choice_history,
        'current_stats': game_state.current_stats,
        'inventory_snapshot': game_state.inventory_snapshot
    }), 200