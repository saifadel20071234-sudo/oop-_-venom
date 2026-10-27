"""
routes/chatbot_routes.py - ML / NLU & Chatbot API
Integrates Member 3 (Reda El-Qeblawy)'s ML model and dialog manager.
"""
from flask import Blueprint, request, jsonify
from contracts import nlu_parse, chatbot_reply

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
    """Process message through dialog manager and guardrails."""
    data = request.get_json(silent=True) or {}
    message = data.get("message", "")
    session_id = data.get("session_id", "default")

    if not isinstance(message, str) or not message.strip():
        return jsonify({
            "status": "error",
            "message": "Message cannot be empty"
        }), 400

    try:
        reply = chatbot_reply({"session_id": session_id}, message.strip())
        return jsonify({
            "status": "success",
            "data": reply
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Chat processing failed: {str(e)}"
        }), 500
