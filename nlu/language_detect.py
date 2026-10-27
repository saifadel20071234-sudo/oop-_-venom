try:
    from langdetect import detect, DetectorFactory, LangDetectException
    DetectorFactory.seed = 0
except ImportError:
    pass


def detect_language(text):
    """
    Detect whether the user's message is Arabic or English.
    """
    if not text or not str(text).strip():
        return "unknown"
    text = str(text)

    arabic_count = 0
    english_count = 0
    for char in text:
        if "\u0600" <= char <= "\u06FF":
            arabic_count += 1
        elif "a" <= char.lower() <= "z":
            english_count += 1
    if arabic_count > english_count and arabic_count > 0:
        return "ar"
    if english_count > arabic_count and english_count > 0:
        return "en"
    return "unknown"


if __name__ == "__main__":
    test_messages = [
       'I have a BURN on my hand',
       'عندي نزيف من الانف',
       'someone is chocking',
       'عندي كسر في ايدي',
       '12345'
    ]

    for message in test_messages:
        print('Message:', message)
        print('Detected language:', detect_language(message))
        print("-" * 40)
