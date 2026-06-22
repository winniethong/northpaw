# RAG ingestion

Offline pipeline: `documents` → text → chunks → Voyage embeddings → `document_chunks` (pgvector). The query/answer side lives in the Next app.

## Setup

```bash
cd scripts/rag
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in SUPABASE_SERVICE_ROLE_KEY and VOYAGE_API_KEY
```

Get the service-role key from the Supabase dashboard (Project Settings → API → `service_role`). Get a Voyage key from voyageai.com.

## Run

```bash
python ingest.py          # ingest documents that have no chunks yet
python ingest.py --reset  # wipe all chunks and re-ingest (use after changing chunking/model)
```

Idempotent — safe to re-run. Text-based PDFs only for now (scanned images need OCR, out of scope).

> The embedding model (`voyage-3.5-lite`, 1024 dims) must match the `vector(1024)` column in `document_chunks`. Changing the model/dims requires a DB migration.
