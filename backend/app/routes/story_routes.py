from flask import Blueprint, jsonify, request
import json
import os

story_bp = Blueprint('story', __name__)

# Load story JSON once at startup
STORY_PATH = os.path.join(os.path.dirname(__file__), '../data/cityStory.json')
with open(STORY_PATH, 'r') as f:
    STORY = json.load(f)

@story_bp.route('/start', methods=['GET'])
def get_start():
    node = STORY['start']
    return jsonify(node)

@story_bp.route('/choice', methods=['POST'])
def make_choice():
    data = request.get_json()
    current = data.get('current')
    choice_index = data.get('choice_index')
    if current not in STORY:
        return jsonify({'error': 'Invalid story node'}), 400
    node = STORY[current]
    try:
        next_key = node['choices'][choice_index]['next']
        next_node = STORY[next_key]
        return jsonify(next_node)
    except (IndexError, KeyError):
        return jsonify({'error': 'Invalid choice'}), 400