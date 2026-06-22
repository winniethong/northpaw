import "server-only";

// Voyage embeddings — must use the same model/dimension as the ingestion script
// (scripts/rag/ingest.py) and the vector(1024) column in document_chunks.
const VOYAGE_MODEL = "voyage-3.5-lite";

export async function embedQuery(text: string): Promise<number[]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: [text],
      model: VOYAGE_MODEL,
      input_type: "query",
    }),
  });

  if (!res.ok) {
    throw new Error(`Voyage embedding failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data[0].embedding;
}

// pgvector accepts the text form "[v1,v2,...]" through PostgREST/RPC.
export function toVectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}
