"""
chatbot/dialog_manager.py - Manages conversation flow and condition handling
Author: Reda El-Qeblawy (Member 3 - ML/NLU Lead)
"""
import sys
from pathlib import Path

PROJECT_PATH = Path(__file__).resolve().parent.parent
if str(PROJECT_PATH) not in sys.path:
    sys.path.insert(0, str(PROJECT_PATH))

from nlu.predictor import predict_condition
from chatbot.guardrails import check_input, check_condition
from chatbot.response_composer import compose_response


def process_message(message):
    # Step 1: Validate the user's input
    is_valid, error_message = check_input(message)
    if not is_valid:
        return {
            "condition": None,
            "message": error_message
        }

    # Step 2: Predict the possible condition
    condition = predict_condition(message)

    # Step 3: Validate the prediction
    is_valid, error_message = check_condition(condition)
    if not is_valid:
        return {
            "condition": None,
            "message": error_message
        }

    # Step 4: Compose the response
    response = compose_response(condition)

    # Step 5: Return the result
    return {
        "condition": condition,
        "message": response
    }


if __name__ == "__main__":
    user_message = input("Describe the situation: ")
    result = process_message(user_message)
    print("\nPredicted condition:", result["condition"])
    print("System response:", result["message"])
