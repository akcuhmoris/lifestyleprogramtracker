"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, ImagePlus, Trash2, Eye, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import {
  deleteProgressPhotoAction,
  getPhotoUrlAction,
  uploadProgressPhotoAction,
} from "@/app/actions";
import { smallBurst } from "./confetti";

type Photo = { filename: string; mime: string | null };

type Props = {
  date: string;
  completed: boolean;
  photo: Photo | null;
  disabled?: boolean;
  onChange?: (photo: Photo | null) => void;
};

function useSignedPhotoUrl(storageKey: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!storageKey) {
      setUrl(null);
      return;
    }
    let cancelled = false;
    getPhotoUrlAction(storageKey).then((res) => {
      if (cancelled) return;
      if (res.ok) setUrl(res.url);
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);
  return url;
}

export function PhotoCard({ date, completed, photo, disabled, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const signedUrl = useSignedPhotoUrl(photo?.filename);

  function pickFile() {
    if (disabled || uploading) return;
    fileRef.current?.click();
  }

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("date", date);
    fd.append("file", file);
    const res = await uploadProgressPhotoAction(fd);
    setUploading(false);
    if (!res.ok) {
      setError(res.error ?? "Upload failed.");
      return;
    }
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      smallBurst(
        (rect.left + rect.width / 2) / window.innerWidth,
        (rect.top + rect.height / 2) / window.innerHeight
      );
    }
    onChange?.({ filename: res.key, mime: file.type });
  }

  async function handleRemove() {
    if (disabled || uploading) return;
    const res = await deleteProgressPhotoAction(date);
    if (res.ok) {
      onChange?.(null);
    }
  }

  const hasPhoto = Boolean(photo);

  return (
    <motion.div
      ref={cardRef}
      whileHover={disabled ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-colors",
        "focus-within:ring-2 focus-within:ring-accent/60",
        disabled && "opacity-40",
        completed
          ? "bg-gradient-to-br from-accent/20 via-accent/8 to-transparent border-accent/50 shadow-glow"
          : "bg-bg-card border-border hover:border-accent/30 hover:bg-bg-hover"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity",
          completed ? "bg-accent/80 opacity-100" : "bg-accent/30 opacity-40 group-hover:opacity-80"
        )}
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          if (fileRef.current) fileRef.current.value = "";
        }}
      />

      {hasPhoto && photo && signedUrl ? (
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="block w-full text-left"
          aria-label="View progress photo"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-bg-elevated">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={signedUrl}
              alt={`Progress photo for ${date}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent" />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-bg/70 backdrop-blur px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] text-accent-glow">
                <Check className="h-3 w-3" strokeWidth={3} />
                Logged
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-bg/70 backdrop-blur px-2 py-0.5 text-[11px] text-text">
                <Eye className="h-3 w-3" />
                View
              </span>
            </div>
          </div>
        </button>
      ) : hasPhoto && !signedUrl ? (
        // Loading the signed URL — show a subtle placeholder
        <div className="relative aspect-[16/10] overflow-hidden bg-bg-elevated flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-text-muted animate-spin" />
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={pickFile}
          className={cn(
            "relative w-full text-left px-5 py-5 min-h-[124px] flex flex-col gap-3",
            "focus:outline-none",
            disabled && "cursor-not-allowed"
          )}
        >
          <div className="flex items-start justify-between gap-3 relative">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-bg-elevated text-text-muted group-hover:text-accent-glow group-hover:border-accent/30 transition-all">
              <Camera className="h-[18px] w-[18px]" strokeWidth={2} />
            </div>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-bg-elevated text-text-muted group-hover:border-accent/50 group-hover:text-accent-glow transition-colors">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" strokeWidth={2.5} />
              )}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-end relative">
            <div className="text-[15px] font-medium leading-tight tracking-tight text-text">
              Progress photo
            </div>
            <div className="text-[12.5px] mt-1 text-text-dim">
              {uploading ? "Uploading…" : "Tap to upload"}
            </div>
          </div>
        </button>
      )}

      {(hasPhoto || error) && (
        <div className="flex items-center justify-between gap-2 border-t border-border-subtle px-3 py-2">
          {error ? (
            <span className="text-[11.5px] text-state-miss">{error}</span>
          ) : (
            <span className="text-[11px] uppercase tracking-[0.16em] text-text-dim">
              {photo?.mime?.split("/")[1]?.toUpperCase() ?? "Image"} · {date}
            </span>
          )}
          {hasPhoto && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={pickFile}
                disabled={uploading}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-muted hover:text-accent-glow hover:bg-accent/5 transition-colors"
              >
                <ImagePlus className="h-3 w-3" />
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-muted hover:text-state-miss hover:bg-state-miss/10 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      {hasPhoto && photo && signedUrl && (
        <PreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          src={signedUrl}
          date={date}
        />
      )}
    </motion.div>
  );
}

function PreviewDialog({
  open,
  onOpenChange,
  src,
  date,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  src: string;
  date: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-0 z-50 bg-black/85 backdrop-blur"
              />
            </Dialog.Overlay>
            <Dialog.Content
              forceMount
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none focus:outline-none"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                className="relative max-h-[88vh] max-w-[88vw] pointer-events-auto"
              >
                <Dialog.Title className="sr-only">
                  Progress photo for {date}
                </Dialog.Title>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Progress photo for ${date}`}
                  className="max-h-[88vh] max-w-[88vw] rounded-2xl border border-border bg-bg-card object-contain shadow-card"
                />
                <div className="absolute bottom-3 left-3 rounded-full border border-accent/40 bg-bg/70 backdrop-blur px-3 py-1 text-xs text-accent-glow">
                  {date}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
