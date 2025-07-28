from flask_sqlalchemy import SQLAlchemy

# Create a single instance of the SQLAlchemy class
# This is used to create the database and tables
# It is also used to query the database
db = SQLAlchemy()

from .characters import Character
from .game_state import GameState
from .user import Users
from .inventory import Inventory
from .scenes import Scene
from .token_blocklist import TokenBlocklist

__all__ = ['db', 'Character', 'GameState', 'Users', 'Inventory', 'Scene', 'TokenBlocklist']