"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteDocument } from "@/app/actions/documents";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DocumentDeleteButton({
  documentId,
  fileName,
}: {
  documentId: string;
  fileName: string;
}) {
  const router = useRouter();

  async function onDelete() {
    await deleteDocument(documentId);
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={`Delete ${fileName}`}>
            <Trash2 className="size-4" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this document?</AlertDialogTitle>
          <AlertDialogDescription>
            {fileName} will be permanently removed. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
