"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createDocument } from "@/app/actions/documents";
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_BUCKET,
  DOCUMENT_CATEGORIES,
  DOCUMENT_MAX_BYTES,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LinkableEvent = { id: string; title: string; event_date: string };

const NONE = "none";

export function DocumentUploadDialog({
  petId,
  userId,
  events,
}: {
  petId: string;
  userId: string;
  events: LinkableEvent[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>(DOCUMENT_CATEGORIES[0].value);
  const [eventId, setEventId] = useState<string>(NONE);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fileInput = e.currentTarget.elements.namedItem(
      "file"
    ) as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) return setError("Choose a file to upload.");
    if (file.size > DOCUMENT_MAX_BYTES)
      return setError("File is larger than 10 MB.");

    setPending(true);
    try {
      const ext = file.name.includes(".")
        ? file.name.split(".").pop()!.toLowerCase()
        : "bin";
      const path = `${userId}/${petId}/${crypto.randomUUID()}.${ext}`;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(DOCUMENT_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const result = await createDocument(petId, {
        storagePath: path,
        fileName: file.name,
        mimeType: file.type || null,
        sizeBytes: file.size,
        category,
        eventId: eventId === NONE ? null : eventId,
      });

      if (result && "error" in result) {
        // Roll back the orphaned object so we don't leave a dangling file.
        await supabase.storage.from(DOCUMENT_BUCKET).remove([path]);
        setError(result.error);
        return;
      }

      setOpen(false);
      setCategory(DOCUMENT_CATEGORIES[0].value);
      setEventId(NONE);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Upload className="size-4" /> Upload document
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>
            PDF, JPG, or PNG up to 10 MB. Stored privately to your pet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" name="file" type="file" accept={DOCUMENT_ACCEPT} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {events.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="event">Link to a timeline event (optional)</Label>
              <Select value={eventId} onValueChange={(v) => setEventId(v ?? NONE)}>
                <SelectTrigger id="event" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {events.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>
                      {ev.event_date} — {ev.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="self-start">
            {pending ? "Uploading…" : "Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
