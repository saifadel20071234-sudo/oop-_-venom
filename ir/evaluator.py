"""
ir/evaluator.py - Information Retrieval Quantitative Evaluation (Precision@k & MRR)
====================================================================================
Measures the retrieval quality of the custom IR engine across Arabic and English
emergency test benchmarks. Produces tables for the final project report.
"""

import os
import sys
from typing import List, Dict, Any, Tuple

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ir.searcher import FirstAidSearcher


class IREvaluator:
    """
    Evaluates IR retrieval quality against labeled ground-truth benchmarks.
    Metrics:
        - Precision@k: (Relevant docs in top-k) / k
        - Recall@k: (Relevant docs in top-k) / (Total relevant docs)
        - MRR (Mean Reciprocal Rank): Average of (1 / rank of first relevant doc)
    """

    # Benchmark test dataset: (query, expected_relevant_doc_id)
    BENCHMARK_QUERIES: List[Tuple[str, str]] = [
        # Burns
        ("علاج الحروق بمياه باردة", "burns.txt"),
        ("اتحرقت بزيت مغلي وطلع فقاعات", "burns.txt"),
        ("how to treat severe hot water burn?", "burns.txt"),
        ("buring skin blister", "burns.txt"),  # with typo

        # Bleeding & Cuts
        ("صاحبي بينزف دم كتير من رجله", "cuts_bleeding.txt"),
        ("نزيف حاد مستمر لا يتوقف", "cuts_bleeding.txt"),
        ("how to stop bleeding from deep cut wound?", "cuts_bleeding.txt"),
        ("pressure on bleeding limb", "cuts_bleeding.txt"),

        # Choking
        ("واحد بيشرق ومش عارف ياخد نفسه", "choking.txt"),
        ("اسعاف الاختناق وبلع شيء غريب", "choking.txt"),
        ("heimlich maneuver abdominal thrusts", "choking.txt"),
        ("choking victim cannot breathe or speak", "choking.txt"),
    ]

    def __init__(self, searcher: FirstAidSearcher):
        self.searcher = searcher

    def evaluate(self, k_values: List[int] = [1, 2, 3]) -> Dict[str, Any]:
        """
        Runs the benchmark evaluation and returns aggregated metrics.
        """
        num_queries = len(self.BENCHMARK_QUERIES)
        if num_queries == 0:
            return {}

        precision_at_k: Dict[int, float] = {k: 0.0 for k in k_values}
        reciprocal_ranks: List[float] = []

        query_details: List[Dict[str, Any]] = []

        for query, expected_doc in self.BENCHMARK_QUERIES:
            max_k = max(k_values)
            results = self.searcher.search(query, k=max_k)
            retrieved_ids = [r["doc_id"] for r in results]

            # Calculate rank of first relevant doc
            rr = 0.0
            for rank_idx, r_id in enumerate(retrieved_ids, 1):
                if r_id == expected_doc:
                    rr = 1.0 / rank_idx
                    break
            reciprocal_ranks.append(rr)

            # Calculate precision@k
            query_stat = {
                "query": query,
                "expected": expected_doc,
                "retrieved": retrieved_ids,
                "first_rank": int(1.0 / rr) if rr > 0 else None
            }
            query_details.append(query_stat)

            for k in k_values:
                top_k = retrieved_ids[:k]
                rel_count = sum(1 for doc in top_k if doc == expected_doc)
                precision_at_k[k] += (rel_count / k)

        # Average metrics
        avg_precision = {k: round(total / num_queries, 4) for k, total in precision_at_k.items()}
        mrr = round(sum(reciprocal_ranks) / num_queries, 4)

        return {
            "total_queries": num_queries,
            "precision_at_k": avg_precision,
            "mrr": mrr,
            "details": query_details
        }

    def print_report_table(self, metrics: Dict[str, Any]) -> None:
        """Prints a publication-ready formatted ASCII table for the project report."""
        print("\n" + "=" * 65)
        print("📊 FIRST AID IR ENGINE - EVALUATION RESULTS (BENCHMARK)")
        print("=" * 65)
        print(f"Total Test Queries: {metrics['total_queries']} (Bilingual AR/EN + Typos)")
        print("-" * 65)
        print(f"{'Metric':<25} | {'Score':<15} | {'Percentage':<15}")
        print("-" * 65)

        for k, p in metrics["precision_at_k"].items():
            print(f"Precision@{k:<15} | {p:<15.4f} | {p * 100:>6.1f}%")

        print(f"{'MRR (Mean Reciprocal Rank)':<25} | {metrics['mrr']:<15.4f} | {metrics['mrr'] * 100:>6.1f}%")
        print("=" * 65)


# ==============================================================================
# Quick Self-Test
# ==============================================================================
if __name__ == "__main__":
    searcher = FirstAidSearcher()
    evaluator = IREvaluator(searcher)
    results = evaluator.evaluate(k_values=[1, 2, 3])
    evaluator.print_report_table(results)
