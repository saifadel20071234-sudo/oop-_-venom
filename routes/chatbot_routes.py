"""
routes/chatbot_routes.py - ML / NLU & Chatbot API
Integrates Member 3 (Reda El-Qeblawy)'s ML model, Member 1's IR, and Member 2's KB.
"""
from flask import Blueprint, request, jsonify
from contracts import nlu_parse
from services.clinical_pipeline import process_clinical_query

chatbot_bp = Blueprint("chatbot", __name__)


@chatbot_bp.route("/api/predict", methods=["POST"])
def predict():
    """Predict medical condition and language using Member 3's ML model."""
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    if not isinstance(text, str) or not text.strip():
        return jsonify({
            "status": "error",
            "message": "Valid text is required"
        }), 400

    try:
        result = nlu_parse(text.strip())
        return jsonify({
            "status": "success",
            "data": result
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"ML prediction failed: {str(e)}"
        }), 500


@chatbot_bp.route("/api/chat", methods=["POST"])
def chat():
    """Process message through unified ML + IR + KB clinical intelligence pipeline."""
    data = request.get_json(silent=True) or {}
    message = data.get("message", "")
    session_id = data.get("session_id", "default")

    if not isinstance(message, str) or not message.strip():
        return jsonify({
            "status": "error",
            "message": "Message cannot be empty"
        }), 400

    try:
        payload = process_clinical_query(message.strip(), session_id)
        res = dict(payload)
        res["data"] = payload
        res["status"] = "success"
        return jsonify(res), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Chat processing failed: {str(e)}"
        }), 500
