"""
contracts.py - System-wide Integration Contracts
=================================================
This file defines the standard function signatures, inputs, and outputs 
for the First Aid Awareness Assistant. All team members must adhere to these contracts.
"""

from typing import List, Dict, Any, Optional


# ==============================================================================
# Member 1: Information Retrieval (IR) - IMPLEMENTED & READY
# ==============================================================================
def ir_search(query: str, k: int = 3) -> List[Dict[str, Any]]:
    """
    Search guides using Inverted Index, TF-IDF and Cosine Similarity.
    
    Args:
        query: Free text question or symptoms from the user.
        k: Maximum number of ranked documents to return (default 3).
        
    Returns:
        List of dicts:
        [
            {
                "doc_id": "burns.txt",
                "title": "Burns Management",
                "score": 0.875,
                "snippet": "...cool the burn under <b>running water</b>...",
                "source": "NHS UK"
            },
            ...
        ]
    """
    from ir.searcher import search
    return search(query=query, k=k)


def ir_rebuild_index() -> bool:
    """Rebuild the Inverted Index cache when documents are modified."""
    from ir.searcher import get_searcher
    return get_searcher().rebuild_index() > 0


# ==============================================================================
# Member 2: Knowledge Base & Inference Engine (KB) - IMPLEMENTED & READY
# ==============================================================================
_kb_engine_instance = None

def _get_kb_engine():
    global _kb_engine_instance
    if _kb_engine_instance is None:
        from kb.knowledge_base import KnowledgeBase
        from kb.inference_engine import InferenceEngine
        _kb_engine_instance = InferenceEngine(KnowledgeBase())
    return _kb_engine_instance


def kb_infer(facts: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Perform medical triage reasoning using Forward & Backward chaining rules.
    
    Args:
        facts: User facts, e.g. {"condition": "burn", "degree": 3, "location": "face"}
        context: Session context or previous answers.
        
    Returns:
        Dict:
        {
            "severity": "red",          # "red" | "orange" | "green"
            "rules_fired": ["burn_001"],
            "actions": ["Call emergency 123 immediately", "Cover loosely"],
            "questions": [],            # Follow-up question if information is missing
            "explanation": "Rule burn_001 triggered: degree 3 burn is always critical."
        }
    """
    return _get_kb_engine().infer(facts=facts, context=context)


# ==============================================================================
# Member 3: Natural Language Understanding & Chatbot (ML/NLU) - IMPLEMENTED & READY
# ==============================================================================
def nlu_parse(text: str) -> Dict[str, Any]:
    """
    Extract intent, medical condition, and language from user free text.
    Uses Member 3 (Reda)'s ML classifier and language detector.
    
    Args:
        text: Raw user text.
        
    Returns:
        {
            "condition": "burn",
            "confidence": 0.92,
            "language": "arabic" | "english"
        }
    """
    from nlu.predictor import predict_with_confidence
    from nlu.language_detect import detect_language

    cond, conf, _ = predict_with_confidence(text)
    lang_code = detect_language(text)
    lang = "arabic" if lang_code == "ar" else ("english" if lang_code == "en" else "unknown")

    return {
        "condition": cond,
        "confidence": round(conf, 4) if conf else 0.0,
        "language": lang,
        "raw_text": text
    }


def chatbot_reply(session: Optional[Dict[str, Any]], text: str) -> Dict[str, Any]:
    """
    Generate conversational first-aid advice integrating Member 3's Dialog Manager
    with Member 1 (IR) and Member 2 (KB).
    """
    from chatbot.dialog_manager import process_message

    result = process_message(text)
    condition = result.get("condition")
    message = result.get("message")

    severity = "green"
    if condition in ["choking", "anaphylaxis", "allergy_anaphylaxis", "cpr", "electric_shock", "heatstroke"]:
        severity = "red"
    elif condition in ["burn", "fracture", "poisoning", "seizures", "seizure", "asthma"]:
        severity = "orange"

    return {
        "condition": condition,
        "message": message,
        "severity": severity,
        "status": "success"
    }


# ==============================================================================
# Member 4: Storage & File Handling - IMPLEMENTED & READY
# ==============================================================================
def storage_load_guide(filename: str) -> Dict[str, Any]:
    """Load text guide document with header metadata."""
    from storage.storage import StorageManager
    return StorageManager().load_guide(filename)


def storage_load_rules() -> Dict[str, Any]:
    """Load expert rules from JSON."""
    from storage.storage import StorageManager
    return StorageManager().load_rules()


def storage_log_query(query: str, condition: str, severity: str, response_time_ms: int) -> None:
    """Append anonymous query event to queries.log."""
    from storage.storage import StorageManager
    StorageManager().log_query(query, condition, severity, response_time_ms)
