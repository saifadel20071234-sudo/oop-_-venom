"""
routes/triage_routes.py - Medical Triage Inference API
Connects frontend and API clients to Member 2's Knowledge Base & Inference Engine.
"""

import sys
from pathlib import Path
from flask import Blueprint, request, jsonify

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from contracts import kb_infer

triage_bp = Blueprint("triage", __name__)


@triage_bp.route("/api/triage", methods=["POST"])
def perform_triage():
    data = request.get_json(silent=True) or {}
    facts = data.get("facts", data)
    context = data.get("context", {})

    if not isinstance(facts, dict) or not facts:
        return jsonify({
            "status": "error",
            "message": "Valid facts dictionary required for triage evaluation"
        }), 400

    try:
        result = kb_infer(facts=facts, context=context)
        return jsonify({
            "status": "success",
            "data": result
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Triage inference failed: {str(e)}"
        }), 500
