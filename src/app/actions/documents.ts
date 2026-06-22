"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  DOCUMENT_BUCKET,
  DOCUMENT_CATEGORIES,
  type DocumentCategory,
} from "@/lib/types";

export type DocumentActionState = { ok: true } | { error: string } | undefined;

const VALID_CATEGORIES = DOCUMENT_CATEGORIES.map((c) => c.value) as string[];

export async function createDocument(
  petId: string,
  input: {
    storagePath: string;
    fileName: string;
    mimeType: string | null;
    sizeBytes: number | null;
    category: string;
    eventId: string | null;
  }
): Promise<DocumentActionState> {
  if (!VALID_CATEGORIES.includes(input.category)) {
    return { error: "Pick a category." };
  }
  if (!input.storagePath || !input.fileName) {
    return { error: "Upload failed — no file." };
  }

  const supabase = await createClient();

  // If linking to an event, make sure it belongs to this pet (defense in depth;
  // RLS already scopes documents to the owner's pet).
  if (input.eventId) {
    const { data: event } = await supabase
      .from("health_events")
      .select("id")
      .eq("id", input.eventId)
      .eq("pet_id", petId)
      .maybeSingle();
    if (!event) return { error: "That event doesn't belong to this pet." };
  }

  const { error } = await supabase.from("documents").insert({
    pet_id: petId,
    category: input.category as DocumentCategory,
    storage_path: input.storagePath,
    file_name: input.fileName,
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes,
    event_id: input.eventId,
  });
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/pets/${petId}`);
  return { ok: true };
}

export async function deleteDocument(
  documentId: string
): Promise<DocumentActionState> {
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("id, pet_id, storage_path")
    .eq("id", documentId)
    .maybeSingle();
  if (!doc) return { error: "Document not found." };

  // Remove the object first; the row is the source of truth for the listing.
  const { error: storageError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .remove([doc.storage_path]);
  if (storageError) return { error: storageError.message };

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/pets/${doc.pet_id}`);
  return { ok: true };
}
