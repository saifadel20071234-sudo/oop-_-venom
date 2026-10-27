"""
api/index.py - Serverless entrypoint for Vercel.
Exposes the WSGI Flask application object `app`.
"""
import sys
from pathlib import Path

# Add project root to sys.path so all modules can be imported
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app import app
