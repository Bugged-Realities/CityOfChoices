from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Inventory, Character, Users

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/', methods=['GET'])
@jwt_required()
def get_inventory():
    try:
        user_id = get_jwt_identity()
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        character = Character.query.filter_by(user_id=user_id).first()
        if not character:
            return jsonify({'error': 'Character not found'}), 404
        
        inventory_items = Inventory.query.filter_by(character_id=character.id).all()
        return jsonify({'inventory': [item.to_dict() for item in inventory_items]}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to get inventory', 'details': str(e)}), 500

@inventory_bp.route('/add', methods=['POST'])
@jwt_required()
def add_item():
    try:
        user_id = get_jwt_identity()
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        character = Character.query.filter_by(user_id=user_id).first()
        if not character:
            return jsonify({'error': 'Character not found'}), 404
        
        data = request.get_json()
        if not data or 'item_name' not in data:
            return jsonify({'error': 'Item name is required'}), 400
        
        new_item = Inventory(
            character_id=character.id,
            item_name=data['item_name'],
            description=data.get('description', ''),
            used=False
        )
        
        db.session.add(new_item)
        db.session.commit()
        
        return jsonify({'message': 'Item added successfully', 'item': new_item.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add item', 'details': str(e)}), 500

@inventory_bp.route('/<int:item_id>/use', methods=['PUT'])
@jwt_required()
def use_item(item_id):
    try:
        user_id = get_jwt_identity()
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        character = Character.query.filter_by(user_id=user_id).first()
        if not character:
            return jsonify({'error': 'Character not found'}), 404
        
        item = Inventory.query.filter_by(id=item_id, character_id=character.id).first()
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        if item.used:
            return jsonify({'error': 'Item already used'}), 400
        
        item.used = True
        db.session.commit()
        
        return jsonify({'message': 'Item used successfully', 'item': item.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to use item', 'details': str(e)}), 500

@inventory_bp.route('/reset', methods=['POST'])
@jwt_required()
def reset_inventory():
    try:
        user_id = get_jwt_identity()
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        character = Character.query.filter_by(user_id=user_id).first()
        if not character:
            return jsonify({'error': 'Character not found'}), 404
        
        # Delete all inventory items for this character
        Inventory.query.filter_by(character_id=character.id).delete()
        db.session.commit()
        
        return jsonify({'message': 'Inventory reset successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reset inventory', 'details': str(e)}), 500

