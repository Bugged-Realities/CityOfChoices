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

    # Check for missing 'next' stage references
    print("\nChecking for missing 'next' stage references...")
    from app.models.scene import Scene
    from run import create_app
    app = create_app()
    with app.app_context():
        all_scenes = Scene.query.all()
        all_stages = {scene.stage for scene in all_scenes}
        missing = set()
        for scene in all_scenes:
            for option in (scene.options or []):
                next_stage = option.get('next')
                if next_stage and next_stage not in all_stages:
                    print(f"Missing stage: {next_stage} (referenced from {scene.stage})")
                    missing.add(next_stage)
        if not missing:
            print("No missing stage references found!")
        else:
            print("All missing stages:", missing)