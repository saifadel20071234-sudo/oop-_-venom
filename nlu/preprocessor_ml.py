import re
import pandas as pd


def preprocess_text(text):
    """
    Clean Arabic and English text before machine learning.
    """
    # Handle missing or non-string input
    if pd.isna(text):
        return ""
    text = str(text)

    # Convert text to lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)

    # Keep Arabic letters, English letters, numbers, and spaces
    text = re.sub(r"[^a-zA-Z0-9\u0600-\u06FF\s]", " ", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()
    return text


if __name__ == '__main__':
    examples = ['I have a BURN on my hand!', 'عندي حريق في ايدي', 'I have a حريق on my hand!']
    for example in examples:
        print('Original:', example)
        print('Processed:', preprocess_text(example))
        print('-' * 40)
