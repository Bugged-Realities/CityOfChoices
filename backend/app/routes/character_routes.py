from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.character import Character
from app.models.inventory_item import InventoryItem
from app import db

#-------------------------------- Character Routes --------------------------------
character_bp = Blueprint('character', __name__)

@character_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_character():
    user_id = get_jwt_identity()
    character = Character.query.filter_by(user_id=user_id).first()
    if not character:
        return jsonify({'msg': 'Character not found'}), 404
    return jsonify(character.to_dict()), 200

@character_bp.route('/<int:character_id>', methods=['PATCH'])
@jwt_required()
def update_character(character_id):
    user_id = get_jwt_identity()
    character = Character.query.filter_by(id=character_id, user_id=user_id).first()
    if not character:
        return jsonify({'msg': 'Character not found'}), 404
    data = request.json
    if "fear" in data:
        character.fear = data["fear"]
    if "sanity" in data:
        character.sanity = data["sanity"]
    db.session.commit()
    return jsonify(character.to_dict()), 200

@character_bp.route('/<int:character_id>', methods=['DELETE'])
@jwt_required()
def delete_character(character_id):
    user_id = get_jwt_identity()
    character = Character.query.filter_by(id=character_id, user_id=user_id).first()
    if not character:
        return jsonify({'msg': 'Character not found'}), 404
    db.session.delete(character)
    db.session.commit()
    return jsonify({'msg': 'Character deleted'}), 200

#-------------------------------- Inventory Routes --------------------------------
inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/<int:character_id>', methods=['GET'])
@jwt_required()
def get_inventory(character_id):
    user_id = get_jwt_identity()
    character = Character.query.filter_by(id=character_id, user_id=user_id).first()
    if not character:
        return jsonify({'msg': 'Character not found'}), 404
    inventory_items = InventoryItem.query.filter_by(character_id=character_id).all()
    return jsonify([item.to_dict() for item in inventory_items]), 200

@inventory_bp.route('/<int:character_id>', methods=['POST'])
@jwt_required()
def add_inventory_item(character_id):
    user_id = get_jwt_identity()
    character = Character.query.filter_by(id=character_id, user_id=user_id).first()
    if not character:
        return jsonify({'msg': 'Character not found'}), 404
    data = request.json
    new_item = InventoryItem(
        character_id=character_id,
        item_name=data['item_name'],
        description=data['description']
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

@inventory_bp.route('/<int:character_id>/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_inventory_item(character_id, item_id):
    user_id = get_jwt_identity()
    character = Character.query.filter_by(id=character_id, user_id=user_id).first()
    if not character:
        return jsonify({'msg': 'Character not found'}), 404
    item = InventoryItem.query.filter_by(id=item_id, character_id=character_id).first()
    if not item:
        return jsonify({'msg': 'Item not found'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'msg': 'Item deleted'}), 200

@inventory_bp.route('/<int:character_id>/<int:item_id>', methods=['POST'])
@jwt_required()
def use_inventory_item(character_id, item_id):
    user_id = get_jwt_identity()
    character = Character.query.filter_by(id=character_id, user_id=user_id).first()
    if not character:
        return jsonify({'msg': 'Character not found'}), 404
    item = InventoryItem.query.filter_by(id=item_id, character_id=character_id).first()
    if not item:
        return jsonify({'msg': 'Item not found'}), 404
    
    # Mark the item as used
    item.used = True
    db.session.commit()
    
    # Check if using this item should trigger story progression
    # This will be handled by the frontend based on the current story state
    return jsonify({
        'item': item.to_dict(),
        'message': 'Item used successfully'
    }), 200

@inventory_bp.route('/<int:character_id>/reset', methods=['POST'])
@jwt_required()
def reset_inventory(character_id):
    user_id = get_jwt_identity()
    character = Character.query.filter_by(id=character_id, user_id=user_id).first()
    if not character:
        return jsonify({'msg': 'Character not found'}), 404
    InventoryItem.query.filter_by(character_id=character_id).delete()
    db.session.commit()
    return jsonify({'msg': 'Inventory reset'}), 200

@character_bp.route('/<int:character_id>/restart', methods=['POST'])
@jwt_required()
def restart_character(character_id):
    user_id = get_jwt_identity()
    character = Character.query.filter_by(id=character_id, user_id=user_id).first()
    if not character:
        return jsonify({'msg': 'Character not found'}), 404
    
    # Reset character stats to default
    character.fear = 0
    character.sanity = 100
    
    # Clear inventory
    InventoryItem.query.filter_by(character_id=character_id).delete()
    
    # Clear game states
    from app.models.game_state import GameState
    GameState.query.filter_by(character_id=character_id).delete()
    
    db.session.commit()
    return jsonify({
        'msg': 'Character restarted successfully',
        'character': character.to_dict()
    }), 200