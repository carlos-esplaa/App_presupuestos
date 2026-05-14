"""
One-time script to initialize the database and seed default data.
Run from backend/ directory:  python migrations/init_db.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine
from app.models import Base

if __name__ == "__main__":
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")
    print("Seeding default data via main._seed_default_data()...")
    from app.main import _seed_default_data
    _seed_default_data()
    print("Done. Database initialized at data/finance.db")
