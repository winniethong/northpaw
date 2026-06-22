import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { embedQuery, toVectorLiteral } from "@/lib/voyage";

export const runtime = "nodejs";

type MatchedChunk = {
  content: string;
  document_id: string;
  chunk_index: number;
  distance: number;
};

export async function POST(req: Request) {
  const { petId, question } = await req.json();
  if (!petId || typeof question !== "string" || !question.trim()) {
    return new Response("Missing petId or question.", { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // Embed the question, then retrieve the most relevant chunks for this pet.
  // The RPC is RLS-scoped, so it only matches chunks the user owns.
  const embedding = await embedQuery(question);
  const { data, error } = await supabase.rpc("match_document_chunks", {
    p_pet_id: petId,
    query_embedding: toVectorLiteral(embedding),
    match_count: 5,
  });
  if (error) return new Response(error.message, { status: 500 });

  const chunks = (data as MatchedChunk[]) ?? [];
  if (chunks.length === 0) {
    return new Response(
      "There are no ingested documents for this pet yet, so I can't answer from records.",
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const context = chunks
    .map((c, i) => `[Source ${i + 1} — document ${c.document_id}]\n${c.content}`)
    .join("\n\n");

  const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY
  const mstream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system:
      "You answer questions about a pet's health records using ONLY the provided record excerpts. " +
      "If the answer is not in them, say you don't know based on the records. " +
      "Keep answers concise and cite the source numbers you used (e.g. [Source 2]). " +
      "Respond in plain text only — do not use Markdown formatting (no **, #, bullets, or backticks).",
    messages: [
      {
        role: "user",
        content: `Record excerpts:\n\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of mstream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "stream failed";
        controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
