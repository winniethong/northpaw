"use client";

import { useState } from "react";
import { Eye, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const STEP = 0.25;

export function DocumentPreviewDialog({
  url,
  fileName,
  mimeType,
}: {
  url: string;
  fileName: string;
  mimeType: string | null;
}) {
  const [zoom, setZoom] = useState(1);

  const isPdf = mimeType === "application/pdf" || /\.pdf$/i.test(fileName);
  const isImage =
    (mimeType?.startsWith("image/") ?? false) ||
    /\.(png|jpe?g|gif|webp)$/i.test(fileName);
  const previewable = isPdf || isImage;

  const clamp = (z: number) =>
    Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100));

  return (
    <Dialog
      onOpenChange={(open) => {
        // Reset zoom when opening (not on close, to avoid a state write
        // during the unmount transition).
        if (open) setZoom(1);
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={`Preview ${fileName}`}>
            <Eye className="size-4" />
          </Button>
        }
      />
      <DialogContent className="flex h-[92vh] w-[95vw] max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[95vw]">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="truncate pr-8">{fileName}</DialogTitle>
        </DialogHeader>

        {previewable ? (
          <div className="relative flex-1 overflow-hidden p-4">
            <div className="h-full overflow-auto rounded-md border">
              {isPdf ? (
                <iframe
                  src={url}
                  title={fileName}
                  className="h-full w-full origin-top"
                  style={{ transform: `scale(${zoom})` }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={fileName}
                  className="mx-auto block origin-top object-contain"
                  style={{ transform: `scale(${zoom})` }}
                />
              )}
            </div>

            <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-popover/90 px-2 py-1 shadow-sm backdrop-blur">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Zoom out"
                disabled={zoom <= MIN_ZOOM}
                onClick={() => setZoom((z) => clamp(z - STEP))}
              >
                <ZoomOut className="size-4" />
              </Button>
              <span className="w-12 text-center text-sm tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Zoom in"
                disabled={zoom >= MAX_ZOOM}
                onClick={() => setZoom((z) => clamp(z + STEP))}
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Reset zoom"
                disabled={zoom === 1}
                onClick={() => setZoom(1)}
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="p-4 text-sm text-muted-foreground">
            This file type can&apos;t be previewed.{" "}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Open in a new tab
            </a>
            .
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
