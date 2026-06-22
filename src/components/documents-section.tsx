import { Download, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  DOCUMENT_BUCKET,
  documentCategoryLabel,
  type PetDocument,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DocumentUploadDialog } from "@/components/document-upload-dialog";
import { DocumentDeleteButton } from "@/components/document-delete-button";
import { DocumentPreviewDialog } from "@/components/document-preview-dialog";

type LinkableEvent = { id: string; title: string; event_date: string };

function formatUploaded(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function DocumentsSection({
  petId,
  userId,
  documents,
  events,
}: {
  petId: string;
  userId: string;
  documents: PetDocument[];
  events: LinkableEvent[];
}) {
  const supabase = await createClient();

  // Batch a time-limited signed URL per document (private bucket).
  const signedById = new Map<string, string>();
  if (documents.length > 0) {
    const { data } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .createSignedUrls(
        documents.map((d) => d.storage_path),
        3600
      );
    (data ?? []).forEach((entry, i) => {
      if (entry.signedUrl) signedById.set(documents[i].id, entry.signedUrl);
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Vaccination records, bloodwork, vet notes, and more.
          </CardDescription>
        </div>
        <DocumentUploadDialog petId={petId} userId={userId} events={events} />
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents yet — upload a vaccination record, bloodwork, or vet
            notes.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {documents.map((doc) => {
              const url = signedById.get(doc.id);
              return (
                <li
                  key={doc.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <FileText
                    className="size-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{doc.file_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatUploaded(doc.uploaded_at)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {documentCategoryLabel(doc.category)}
                  </Badge>
                  {url && (
                    <>
                      <DocumentPreviewDialog
                        url={url}
                        fileName={doc.file_name}
                        mimeType={doc.mime_type}
                      />
                      <a
                        href={`${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(doc.file_name)}`}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Download ${doc.file_name}`}
                      >
                        <Download className="size-4" />
                      </a>
                    </>
                  )}
                  <DocumentDeleteButton
                    documentId={doc.id}
                    fileName={doc.file_name}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
