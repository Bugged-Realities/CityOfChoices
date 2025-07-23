from flask import Blueprint, jsonify, request
import json
import os

story_bp = Blueprint('story', __name__)

# Load story JSON once at startup
STORY_PATH = os.path.join(os.path.dirname(__file__), '../data/cityStory.json')
with open(STORY_PATH, 'r') as f:
    STORY = json.load(f)

def find_node(title):
    for node in STORY:
        if node['title'] == title:
            return node
    return None

@story_bp.route('/start', methods=['GET'])
def get_start():
    node = find_node('start')
    if node:
        return jsonify(node)
    return jsonify({'error': 'Start node not found'}), 404

@story_bp.route('/choice', methods=['POST'])
def make_choice():
    data = request.get_json()
    current = data.get('current')
    choice_index = data.get('choice_index')

    current_node = find_node(current)
    if not current_node:
        return jsonify({'error': 'Invalid current node'}), 400


    try:
        next_title = current_node['choices'][choice_index]['next']
        next_node = find_node(next_title)
        if next_node:
            return jsonify(next_node)
        else:
            return jsonify({'error': 'Next node not found'}), 404
    except (IndexError, KeyError, TypeError):
        return jsonify({'error': 'Invalid choice'}), 400