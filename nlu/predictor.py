import joblib
from pathlib import Path
from nlu.preprocessor_ml import preprocess_text

PROJECT_DIR = Path(__file__).resolve().parent.parent

_saved_data = None
_model = None
_vectorizer = None

CONFIDENCE_THRESHOLD = 0.10


def _get_model():
    global _saved_data, _model, _vectorizer
    if _model is None:
        model_path = PROJECT_DIR / "nlu" / "First_aid_model.joblib"
        if not model_path.exists():
            model_path = PROJECT_DIR / "nlu" / "first_aid_model.joblib"
        _saved_data = joblib.load(model_path)
        _model = _saved_data["model"]
        _vectorizer = _saved_data["vectorizer"]
    return _model, _vectorizer


def predict_condition(text):
    """
    Predict a possible condition from a user message.
    Reject empty or unsupported text and low-confidence predictions.
    """
    model, vectorizer = _get_model()

    # Step 1: Clean the input text
    cleaned_text = preprocess_text(text)
    if not cleaned_text:
        return None

    # Step 2: Convert text into TF-IDF features
    text_tfidf = vectorizer.transform([cleaned_text])

    # Step 3: Check whether the text contains known vocabulary
    if text_tfidf.nnz == 0:
        return None

    # Step 4: Get prediction probabilities
    probabilities = model.predict_proba(text_tfidf)[0]

    # Step 5: Find the most likely condition
    best_index = probabilities.argmax()
    confidence = float(probabilities[best_index])
    prediction = str(model.classes_[best_index])

    # Step 6: Reject low-confidence predictions
    if confidence < CONFIDENCE_THRESHOLD:
        return None
    return prediction


def predict_with_confidence(text):
    """Returns (condition, confidence, probabilities_dict)."""
    model, vectorizer = _get_model()
    cleaned = preprocess_text(text)
    if not cleaned:
        return None, 0.0, {}
    vec = vectorizer.transform([cleaned])
    if vec.nnz == 0:
        return None, 0.0, {}
    probs = model.predict_proba(vec)[0]
    best_idx = probs.argmax()
    conf = float(probs[best_idx])
    pred = str(model.classes_[best_idx])
    prob_dict = {str(cls): float(p) for cls, p in zip(model.classes_, probs)}
    return pred, conf, prob_dict
