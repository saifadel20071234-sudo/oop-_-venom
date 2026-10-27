from chatbot.templates import RESPONSE_TEMPLATES, DEFAULT_RESPONSE

def compose_response(condition):
    if condition is None or not str(condition).strip():
        return ("Sorry, Icouldn't understand your message." 
                "Please describe the situation more clearly.")
    
    condition = str(condition).strip().lower()
    return RESPONSE_TEMPLATES.get(condition,DEFAULT_RESPONSE)
    
if __name__ == '__main__':
    test_conditions = [
        "burn",
        "mosebleed",
        "choking",
        "unknown_condition",
        None
    ]

    for condition in test_conditions:
        print('Condition:', condition)
        print('Response:', compose_response(condition))
        print('-' * 50)