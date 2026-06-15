"use client";

import { Archive } from "lucide-react";
import { archivePet } from "@/app/actions/pets";
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

export function ArchivePetButton({
  petId,
  petName,
}: {
  petId: string;
  petName: string;
}) {
  const archiveAction = archivePet.bind(null, petId);

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="sm">
            <Archive className="size-4" /> Archive
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive {petName}?</AlertDialogTitle>
          <AlertDialogDescription>
            {petName} will be hidden from your pets list. Their records are kept,
            and you can restore them later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={archiveAction}>
            <AlertDialogAction type="submit" variant="destructive">
              Archive
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
