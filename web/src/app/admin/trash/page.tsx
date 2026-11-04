"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { RotateCcw } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import {
  AdminButton,
  AdminEmpty,
  AdminError,
  AdminLoading,
  Toast,
  useToast,
} from "@/components/admin/ui";
import { api, ApiError } from "@/lib/admin/api-client";
import { formatDate } from "@/lib/format";

/** Các loại nội dung có thùng rác, cùng tên gọi hiển thị. */
const RESOURCES = [
  { key: "articles", label: "Bài viết", titleField: "title" },
  { key: "destinations", label: "Điểm đến", titleField: "name" },
  { key: "foods", label: "Ẩm thực", titleField: "name" },
  { key: "events", label: "Sự kiện", titleField: "name" },
  { key: "courses", label: "Khóa học", titleField: "title" },
  { key: "albums", label: "Album ảnh", titleField: "title" },
] as const;

type ResourceKey = (typeof RESOURCES)[number]["key"];

interface TrashItem {
  id: string;
  title?: string;
  name?: string;
  deletedAt: string | null;
  updatedAt: string;
}

export default function TrashPage() {
  return (
    <AdminShell>
      <TrashContent />
    </AdminShell>
  );
}

function TrashContent() {
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [active, setActive] = useState<ResourceKey>("articles");
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restoring, setRestoring] = useState<string | null>(null);

  const resource = RESOURCES.find((r) => r.key === active)!;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<TrashItem[]>(
        `/admin/${active}?trash=true&limit=50`,
      );
      setItems(data);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được thùng rác",
      );
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    void load();
  }, [load]);

  const restore = async (item: TrashItem) => {
    const label = item.title ?? item.name ?? "Nội dung";
    setRestoring(item.id);
    try {
      await api.post(`/admin/${active}/${item.id}/restore`);
      showSuccess(`Đã khôi phục "${label}"`);
      await load();
    } catch (caught) {
      showError(
        caught instanceof ApiError ? caught.message : "Không khôi phục được",
      );
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-bold">Thùng rác</h1>
        <p className="mt-1.5 max-w-[70ch] text-[14.5px] text-muted">
          Nội dung đã xóa vẫn nằm trong database, chỉ bị ẩn khỏi website. Khôi
          phục là nó trở lại đúng trạng thái trước khi xóa.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-line">
        {RESOURCES.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActive(item.key)}
            aria-current={active === item.key ? "true" : undefined}
            className={clsx(
              "min-h-11 border-b-2 px-4 text-[14.5px] font-semibold transition-colors",
              active === item.key
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <AdminLoading />
      ) : error ? (
        <AdminError message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <AdminEmpty
          title={`Không có ${resource.label.toLowerCase()} nào trong thùng rác`}
          description="Nội dung bị xóa sẽ xuất hiện ở đây."
        />
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-line bg-surface">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-alt">
                <th className="px-4 py-3 text-left text-[12.5px] font-semibold uppercase tracking-[0.05em] text-muted">
                  Tên
                </th>
                <th className="px-4 py-3 text-left text-[12.5px] font-semibold uppercase tracking-[0.05em] text-muted">
                  Ngày xóa
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <td className="px-4 py-3.5 text-[14.5px] font-medium">
                    {item.title ?? item.name ?? "Không tên"}
                  </td>
                  <td className="px-4 py-3.5 text-[14px] text-muted">
                    {item.deletedAt ? formatDate(item.deletedAt) : "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end">
                      <AdminButton
                        variant="ghost"
                        loading={restoring === item.id}
                        onClick={() => restore(item)}
                      >
                        <RotateCcw size={15} aria-hidden="true" />
                        Khôi phục
                      </AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-muted">
        Hiện chưa có chức năng xóa vĩnh viễn. Nội dung nằm trong thùng rác không
        chiếm chỗ đáng kể, và giữ lại thì còn khôi phục được khi lỡ tay.
      </p>

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={dismiss} />
      ) : null}
    </div>
  );
}
