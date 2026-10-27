"""
services/search_service.py - Search Service Integration
Connects the Backend /api/search endpoint directly to the Information Retrieval (IR) Engine.
"""

import sys
from pathlib import Path
from typing import List, Dict, Any

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from contracts import ir_search


def search_guides(query: str, k: int = 3) -> List[Dict[str, Any]]:
    """
    Search medical guides using the custom Inverted Index, TF-IDF,
    and Cosine Similarity engine (Member 1).
    """
    query = (query or "").strip()
    if not query:
        return []

    try:
        return ir_search(query=query, k=k)
    except Exception as e:
        print(f"[SearchService Error]: {e}")
        return []
