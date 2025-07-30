from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, GameState, Character, Scene, Inventory
import json
import random

game_bp = Blueprint('game', __name__)

@game_bp.route('/start', methods=['POST'])
@jwt_required()
def get_start_game():
    try:
       user_id = get_jwt_identity()
       character = Character.query.filter_by(user_id=user_id).first()

       if not character:
        return jsonify({'error': 'Character not found'}), 404
       
       game_state = GameState.query.filter_by(character_id=character.id).first()
       if not game_state:
         return jsonify({'error': 'Game state not found'}), 404
       
       # If scene_id is "start", assign a random starting scene
       if game_state.scene_id == "start":
           start_scenes = ["start_subway", "start_city", "start_depths"]
           random_scene = random.choice(start_scenes)
           game_state.scene_id = random_scene
           game_state.current_stage = random_scene
           db.session.commit()
       
       current_scene = None
       if game_state.scene_id:
        current_scene = Scene.query.filter_by(stage=game_state.scene_id).first()
       inventory_items = Inventory.query.filter_by(character_id=character.id, used=False).all()
       response_data = {
            'character': character.to_dict(),
            'game_state': game_state.to_dict(),
            'current_scene': current_scene.to_dict() if current_scene else None,
            'inventory': [item.to_dict() for item in inventory_items]
        }
       return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'error': 'Failed to get start game', 'details': str(e)}), 500


# this is the choice that the user makes. It will return the next node in the story.
@game_bp.route('/choice', methods=['POST'])
@jwt_required()
def make_choice():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    # this is the current stage of the story.
    current_stage = data.get('current')
    # This is the choice that the user makes.
    choice_index = data.get('choice_index')
    
    # print(f"DEBUG: Received choice request - current_stage: {current_stage}, choice_index: {choice_index}")
    
    if current_stage is None:
        return jsonify({'error': 'Missing current stage'}), 400
    if choice_index is None:
        return jsonify({'error': 'Missing choice index'}), 400
    current_node = Scene.query.filter_by(stage=current_stage).first()
    if not current_node:
        print(f"DEBUG: Current node not found for stage: {current_stage}")
        return jsonify({'error': f'Invalid current node: {current_stage}'}), 400

    try:
        options = current_node.options or []
        print(f"DEBUG: Found {len(options)} options for stage {current_stage}")
        
        if choice_index >= len(options):
            return jsonify({'error': f'Choice index {choice_index} out of range. Available options: {len(options)}'}), 400
        if choice_index < 0:
            return jsonify({'error': f'Choice index {choice_index} is negative'}), 400
        selected_option = options[choice_index]
        # print(f"DEBUG: Selected option: {selected_option}")
        
        if 'next' not in selected_option:
            return jsonify({'error': f'Selected option has no next stage: {selected_option}'}), 400
        
        next_stage = selected_option['next']
        # print(f"DEBUG: Next stage: {next_stage}")
        
        next_node = Scene.query.filter_by(stage=next_stage).first()
        if next_node:
            # Update the game state to reflect the new stage
            user_id = get_jwt_identity()
            character = Character.query.filter_by(user_id=user_id).first()
            if character:
                game_state = GameState.query.filter_by(character_id=character.id).first()
                if game_state:
                    game_state.scene_id = next_stage
                    game_state.current_stage = next_stage
                    db.session.commit()
            
            return jsonify(next_node.to_dict())
        else:
            print(f"DEBUG: Next node not found for stage: {next_stage}")
            return jsonify({'error': f'Next node not found: {next_stage}'}), 404
    except (IndexError, KeyError, TypeError) as e:
        print(f"DEBUG: Exception occurred: {e}")
        return jsonify({'error': f'Invalid choice: {str(e)}'}), 400


# this is the item that the user uses. It will return the next node in the story.
# I needed to add this because the item is used in the story, so there needs to be a way to trigger the 
# story progression.
@game_bp.route('/scene/<stage>', methods=['GET'])
@jwt_required()
def get_scene_by_stage(stage):
    """Get a specific scene by stage name"""
    try:
        scene = Scene.query.filter_by(stage=stage).first()
        if not scene:
            return jsonify({'error': f'Scene not found for stage: {stage}'}), 404
        return jsonify(scene.to_dict()), 200
    except Exception as e:
        return jsonify({'error': 'Failed to get scene', 'details': str(e)}), 500


@game_bp.route('/use-item', methods=['POST'])
@jwt_required()
def use_item_for_story():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    current_stage = data.get('current')
    item_name = data.get('item_name')
    
    # print(f"DEBUG: Received item usage request - current_stage: {current_stage}, item_name: {item_name}")

    if not current_stage:
        return jsonify({'error': 'Missing current stage'}), 400
    if not item_name:
        return jsonify({'error': 'Missing item name'}), 400
    current_node = Scene.query.filter_by(stage=current_stage).first()
    if not current_node:
        return jsonify({'error': f'Invalid current node: {current_stage}'}), 400

    # this is the list of item triggers, if the node has item triggers.
    item_triggers = current_node.item_triggers or []
    for trigger in item_triggers:
        if trigger['item'] == item_name:
            # Trigger the next node.
            next_stage = trigger['next']
            next_node = Scene.query.filter_by(stage=next_stage).first()
            if next_node:
                # Update the game state to reflect the new stage
                user_id = get_jwt_identity()
                character = Character.query.filter_by(user_id=user_id).first()
                if character:
                    game_state = GameState.query.filter_by(character_id=character.id).first()
                    if game_state:
                        game_state.scene_id = next_stage
                        game_state.current_stage = next_stage
                        db.session.commit()
                
                return jsonify({
                    'node': next_node.to_dict(),
                    'message': f'Using {item_name} triggered story progression!'
                })
            else:
                return jsonify({'error': f'Next node not found: {next_stage}'}), 404

    return jsonify({
        'message': f'{item_name} was used but no story progression was triggered',
        'current_node': current_node.to_dict()
    }), 200