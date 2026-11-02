"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

/**
 * Chia sẻ bài. Nút Facebook dùng đường dẫn sharer chính thức, không cần SDK
 * và không thu thập dữ liệu gì của người đọc.
 */
export function ShareButtons({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `${siteUrl}${path}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl || path);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Trình duyệt chặn clipboard — bỏ qua, người dùng vẫn copy tay được.
      setCopied(false);
    }
  };

  const buttonClass =
    "inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-line px-4 text-[14.5px] font-semibold transition-colors hover:border-ink";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[14.5px] text-muted">Chia sẻ bài này:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        Facebook
      </a>
      <button type="button" onClick={copyLink} className={buttonClass}>
        {copied ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <Link2 size={16} aria-hidden="true" />
        )}
        {copied ? "Đã chép liên kết" : "Chép liên kết"}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? `Đã chép liên kết bài ${title}` : ""}
      </span>
    </div>
  );
}
