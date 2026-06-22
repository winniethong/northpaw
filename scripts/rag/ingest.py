"""RAG ingestion: documents -> text -> chunks -> Voyage embeddings -> pgvector.

Run from scripts/rag/ with a populated .env (see .env.placeholder). Idempotent:
skips documents that already have chunks unless --reset is passed.

    python ingest.py            # ingest documents that have no chunks yet
    python ingest.py --reset    # re-ingest everything (wipes chunks first)

Uses the Supabase service-role key, which bypasses RLS — this is server-side
tooling only; never ship the service-role key to the browser.
"""

from __future__ import annotations

import argparse
import io
import os
import sys

from dotenv import load_dotenv
from pypdf import PdfReader
from supabase import create_client
import voyageai

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
VOYAGE_API_KEY = os.environ["VOYAGE_API_KEY"]

BUCKET = "pet-documents"
# Must match the vector(1024) column dimension in the document_chunks table.
EMBED_MODEL = "voyage-3.5-lite"
CHUNK_CHARS = 3000   # ~800 tokens
CHUNK_OVERLAP = 400  # ~100 tokens

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
voyage = voyageai.Client(api_key=VOYAGE_API_KEY)


def extract_text(file_bytes: bytes, mime_type: str | None, file_name: str) -> str:
    is_pdf = (mime_type == "application/pdf") or file_name.lower().endswith(".pdf")
    if not is_pdf:
        # Images/other types need OCR — out of scope for this spike.
        return ""
    reader = PdfReader(io.BytesIO(file_bytes))
    return "\n".join((page.extract_text() or "") for page in reader.pages).strip()


def chunk_text(text: str) -> list[str]:
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = start + CHUNK_CHARS
        chunks.append(text[start:end])
        start += CHUNK_CHARS - CHUNK_OVERLAP
    return [c.strip() for c in chunks if c.strip()]


def vector_literal(values: list[float]) -> str:
    # pgvector accepts the text form "[v1,v2,...]" through PostgREST.
    return "[" + ",".join(repr(v) for v in values) + "]"


def has_chunks(document_id: str) -> bool:
    res = (
        supabase.table("document_chunks")
        .select("id")
        .eq("document_id", document_id)
        .limit(1)
        .execute()
    )
    return len(res.data) > 0


def ingest_document(doc: dict) -> int:
    file_bytes = supabase.storage.from_(BUCKET).download(doc["storage_path"])
    text = extract_text(file_bytes, doc.get("mime_type"), doc["file_name"])
    if not text:
        print(f"  skip (no extractable text): {doc['file_name']}")
        return 0

    chunks = chunk_text(text)
    if not chunks:
        return 0

    embeddings = voyage.embed(
        chunks, model=EMBED_MODEL, input_type="document"
    ).embeddings

    rows = [
        {
            "document_id": doc["id"],
            "pet_id": doc["pet_id"],
            "content": chunk,
            "chunk_index": i,
            "embedding": vector_literal(emb),
        }
        for i, (chunk, emb) in enumerate(zip(chunks, embeddings))
    ]
    supabase.table("document_chunks").insert(rows).execute()
    print(f"  ingested {len(rows)} chunks: {doc['file_name']}")
    return len(rows)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="re-ingest all documents")
    args = parser.parse_args()

    docs = supabase.table("documents").select("*").execute().data
    if not docs:
        print("No documents found.")
        return

    if args.reset:
        supabase.table("document_chunks").delete().neq(
            "id", "00000000-0000-0000-0000-000000000000"
        ).execute()
        print("Reset: cleared all document_chunks.")

    total = 0
    for doc in docs:
        if not args.reset and has_chunks(doc["id"]):
            continue
        print(f"Processing: {doc['file_name']}")
        total += ingest_document(doc)

    print(f"Done. {total} chunks ingested.")


if __name__ == "__main__":
    try:
        main()
    except KeyError as e:
        sys.exit(f"Missing env var: {e}. Copy .env.placeholder to .env and fill it in.")
