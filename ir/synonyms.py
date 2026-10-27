"""
ir/synonyms.py - Medical Synonyms & Typo Correction (Levenshtein Distance)
==========================================================================
Expands queries with domain-specific first-aid synonyms and corrects
spelling errors using pure algorithmic edit distance from scratch.
"""

import sys

# Ensure UTF-8 output in Windows consoles
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from typing import List, Dict, Set, Optional


class SynonymSpellChecker:
    """
    Provides medical synonym expansion and Levenshtein-based spelling correction
    for medical emergency terms in both Arabic and English.
    """

    # Domain vocabulary / canonical keywords
    MEDICAL_VOCABULARY: Set[str] = {
        # Arabic
        "حرق", "حروق", "نار", "سلق", "فقاعات", "ماء", "فاتر",
        "نزيف", "جرح", "جروح", "شاش", "ضغط", "دم", "شريان",
        "اختناق", "تنفس", "سعال", "بلع", "هيمليك", "غصة",
        "كسر", "عظم", "التواء", "جبيرة", "الم", "تورم",
        "اغماء", "وعي", "دوار", "دوخة", "سقوط", "انعاش",
        # English
        "burn", "burns", "fire", "scald", "blister", "water",
        "bleed", "bleeding", "wound", "cut", "pressure", "blood",
        "choke", "choking", "breathe", "cough", "heimlich", "airway",
        "fracture", "bone", "sprain", "splint", "pain", "swelling",
        "faint", "fainting", "dizzy", "unconscious", "cpr"
    }

    # Medical Synonyms mapping: alternate/colloquial words -> canonical words
    SYNONYMS_MAP: Dict[str, List[str]] = {
        # Arabic
        "اتحرقت": ["حرق"],
        "لسعه": ["حرق"],
        "سخن": ["حرق", "ماء"],
        "مغلي": ["حرق", "ماء"],
        "تعويره": ["جرح", "نزيف"],
        "بينزف": ["نزيف", "دم"],
        "متعور": ["جرح"],
        "شرق": ["اختناق"],
        "زور": ["اختناق", "تنفس"],
        "مخنوق": ["اختناق"],
        "مغمى": ["اغماء", "وعي"],
        "دايخ": ["دوار", "اغماء"],
        # English
        "burned": ["burn"],
        "burning": ["burn"],
        "scalded": ["burn", "scald"],
        "hemorrhage": ["bleed", "blood"],
        "gash": ["cut", "wound"],
        "laceration": ["cut", "wound"],
        "suffocate": ["choke", "breathe"],
        "choked": ["choke"],
        "passed out": ["faint", "unconscious"],
        "blackout": ["faint"]
    }

    @staticmethod
    def levenshtein_distance(s1: str, s2: str) -> int:
        """
        Calculates the Levenshtein (edit) distance between two strings from scratch.
        DP algorithm: O(m * n) time and O(n) space.
        """
        if len(s1) < len(s2):
            return SynonymSpellChecker.levenshtein_distance(s2, s1)

        if len(s2) == 0:
            return len(s1)

        previous_row = list(range(len(s2) + 1))
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row

        return previous_row[-1]

    def correct_word(self, word: str, max_distance: int = 2) -> str:
        """
        Finds the closest known medical vocabulary word within max_distance.
        Returns the original word if no close match is found.
        """
        if word in self.MEDICAL_VOCABULARY or len(word) <= 2:
            return word

        best_word = word
        min_dist = max_distance + 1

        for vocab_word in self.MEDICAL_VOCABULARY:
            # Quick length filter optimization
            if abs(len(word) - len(vocab_word)) > max_distance:
                continue

            dist = self.levenshtein_distance(word, vocab_word)
            if dist < min_dist:
                min_dist = dist
                best_word = vocab_word

        if min_dist <= max_distance:
            return best_word

        return word

    def expand_and_correct(self, tokens: List[str]) -> List[str]:
        """
        1. Corrects typos in tokens using Levenshtein distance.
        2. Expands tokens with relevant medical synonyms.
        """
        expanded: List[str] = []
        for token in tokens:
            corrected = self.correct_word(token)
            expanded.append(corrected)

            # Add synonyms if available
            if corrected in self.SYNONYMS_MAP:
                for syn in self.SYNONYMS_MAP[corrected]:
                    if syn not in expanded:
                        expanded.append(syn)
            elif token in self.SYNONYMS_MAP:
                for syn in self.SYNONYMS_MAP[token]:
                    if syn not in expanded:
                        expanded.append(syn)

        return expanded


# ==============================================================================
# Quick Self-Test
# ==============================================================================
if __name__ == "__main__":
    checker = SynonymSpellChecker()

    print("=== Testing Levenshtein Distance ===")
    print("Distance between 'burn' and 'buring':", checker.levenshtein_distance("burn", "buring"))
    print("Distance between 'اختناق' and 'اختناك':", checker.levenshtein_distance("اختناق", "اختناك"))

    print("\n=== Testing Typo Correction ===")
    print("Correct 'buring'   ->", checker.correct_word("buring"))
    print("Correct 'اختناك'  ->", checker.correct_word("اختناك"))
    print("Correct 'نزيب'    ->", checker.correct_word("نزيب"))

    print("\n=== Testing Synonym Expansion ===")
    print("Tokens ['اتحرقت'] ->", checker.expand_and_correct(["اتحرقت"]))
    print("Tokens ['buring']   ->", checker.expand_and_correct(["buring"]))
