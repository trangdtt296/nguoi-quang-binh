"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { AdminButton } from "./ui";
import { useImageUpload } from "./use-image-upload";

/** Ô ảnh bìa, ảnh banner…: bấm là chọn ảnh từ máy và tải lên luôn. */
export function CoverImagePanel({
  value,
  onChange,
  label = "Ảnh bìa",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const { pick, uploading, input } = useImageUpload((image) => onChange(image.url));
  const lowerLabel = label.toLowerCase();

  return (
    <div className="rounded-[12px] border border-line bg-surface p-5">
      <h2 className="mb-4 text-[15px] font-semibold">{label}</h2>
      {input}

      {value ? (
        <>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={`${label} đã chọn`}
              className="aspect-video w-full rounded-[8px] object-cover"
            />
            {uploading ? <UploadingOverlay /> : null}
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={uploading}
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-abyss/80 text-white"
            >
              <X size={15} aria-hidden="true" />
              <span className="sr-only">Bỏ {lowerLabel}</span>
            </button>
          </div>
          <AdminButton
            variant="ghost"
            className="mt-3 w-full"
            loading={uploading}
            onClick={pick}
          >
            {uploading ? "Đang tải lên" : "Đổi ảnh khác"}
          </AdminButton>
        </>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={uploading}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-silver text-muted transition-colors hover:border-ink hover:text-ink disabled:cursor-wait"
        >
          {uploading ? (
            <>
              <Loader2 size={20} className="animate-spin" aria-hidden="true" />
              <span className="text-[13.5px]">Đang tải ảnh lên…</span>
            </>
          ) : (
            <>
              <ImagePlus size={20} aria-hidden="true" />
              <span className="text-[13.5px]">Chọn {lowerLabel} từ máy</span>
              <span className="text-[12px]">JPG, PNG, WebP · tối đa 8 MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

function UploadingOverlay() {
  return (
    <div
      role="status"
      className="absolute inset-0 flex items-center justify-center gap-2 rounded-[8px] bg-surface/80 text-[13.5px] font-medium"
    >
      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      Đang tải ảnh lên…
    </div>
  );
}
