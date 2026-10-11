"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { imageUrl } from "@/lib/view";
import { useFormRefresh } from "./form";
import { uploadImage } from "./image-actions";
import { buttonClass } from "./ui";

/** Downscale in the browser so uploads are small and fast. */
async function resize(file: File, maxSize: number) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  // Older Safari can't encode WebP and silently falls back to PNG.
  let blob = await encode("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg");
  if (!blob) throw new Error("Could not process image.");
  return { blob, width, height };
}

export function ImageField({
  label,
  name,
  defaultValue,
  help,
  maxSize = 1600,
  aspect = "aspect-[16/9]",
}: {
  label: string;
  name: string;
  defaultValue: string | null;
  help?: string;
  maxSize?: number;
  aspect?: string;
}) {
  const [id, setId] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const refresh = useFormRefresh();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    refresh();
  }, [id, refresh]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file isn't an image.");
      return;
    }
    setBusy(true);
    try {
      const { blob, width, height } = await resize(file, maxSize);
      const data = new FormData();
      data.set("file", new File([blob], "upload", { type: blob.type }));
      data.set("width", String(width));
      data.set("height", String(height));
      const result = await uploadImage(data);
      if ("error" in result) toast.error(result.error);
      else setId(result.id);
    } catch {
      toast.error("Upload failed. Try a different image.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const src = imageUrl(id);

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <input type="hidden" name={name} value={id} />
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files[0]);
        }}
        className={`relative flex ${aspect} max-h-72 w-full max-w-sm items-center justify-center overflow-hidden rounded-lg border border-dashed border-ink/20 bg-white`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-2 p-6 text-sm text-muted hover:text-ink"
          >
            <ImagePlus className="size-7" />
            Click or drop an image here
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader2 className="size-6 animate-spin text-accent" />
          </div>
        )}
      </div>
      {src && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={buttonClass.secondary}
          >
            <ImagePlus className="size-4" /> Replace
          </button>
          <button
            type="button"
            onClick={() => setId("")}
            className={buttonClass.ghost}
          >
            <Trash2 className="size-4" /> Remove
          </button>
        </div>
      )}
      {help && <p className="text-xs text-muted">{help}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
