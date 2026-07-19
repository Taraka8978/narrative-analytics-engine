import os
import sys
from functools import lru_cache

MODEL_NAME = os.getenv(
    "SENTIMENT_MODEL",
    "distilbert-base-uncased-finetuned-sst-2-english",
)


class FallbackLexiconSentiment:
    """Fallback lexicon-based sentiment classifier for resilience against pipeline failures."""
    def __init__(self):
        self.positive_words = {'good', 'great', 'excellent', 'love', 'perfect', 'awesome', 'best', 'happy', 'satisfied', 'nice', 'favorable', 'success', 'recommend'}
        self.negative_words = {'bad', 'poor', 'worst', 'hate', 'terrible', 'waste', 'broke', 'broken', 'slow', 'defect', 'fail', 'crash', 'issue', 'error', 'unhappy', 'annoying'}

    def __call__(self, texts):
        results = []
        for text in texts:
            text_lower = str(text).lower()
            pos_count = sum(1 for w in self.positive_words if w in text_lower)
            neg_count = sum(1 for w in self.negative_words if w in text_lower)
            
            if pos_count > neg_count:
                label = "POSITIVE"
                score = 0.85
            elif neg_count > pos_count:
                label = "NEGATIVE"
                score = 0.85
            else:
                label = "NEUTRAL"
                score = 0.5
            results.append({"label": label, "score": score})
        return results


@lru_cache(maxsize=1)
def get_sentiment_model():
    try:
        from transformers import pipeline
        return pipeline("sentiment-analysis", model=MODEL_NAME)
    except Exception as e:
        print(f"WARNING: Failed to load Hugging Face model '{MODEL_NAME}' due to: {e}. Falling back to lexicon classifier.", file=sys.stderr, flush=True)
        return FallbackLexiconSentiment()
