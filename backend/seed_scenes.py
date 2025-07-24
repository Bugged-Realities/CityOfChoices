import json
from app import db
from app.models.scene import Scene
from flask import Flask
from run import create_app

def seed_scenes():
    app = create_app()
    with app.app_context():
        with open('app/data/cityStory.json', 'r') as f:
            scenes_data = json.load(f)
            for scene in scenes_data:
                # Use .get() to avoid KeyError if item_triggers is missing
                new_scene = Scene(
                    stage=scene.get('stage'),
                    description=scene.get('description'),
                    options=scene.get('options'),
                    item_triggers=scene.get('item_triggers')
                )
                db.session.add(new_scene)
            db.session.commit()
        print("Seeding complete!")

if __name__ == "__main__":
    seed_scenes()