from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, GameState, Character, Scene, Inventory
from ..utils.error_handling import (
    ValidationError,
    NotFoundError,
    DatabaseError,
    safe_database_operation,
    validate_required_fields,
    validate_field_type,
    log_api_request,
    log_api_response
)
import json
import random

def validate_required_items(option, character_id):
    """
    Validate if the player has the required items for a choice.
    Returns (is_valid, missing_items) tuple.
    """
    if not option:
        return True, []
    
    missing_items = []
    
    # Check for single required item
    if 'required_item' in option and option['required_item']:
        required_item = option['required_item']
        inventory_item = Inventory.query.filter_by(
            character_id=character_id,
            item_name=required_item,
            used=False
        ).first()
        if not inventory_item:
            missing_items.append(required_item)
    
    # Check for multiple required items
    if 'required_items' in option and option['required_items']:
        required_items = option['required_items']
        for item_name in required_items:
            inventory_item = Inventory.query.filter_by(
                character_id=character_id,
                item_name=item_name,
                used=False
            ).first()
            if not inventory_item:
                missing_items.append(item_name)
    
    return len(missing_items) == 0, missing_items

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
    user_id = get_jwt_identity()
    log_api_request('POST', '/choice', user_id)
    
    try:
        # Validate request data
        data = request.get_json()
        if not data:
            raise ValidationError('No JSON data provided')
        
        validate_required_fields(data, ['current', 'choice_index'], 'make_choice')
        validate_field_type(data['choice_index'], int, 'choice_index')
        
        current_stage = data['current']
        choice_index = data['choice_index']
        
        # Find current scene
        current_node = safe_database_operation(
            lambda: Scene.query.filter_by(stage=current_stage).first(),
            f"Failed to find scene for stage: {current_stage}"
        )
        
        if not current_node:
            raise NotFoundError(f'Scene not found for stage: {current_stage}')
        
        # Validate choice index
        options = current_node.options or []
        if choice_index >= len(options):
            raise ValidationError(
                f'Choice index {choice_index} out of range. Available options: {len(options)}',
                {'choice_index': choice_index, 'available_options': len(options)}
            )
        if choice_index < 0:
            raise ValidationError(f'Choice index {choice_index} is negative')
        
        selected_option = options[choice_index]
        
        # Find character
        character = safe_database_operation(
            lambda: Character.query.filter_by(user_id=user_id).first(),
            "Failed to find character"
        )
        
        if not character:
            raise NotFoundError('Character not found')
        
        # Validate required items
        is_valid, missing_items = validate_required_items(selected_option, character.id)
        if not is_valid:
            missing_items_str = ', '.join(missing_items)
            raise ValidationError(
                f'Missing required items: {missing_items_str}',
                {'missing_items': missing_items}
            )
        
        if 'next' not in selected_option:
            raise ValidationError(f'Selected option has no next stage')
        
        next_stage = selected_option['next']
        
        # Find next scene
        next_node = safe_database_operation(
            lambda: Scene.query.filter_by(stage=next_stage).first(),
            f"Failed to find next scene for stage: {next_stage}"
        )
        
        if not next_node:
            raise NotFoundError(f'Next scene not found: {next_stage}')
        
        # Update game state
        def update_game_state():
            game_state = GameState.query.filter_by(character_id=character.id).first()
            if game_state:
                game_state.scene_id = next_stage
                game_state.current_stage = next_stage
                db.session.commit()
        
        safe_database_operation(update_game_state, "Failed to update game state")
        
        log_api_response(200, '/choice', user_id)
        return jsonify(next_node.to_dict())
        
    except (ValidationError, NotFoundError, DatabaseError) as e:
        log_api_response(e.status_code, '/choice', user_id, error=str(e))
        raise
    except Exception as e:
        log_api_response(500, '/choice', user_id, error=str(e))
        raise DatabaseError(f"Unexpected error in make_choice: {str(e)}")


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