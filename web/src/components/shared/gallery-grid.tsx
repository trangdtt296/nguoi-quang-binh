"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { MediaItem } from "@/types/content";
import { ContentImage } from "./content-image";

/**
 * Lưới ảnh album, bấm vào mở ảnh lớn.
 *
 * Ảnh lớn mở ngay trong trang chứ không điều hướng đi đâu, nên người xem
 * đóng lại là quay về đúng chỗ cũ trong lưới.
 */
export function GalleryGrid({ items }: { items: MediaItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) => {
        if (current === null) return current;
        const next = current + delta;
        if (next < 0 || next >= items.length) return current;
        return next;
      }),
    [items.length],
  );

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };

    document.addEventListener("keydown", onKey);
    // Khóa cuộn nền khi đang xem ảnh lớn.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex, close, step]);

  const current = openIndex === null ? null : items[openIndex];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group block w-full overflow-hidden rounded-[12px] border border-line text-left transition-shadow hover:shadow-[0_10px_28px_rgba(13,17,20,0.1)]"
          >
            <ContentImage
              src={item.url}
              alt={item.altText}
              ratio="4/3"
              className="transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {item.caption ? (
              <p className="p-4 text-[14px] leading-relaxed text-muted">{item.caption}</p>
            ) : null}
          </button>
        ))}
      </div>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.altText}
          className="fixed inset-0 z-50 flex flex-col bg-abyss/95 p-4"
          onClick={close}
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[8px] text-white hover:bg-white/10"
            >
              <X size={22} aria-hidden="true" />
              <span className="sr-only">Đóng</span>
            </button>
          </div>

          <div
            className="flex min-h-0 flex-1 items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={openIndex === 0}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-[8px] text-white hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft size={24} aria-hidden="true" />
              <span className="sr-only">Ảnh trước</span>
            </button>

            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
              <div className="w-full max-w-[1000px]">
                <ContentImage src={current.url} alt={current.altText} ratio="3/2" />
              </div>
              <p className="text-center text-[14px] text-silver">
                {current.caption ?? current.altText}
                <span className="ml-3 text-white/50">
                  {(openIndex ?? 0) + 1} / {items.length}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => step(1)}
              disabled={openIndex === items.length - 1}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-[8px] text-white hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronRight size={24} aria-hidden="true" />
              <span className="sr-only">Ảnh sau</span>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
