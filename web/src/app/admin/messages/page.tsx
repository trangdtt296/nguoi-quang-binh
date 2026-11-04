"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Mail, MailOpen, Phone } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import {
  AdminButton,
  AdminEmpty,
  AdminError,
  AdminLoading,
  Toast,
  useToast,
} from "@/components/admin/ui";
import { api, ApiError, type PageMeta } from "@/lib/admin/api-client";
import type { AdminContactMessage } from "@/lib/admin/types";
import { formatDate } from "@/lib/format";

export default function MessagesPage() {
  return (
    <AdminShell>
      <MessagesContent />
    </AdminShell>
  );
}

function MessagesContent() {
  const { toast, showError, dismiss } = useToast();

  const [items, setItems] = useState<AdminContactMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (unreadOnly) params.set("unread", "true");

      const { data, meta: pageMeta } = await api.get<{
        items: AdminContactMessage[];
        unread: number;
      }>(`/admin/contact-messages?${params}`);

      setItems(data.items);
      setUnread(data.unread);
      setMeta(pageMeta ?? null);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được tin nhắn",
      );
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleRead = async (message: AdminContactMessage) => {
    const nextValue = !message.isRead;

    // Đổi ngay trên giao diện rồi mới gọi API: thao tác này nhẹ và hay bấm
    // liên tục, chờ phản hồi mỗi lần thì cảm giác ì.
    setItems((current) =>
      current.map((item) =>
        item.id === message.id ? { ...item, isRead: nextValue } : item,
      ),
    );
    setUnread((current) => Math.max(0, current + (nextValue ? -1 : 1)));

    try {
      await api.patch(`/admin/contact-messages/${message.id}`, { isRead: nextValue });
    } catch (caught) {
      // Hỏng thì trả lại trạng thái cũ, không để giao diện nói dối.
      setItems((current) =>
        current.map((item) =>
          item.id === message.id ? { ...item, isRead: message.isRead } : item,
        ),
      );
      setUnread((current) => Math.max(0, current + (nextValue ? 1 : -1)));
      showError(caught instanceof ApiError ? caught.message : "Không cập nhật được");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold">Tin nhắn liên hệ</h1>
          <p className="mt-1.5 max-w-[70ch] text-[14.5px] text-muted">
            Góp ý và câu hỏi gửi từ form Liên hệ.{" "}
            {unread > 0 ? (
              <strong className="text-ink">{unread} tin chưa đọc.</strong>
            ) : (
              "Không có tin chưa đọc."
            )}
          </p>
        </div>

        <AdminButton
          variant="ghost"
          onClick={() => {
            setPage(1);
            setUnreadOnly((current) => !current);
          }}
        >
          {unreadOnly ? "Xem tất cả" : "Chỉ tin chưa đọc"}
        </AdminButton>
      </div>

      {loading ? (
        <AdminLoading label="Đang tải tin nhắn" />
      ) : error ? (
        <AdminError message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <AdminEmpty
          title={unreadOnly ? "Không có tin nào chưa đọc" : "Chưa có tin nhắn nào"}
          description="Tin nhắn gửi từ trang Liên hệ sẽ hiện ở đây."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((message) => (
              <article
                key={message.id}
                className={clsx(
                  "rounded-[12px] border bg-surface p-5",
                  message.isRead ? "border-line" : "border-ink",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-[16.5px] font-semibold">
                      {message.subject || "Không có tiêu đề"}
                      {!message.isRead ? (
                        <span className="ml-2.5 rounded-full bg-ink px-2 py-0.5 align-middle text-[11px] font-semibold text-white">
                          Mới
                        </span>
                      ) : null}
                    </h2>
                    <p className="mt-1.5 text-[13.5px] text-muted">
                      {message.fullName} · {formatDate(message.createdAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleRead(message)}
                    className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[8px] border border-line px-3 text-[13.5px] font-semibold transition-colors hover:border-ink"
                  >
                    {message.isRead ? (
                      <>
                        <Mail size={15} aria-hidden="true" />
                        Đánh dấu chưa đọc
                      </>
                    ) : (
                      <>
                        <MailOpen size={15} aria-hidden="true" />
                        Đánh dấu đã đọc
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed">
                  {message.message}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3.5 text-[13.5px]">
                  <a
                    href={`mailto:${message.email}`}
                    className="inline-flex items-center gap-2 underline underline-offset-4"
                  >
                    <Mail size={14} aria-hidden="true" />
                    {message.email}
                  </a>
                  {message.phone ? (
                    <a
                      href={`tel:${message.phone}`}
                      className="inline-flex items-center gap-2 underline underline-offset-4"
                    >
                      <Phone size={14} aria-hidden="true" />
                      {message.phone}
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          {meta && meta.totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[13.5px] text-muted">
                Trang {meta.page} / {meta.totalPages} · {meta.total} tin
              </p>
              <div className="flex gap-2">
                <AdminButton
                  variant="ghost"
                  disabled={meta.page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Trước
                </AdminButton>
                <AdminButton
                  variant="ghost"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Sau
                </AdminButton>
              </div>
            </div>
          ) : null}
        </>
      )}

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={dismiss} />
      ) : null}
    </div>
  );
}
