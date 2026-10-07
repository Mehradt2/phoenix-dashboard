# Benchmark — Persian/Medical Text Intelligence

## Decision
Do not use one LLM as the scoring brain. Use a layered architecture.

### Layer A — deterministic Persian canonicalization
Baseline candidate: Hazm normalization/tokenization plus project-specific medical dictionary.
Hazm supports Persian normalization, tokenization, lemmatization and informal processing. This is suitable as a preprocessing baseline, not as the final medical classifier.

### Layer B — Persian semantic encoder
Baseline candidate: ParsBERT v3 or another approved Persian encoder.
ParsBERT was pre-trained on large Persian corpora and is a good baseline for Persian classification/embeddings. It is not medical-specific by itself.

### Layer C — medical Persian encoder
Benchmark candidate: SINA-BERT.
SINA-BERT is specifically pre-trained for Persian medical text and reports evaluation on medical question categorization, medical sentiment and retrieval. It should be benchmarked against ParsBERT on our real transcripts.

### Layer D — entity extraction
MVP:
- curated dictionary + normalization + fuzzy aliases for drug/disease/symptom/test names;
- generic Persian NER candidate for person/location/date/etc;
- medical entity model only after internal Gold, because public Persian medical NER coverage is inconsistent.

### Layer E — VOC
Topic classifier: fine-tuned Persian encoder on our taxonomy.
Sentiment baseline: ParsBERT sentiment can be used for benchmarking, but production promotion requires our call-center Gold because e-commerce sentiment domain is not equivalent to health-support calls.

## Required benchmark matrix
Models:
- deterministic lexical baseline
- ParsBERT
- SINA-BERT
- optional compact local instruction model as assistive extractor only

Datasets:
- physician transcripts
- sampler transcripts
- VOC/user transcripts
- hard negatives
- negation cases
- colloquial Persian
- drug/disease/test spelling variants
- noisy STT variants

Metrics:
- rule evidence precision/recall
- entity precision/recall/F1 by entity type
- negation accuracy
- topic macro-F1
- sentiment macro-F1
- hallucination rate
- latency, RAM, CPU
- calibration / abstention rate

## Promotion rule
A model is promoted only when it beats deterministic baseline on Gold without reducing critical recall. Otherwise it stays advisory.
