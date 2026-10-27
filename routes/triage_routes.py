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
from services.clinical_pipeline import process_clinical_query

triage_bp = Blueprint("triage", __name__)


@triage_bp.route("/api/triage", methods=["POST"])
def perform_triage():
    data = request.get_json(silent=True) or {}

    # Check if this is frontend questionnaire request: {category: "burns", symptoms: [...]}
    category = data.get("category")
    symptoms = data.get("symptoms", [])

    if category is not None:
        query_text = f"{category} " + " ".join(symptoms)
        pipeline_res = process_clinical_query(query_text)

        triage_output = {
            "severity": pipeline_res.get("severity", "orange"),
            "title": pipeline_res.get("title", "تقييم سريري للحالة"),
            "summary": pipeline_res.get("summary", ""),
            "reason": pipeline_res.get("reasoning", "تم تقييم الأعراض وفق بروتوكول الفرز الطبي المعتمد."),
            "steps": pipeline_res.get("steps", []),
            "do_list": pipeline_res.get("do_list", []),
            "dont_list": pipeline_res.get("dont_list", []),
            "source": pipeline_res.get("source", "البروتوكول الطبي المعتمد"),
            "referral": pipeline_res.get("referral", "أقرب مستشفى طوارئ")
        }
        res = dict(triage_output)
        res["status"] = "success"
        res["data"] = triage_output
        return jsonify(res), 200

    # Otherwise standard facts format: {facts: {...}}
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
