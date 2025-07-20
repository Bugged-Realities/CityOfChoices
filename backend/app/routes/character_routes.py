from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.character import Character

character_bp = Blueprint('character', __name__)

@character_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_character():
    user_id = get_jwt_identity()
    character = Character.query.filter_by(user_id=user_id).first()
    if not character:
        return jsonify({'msg': 'Character not found'}), 404
    return jsonify(character.to_dict()), 200
