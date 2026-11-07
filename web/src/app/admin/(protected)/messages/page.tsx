"use client";

import { useState } from "react";
import clsx from "clsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, MailOpen, Phone } from "lucide-react";
import {
  AdminButton,
  AdminEmpty,
  PageHeader,
  Pager,
  QueryState,
  useToast,
} from "@/components/admin/ui";
import { api } from "@/lib/admin/api-client";
import { queryKeys, useListQuery } from "@/lib/admin/queries";
import type { AdminContactMessage } from "@/lib/admin/types";
import { formatDate } from "@/lib/format";
import { getErrorMessage, type ApiResponse } from "@/lib/http";

const ENDPOINT = "/admin/contact-messages";

type MessagesResponse = ApiResponse<{ items: AdminContactMessage[]; unread: number }>;

/** Đổi trạng thái đọc của một tin trong dữ liệu đã tải, cập nhật luôn số chưa đọc. */
function applyRead(data: MessagesResponse, id: string, isRead: boolean): MessagesResponse {
  const target = data.data.items.find((item) => item.id === id);
  if (!target || target.isRead === isRead) return data;
  return {
    ...data,
    data: {
      items: data.data.items.map((item) => (item.id === id ? { ...item, isRead } : item)),
      unread: Math.max(0, data.data.unread + (isRead ? -1 : 1)),
    },
  };
}

export default function MessagesPage() {
  const { showError } = useToast();
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  const params = { page, limit: 20, unread: unreadOnly || undefined };
  const listKey = queryKeys.list(ENDPOINT, params);
  const query = useListQuery<MessagesResponse["data"]>(ENDPOINT, params);
  const unread = query.data?.data.unread ?? 0;

  // Đổi ngay trên giao diện rồi mới gọi API: thao tác này nhẹ và hay bấm
  // liên tục, chờ phản hồi mỗi lần thì cảm giác ì.
  const toggleRead = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      api.patch(`${ENDPOINT}/${id}`, { isRead }),
    onMutate: async ({ id, isRead }) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      queryClient.setQueryData<MessagesResponse>(listKey, (data) =>
        data ? applyRead(data, id, isRead) : data,
      );
    },
    onError: (error, { id, isRead }) => {
      // Hỏng thì trả lại trạng thái cũ, không để giao diện nói dối.
      queryClient.setQueryData<MessagesResponse>(listKey, (data) =>
        data ? applyRead(data, id, !isRead) : data,
      );
      showError(getErrorMessage(error, "Không cập nhật được"));
    },
    // Số tin chưa đọc cũng hiện ở bảng điều khiển.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["/admin/dashboard/stats"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tin nhắn liên hệ"
        description={
          <>
            Góp ý và câu hỏi gửi từ form Liên hệ.{" "}
            {unread > 0 ? (
              <strong className="text-ink">{unread} tin chưa đọc.</strong>
            ) : (
              "Không có tin chưa đọc."
            )}
          </>
        }
        actions={
          <AdminButton
            variant="ghost"
            onClick={() => {
              setPage(1);
              setUnreadOnly((current) => !current);
            }}
          >
            {unreadOnly ? "Xem tất cả" : "Chỉ tin chưa đọc"}
          </AdminButton>
        }
      />

      <QueryState query={query} loadingLabel="Đang tải tin nhắn" errorMessage="Không tải được tin nhắn">
        {({ data, meta }) =>
          data.items.length === 0 ? (
            <AdminEmpty
              title={unreadOnly ? "Không có tin nào chưa đọc" : "Chưa có tin nhắn nào"}
              description="Tin nhắn gửi từ trang Liên hệ sẽ hiện ở đây."
            />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {data.items.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    onToggleRead={() =>
                      toggleRead.mutate({ id: message.id, isRead: !message.isRead })
                    }
                  />
                ))}
              </div>
              <Pager meta={meta} unit="tin" onPageChange={setPage} />
            </>
          )
        }
      </QueryState>
    </div>
  );
}

function MessageCard({
  message,
  onToggleRead,
}: {
  message: AdminContactMessage;
  onToggleRead: () => void;
}) {
  return (
    <article
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
          onClick={onToggleRead}
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

      <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed">{message.message}</p>

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
  );
}
