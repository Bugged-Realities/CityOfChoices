from flask import Blueprint, jsonify, request
import random
from app.models.scene import Scene
from app import db

story_bp = Blueprint('story', __name__)

@story_bp.route('/start', methods=['GET'])
def get_start():
    start_stages = ['start_subway', 'start_city', 'start_depths']
    nodes = Scene.query.filter(Scene.stage.in_(start_stages)).all()
    if nodes:
        node = random.choice(nodes)
        return jsonify(node.to_dict())
    return jsonify({'error': 'No start nodes found'}), 404

@story_bp.route('/choice', methods=['POST'])
def make_choice():
    data = request.get_json()
    current_stage = data.get('current')
    choice_index = data.get('choice_index')

    current_node = Scene.query.filter_by(stage=current_stage).first()
    if not current_node:
        return jsonify({'error': 'Invalid current node'}), 400

    try:
        options = current_node.options or []
        next_stage = options[choice_index]['next']
        next_node = Scene.query.filter_by(stage=next_stage).first()
        if next_node:
            return jsonify(next_node.to_dict())
        else:
            return jsonify({'error': 'Next node not found'}), 404
    except (IndexError, KeyError, TypeError):
        return jsonify({'error': 'Invalid choice'}), 400

@story_bp.route('/use-item', methods=['POST'])
def use_item_for_story():
    data = request.get_json()
    current_stage = data.get('current')
    item_name = data.get('item_name')

    current_node = Scene.query.filter_by(stage=current_stage).first()
    if not current_node:
        return jsonify({'error': 'Invalid current node'}), 400

    item_triggers = current_node.item_triggers or []
    for trigger in item_triggers:
        if trigger['item'] == item_name:
            next_stage = trigger['next']
            next_node = Scene.query.filter_by(stage=next_stage).first()
            if next_node:
                return jsonify({
                    'node': next_node.to_dict(),
                    'message': f'Using {item_name} triggered story progression!'
                })
            else:
                return jsonify({'error': 'Next node not found'}), 404

    return jsonify({
        'message': f'{item_name} was used but no story progression was triggered',
        'current_node': current_node.to_dict()
    }), 200