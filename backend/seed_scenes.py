import json
import os
from app import create_app, db
from app.models import Scene
from sqlalchemy import text

def seed_scenes():
    app = create_app()
    
    with app.app_context():
        # Load the JSON data
        json_path = os.path.join(os.path.dirname(__file__), 'app', 'cityStory.json')
        
        with open(json_path, 'r') as file:
            story_data = json.load(file)
        
        # Clear existing scenes and reset sequence
        Scene.query.delete()
        db.session.execute(text('ALTER SEQUENCE scenes_id_seq RESTART WITH 1'))
        
        # Insert scenes from the JSON data
        for scene_data in story_data:
            scene = Scene(
                stage=scene_data['stage'],
                description=scene_data['description'],
                options=scene_data['options'],
                item_triggers=scene_data.get('item_triggers', None)
            )
            
            db.session.add(scene)
        
        # Commit all changes
        db.session.commit()
        
        print(f"Successfully seeded {len(story_data)} scenes with IDs starting at 1")

if __name__ == '__main__':
    seed_scenes() 