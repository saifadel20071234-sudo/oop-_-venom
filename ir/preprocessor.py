"""
ir/preprocessor.py - Multilingual Text Preprocessor (Arabic & English)
======================================================================
Custom, from-scratch implementation for medical & first-aid text normalization,
tokenization, stopword removal, and light stemming.
"""

import re
import sys
from typing import List, Set

# Ensure UTF-8 output in Windows consoles
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


class TextPreprocessor:
    """
    Handles normalization, tokenization, stopword filtering, 
    and stemming for both Arabic and English text.
    """

    # Common Arabic stopwords (normalized forms)
    ARABIC_STOPWORDS: Set[str] = {
        "في", "من", "على", "الي", "الى", "عن", "مع", "هذا", "هذه", "ذلك", "تلك",
        "هو", "هي", "هم", "هن", "نحن", "انا", "انت", "كان", "كانت",
        "يكون", "ان", "ما", "لا", "لم", "لن", "هل", "كيف", "اين",
        "متي", "متى", "لو", "اذا", "ثم", "او", "ام", "بعد",
        "قبل", "عند", "حتي", "حتى", "كل", "بعض", "غير", "قد", "لقد", "بل", "لكن", "يا",
        "اي", "الذي", "التي", "الذين", "اللذين", "بين", "فوق", "تحت"
    }

    # Common English stopwords
    ENGLISH_STOPWORDS: Set[str] = {
        "the", "a", "an", "in", "on", "at", "of", "to", "for", "with", "by",
        "from", "up", "about", "into", "through", "after", "before", "is", "am",
        "are", "was", "were", "be", "been", "being", "have", "has", "had", "do",
        "does", "did", "and", "but", "if", "or", "because", "as", "until", "while",
        "this", "that", "these", "those", "it", "its", "they", "them", "their",
        "we", "us", "our", "you", "your", "he", "him", "his", "she", "her",
        "how", "what", "where", "when", "why", "which", "can", "could", "should",
        "would", "will", "just", "so", "than", "too", "very", "there"
    }

    def __init__(self, remove_stops: bool = True, apply_stem: bool = True):
        self.remove_stops = remove_stops
        self.apply_stem = apply_stem

    @staticmethod
    def is_arabic(text: str) -> bool:
        """Detect if text contains Arabic characters."""
        return bool(re.search(r'[\u0600-\u06FF]', text))

    @staticmethod
    def normalize_arabic(text: str) -> str:
        """
        Normalize Arabic text:
        - Remove diacritics (tashkeel: fatha, damma, kasra, tanween, sukoon, shadda)
        - Remove tatweel (kashida ـ)
        - Normalize various alef shapes (أ, إ, آ, ٱ) -> ا
        - Normalize taa marbuta (ة) -> ه
        - Normalize alef maqsura (ى) -> ي
        """
        # Remove Tashkeel
        text = re.sub(r'[\u064B-\u0652\u0670]', '', text)
        # Remove Tatweel
        text = re.sub(r'\u0640', '', text)
        # Normalize Alefs
        text = re.sub(r'[أإآٱ]', 'ا', text)
        # Normalize Taa Marbuta
        text = re.sub(r'ة', 'ه', text)
        # Normalize Alef Maqsura
        text = re.sub(r'ى', 'ي', text)
        return text

    @staticmethod
    def normalize_english(text: str) -> str:
        """Lowercase English characters without affecting Arabic."""
        return text.lower()

    def clean_text(self, text: str) -> str:
        """Remove URLs, special symbols, punctuation, keeping only letters and numbers."""
        # Remove URLs
        text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
        # Normalize Arabic
        text = self.normalize_arabic(text)
        # Lowercase English
        text = self.normalize_english(text)
        # Replace punctuation, symbols, and underscores with space
        text = re.sub(r'[^\w\s]', ' ', text)
        text = text.replace('_', ' ')
        # Collapse multiple spaces into single space
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def tokenize(self, text: str) -> List[str]:
        """Split cleaned text into distinct word tokens."""
        cleaned = self.clean_text(text)
        if not cleaned:
            return []
        return cleaned.split()

    def light_stem_arabic(self, word: str) -> str:
        """
        Light stemming for Arabic words:
        Strips common definite articles, prefixes and suffixes while 
        maintaining a minimum root length (>= 3 letters).
        """
        if len(word) <= 3:
            return word

        # Strip compound prefixes (وال, فال, بال, كال, لل, ال)
        compound_prefixes = ["وال", "فال", "بال", "كال", "لل", "ال"]
        for p in compound_prefixes:
            if word.startswith(p) and (len(word) - len(p)) >= 3:
                word = word[len(p):]
                break
        else:
            # Single-letter prefixes (waw, faa, baa) only when remaining length >= 4 to avoid over-stemming
            single_prefixes = ["و", "ف", "ب"]
            for p in single_prefixes:
                if word.startswith(p) and (len(word) - len(p)) >= 4:
                    word = word[len(p):]
                    break

        # Strip suffixes (ات, ون, ين, هم, هن, ها, كم, نا, يه, يا, ه, ي, ك)
        suffixes = ["ات", "ون", "ين", "هم", "هن", "ها", "كم", "نا", "يه", "يا", "ه", "ي", "ك"]
        for s in suffixes:
            if word.endswith(s) and (len(word) - len(s)) >= 3:
                word = word[:-len(s)]
                break

        return word

    def light_stem_english(self, word: str) -> str:
        """
        Light stemming for English words:
        Removes common inflectional suffixes while keeping root >= 3 letters.
        """
        if len(word) <= 3:
            return word

        suffixes = ["sses", "ies", "ing", "edly", "ed", "ly", "es", "s"]
        for s in suffixes:
            if word.endswith(s) and (len(word) - len(s)) >= 3:
                if s == "ies":
                    return word[:-3] + "y"
                return word[:-len(s)]

        return word

    def stem(self, token: str) -> str:
        """Stem token depending on whether it is Arabic or English."""
        if self.is_arabic(token):
            return self.light_stem_arabic(token)
        return self.light_stem_english(token)

    def preprocess(self, text: str) -> List[str]:
        """
        Full pipeline: Clean -> Tokenize -> Filter Stopwords -> Stem.
        Returns a list of clean processed tokens.
        """
        tokens = self.tokenize(text)
        processed: List[str] = []

        for token in tokens:
            # Stopword check
            if self.remove_stops:
                if token in self.ARABIC_STOPWORDS or token in self.ENGLISH_STOPWORDS:
                    continue

            # Stemming
            final_token = self.stem(token) if self.apply_stem else token
            if final_token and len(final_token) > 1:
                processed.append(final_token)

        return processed


# ==============================================================================
# Quick Self-Test
# ==============================================================================
if __name__ == "__main__":
    preprocessor = TextPreprocessor()

    print("=== Testing Arabic Preprocessing ===")
    ar_sample = "اتَحَرَّقْتُ بِمَاءٍ سَاخِنٍ وَظَهَرَتْ فُقَاعَاتٌ كَبِيرَةٌ فِي يَدِي!"
    print("Original:", ar_sample)
    print("Tokens  :", preprocessor.preprocess(ar_sample))

    print("\n=== Testing English Preprocessing ===")
    en_sample = "The patient is bleeding heavily from a deep wound and choking!"
    print("Original:", en_sample)
    print("Tokens  :", preprocessor.preprocess(en_sample))
