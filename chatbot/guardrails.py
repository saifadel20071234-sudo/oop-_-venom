def check_input(message):
    '''
    Check whether the user's message is valid.
    '''
    if message is None:
        return False, "Please rnter a message."
    massege = str(message).strip()

    if not message:
        return False, "Your message is empty. Please describe the situation."

    if len(message) < 3:
        return False, "Your message is too short. Please provide more details."
    return True, None

def check_condition(condition):
    '''
    Check whether the predicted condition is valid.
    '''
    if condition is None:
        return False, "I couldn't identify a possible first-aid topic. Please describe the situatin more clearly."
    condition = str(condition).strip()

    if not condition:
        return False, "I couldn't identify a possible first-aid topic. Please descibe the situation more cleary."
    return True, None

if __name__ == '__main__':
    test_massega = [
        "",
        " ",
        "Hi",
        "I have on burnon my hand"
    ]

    for message in test_massega:
        is_valid, error_message = check_input(message)
        print('Message', repr(message))
        print('Valid:', is_valid)
        print('Message:', error_message)
        print("-" * 40)