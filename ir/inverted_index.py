"""
ir/inverted_index.py - Inverted Index Data Structure & Builder
==============================================================
Builds, updates, serializes, and deserializes an inverted index
over medical text guides. Tracks Term Frequency (TF) and word positions.
"""

import os
import sys
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional

# Ensure project root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ir.preprocessor import TextPreprocessor


class InvertedIndex:
    """
    Inverted Index that maps terms to document occurrences, frequencies, and positions.
    Structure:
        index[term][doc_id] = {
            "tf": int,                # Raw frequency in doc
            "positions": List[int]    # 0-indexed token positions
        }
    """

    def __init__(self, preprocessor: Optional[TextPreprocessor] = None):
        self.preprocessor = preprocessor or TextPreprocessor()
        # term -> {doc_id: {"tf": count, "positions": [...]}}
        self.index: Dict[str, Dict[str, Dict[str, Any]]] = {}
        # doc_id -> metadata dictionary
        self.documents: Dict[str, Dict[str, Any]] = {}
        # doc_id -> total token count in doc
        self.doc_token_counts: Dict[str, int] = {}

    def clear(self) -> None:
        """Reset the index and document store."""
        self.index.clear()
        self.documents.clear()
        self.doc_token_counts.clear()

    @staticmethod
    def parse_guide_file(file_path: Path) -> Dict[str, Any]:
        """
        Parse a guide text file with metadata header.
        Header format:
            TITLE: Burns Management
            SOURCE: NHS UK
            DATE: 2024-01-15
            URL: https://...
            ---
            [body text...]
        """
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        metadata: Dict[str, str] = {
            "title": file_path.stem.replace("_", " ").title(),
            "source": "Unknown Source",
            "date": "",
            "url": ""
        }
        body_text = content

        if "---" in content:
            header, body = content.split("---", 1)
            body_text = body.strip()
            for line in header.strip().splitlines():
                if ":" in line:
                    key, val = line.split(":", 1)
                    key = key.strip().lower()
                    val = val.strip()
                    if key == "title":
                        metadata["title"] = val
                    elif key == "source":
                        metadata["source"] = val
                    elif key == "date":
                        metadata["date"] = val
                    elif key == "url":
                        metadata["url"] = val

        metadata["raw_text"] = body_text
        metadata["doc_id"] = file_path.name
        return metadata

    def add_document(self, doc_id: str, title: str, text: str, source: str = "", url: str = "", date: str = "") -> None:
        """Tokenize and insert a document into the inverted index."""
        tokens = self.preprocessor.preprocess(text)
        self.doc_token_counts[doc_id] = len(tokens)
        self.documents[doc_id] = {
            "doc_id": doc_id,
            "title": title,
            "source": source,
            "url": url,
            "date": date,
            "raw_text": text,
            "token_count": len(tokens)
        }

        # Build term positions and frequencies
        for position, token in enumerate(tokens):
            if token not in self.index:
                self.index[token] = {}
            if doc_id not in self.index[token]:
                self.index[token][doc_id] = {"tf": 0, "positions": []}

            self.index[token][doc_id]["tf"] += 1
            self.index[token][doc_id]["positions"].append(position)

    def build_from_directory(self, dir_path: str) -> int:
        """
        Scan a directory containing .txt guide files and build the index.
        Returns the number of documents indexed.
        """
        path = Path(dir_path)
        if not path.exists() or not path.is_dir():
            raise FileNotFoundError(f"Guides directory '{dir_path}' does not exist.")

        self.clear()
        files = list(path.glob("*.txt"))
        for file in files:
            doc_data = self.parse_guide_file(file)
            self.add_document(
                doc_id=doc_data["doc_id"],
                title=doc_data["title"],
                text=doc_data["raw_text"],
                source=doc_data["source"],
                url=doc_data["url"],
                date=doc_data["date"]
            )

        return len(self.documents)

    def get_postings(self, term: str) -> Dict[str, Dict[str, Any]]:
        """Return postings list for a given preprocessed term."""
        return self.index.get(term, {})

    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve document metadata and text by doc_id."""
        return self.documents.get(doc_id)

    @property
    def total_documents(self) -> int:
        """Total number of documents indexed."""
        return len(self.documents)

    @property
    def vocabulary_size(self) -> int:
        """Total number of unique terms in the vocabulary."""
        return len(self.index)

    def save(self, cache_file_path: str) -> None:
        """Serialize index and document metadata to JSON file."""
        os.makedirs(os.path.dirname(cache_file_path), exist_ok=True)
        data = {
            "version": "1.0",
            "doc_token_counts": self.doc_token_counts,
            "documents": self.documents,
            "index": self.index
        }
        with open(cache_file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def load(self, cache_file_path: str) -> bool:
        """Deserialize index from JSON file."""
        path = Path(cache_file_path)
        if not path.exists():
            return False

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.doc_token_counts = data.get("doc_token_counts", {})
        self.documents = data.get("documents", {})
        self.index = data.get("index", {})
        return True


# ==============================================================================
# Quick Self-Test
# ==============================================================================
if __name__ == "__main__":
    idx = InvertedIndex()
    count = idx.build_from_directory("data/guides")
    print(f"Indexed {count} documents successfully.")
    print(f"Vocabulary size: {idx.vocabulary_size} unique terms.")

    # Sample term lookup
    sample_term = "حرق"
    postings = idx.get_postings(sample_term)
    print(f"\nPostings for term '{sample_term}':", postings)

    sample_en = "bleed"
    postings_en = idx.get_postings(sample_en)
    print(f"\nPostings for term '{sample_en}':", postings_en)
