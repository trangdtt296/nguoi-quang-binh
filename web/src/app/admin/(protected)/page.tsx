"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { ButtonLink, PageHeader, QueryState, StatusBadge } from "@/components/admin/ui";
import { api } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";
import { formatDate, formatNumber } from "@/lib/format";

interface DashboardStats {
  counts: {
    articles: number;
    destinations: number;
    foods: number;
    events: number;
    categories: number;
    media: number;
    courses: number;
    unreadMessages: number;
    totalViews: number;
  };
  latestArticles: {
    id: string;
    title: string;
    slug: string;
    status: string;
    publishedAt: string | null;
    viewCount: number;
    category: { name: string } | null;
  }[];
  topArticles: { id: string; title: string; slug: string; viewCount: number }[];
  dailyViews: { date: string; views: number }[];
}

export default function DashboardPage() {
  const query = useQuery({
    queryKey: ["/admin/dashboard/stats"],
    queryFn: async () => (await api.get<DashboardStats>("/admin/dashboard/stats")).data,
  });

  return (
    <QueryState query={query} loadingLabel="Đang tải số liệu" errorMessage="Không tải được số liệu">
      {(stats) => <Dashboard stats={stats} />}
    </QueryState>
  );
}

function Dashboard({ stats }: { stats: DashboardStats }) {
  const { user } = useAuth();
  const { counts } = stats;

  const cards = [
    { label: "Bài viết", value: counts.articles, href: "/admin/articles" },
    { label: "Điểm đến", value: counts.destinations, href: "/admin/destinations" },
    { label: "Khóa học", value: counts.courses, href: "/admin/courses" },
    { label: "Ảnh trong thư viện", value: counts.media, href: "/admin/media" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Chào ${firstName(user?.fullName)}`}
        description={
          <>
            {counts.unreadMessages > 0
              ? `Có ${counts.unreadMessages} tin nhắn chưa đọc.`
              : "Không có tin nhắn mới."}{" "}
            Tổng cộng {formatNumber(counts.totalViews)} lượt xem.
          </>
        }
        actions={
          <ButtonLink href="/admin/articles/new">
            <Plus size={16} aria-hidden="true" />
            Soạn bài mới
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-[12px] border border-line bg-surface p-5 transition-colors hover:border-ink"
          >
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.05em] text-muted">
              {card.label}
            </p>
            <p className="mt-2.5 text-[30px] font-bold leading-none">
              {formatNumber(card.value)}
            </p>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-6">
        <section className="min-w-0 flex-[999_1_460px] rounded-[12px] border border-line bg-surface p-6">
          <h2 className="mb-5 text-[16.5px] font-semibold">Lượt xem 30 ngày qua</h2>
          <ViewsChart data={stats.dailyViews} />
        </section>

        <section className="min-w-0 flex-1 basis-[300px] rounded-[12px] border border-line bg-surface p-6">
          <h2 className="mb-4 text-[16.5px] font-semibold">Xem nhiều nhất</h2>
          {stats.topArticles.length ? (
            <ol className="flex flex-col gap-4">
              {stats.topArticles.map((item, index) => (
                <li key={item.id} className="flex items-baseline gap-3">
                  <span className="min-w-[18px] text-[13px] font-bold text-muted">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14.5px] font-medium leading-snug">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-[12.5px] text-muted">
                      {formatNumber(item.viewCount)} lượt xem
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-[14px] text-muted">Chưa có dữ liệu lượt xem.</p>
          )}
        </section>
      </div>

      <section className="rounded-[12px] border border-line bg-surface p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[16.5px] font-semibold">Bài viết mới nhất</h2>
          <Link
            href="/admin/articles"
            className="text-[14px] font-semibold underline underline-offset-4"
          >
            Xem tất cả
          </Link>
        </div>

        {stats.latestArticles.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse">
              <thead>
                <tr>
                  {["Tiêu đề", "Chuyên mục", "Trạng thái", "Ngày đăng", "Lượt xem"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="pb-3 pr-4 text-left text-[12.5px] font-semibold uppercase tracking-[0.05em] text-muted"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {stats.latestArticles.map((item) => (
                  <tr key={item.id}>
                    <td className="border-t border-line py-3.5 pr-4 text-[14.5px] font-medium">
                      <Link
                        href={`/admin/articles/${item.id}/edit`}
                        className="hover:underline"
                      >
                        {item.title}
                      </Link>
                    </td>
                    <td className="border-t border-line py-3.5 pr-4 text-[14.5px] text-muted">
                      {item.category?.name ?? "—"}
                    </td>
                    <td className="border-t border-line py-3.5 pr-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="border-t border-line py-3.5 pr-4 text-[14.5px] text-muted">
                      {item.publishedAt ? formatDate(item.publishedAt) : "—"}
                    </td>
                    <td className="border-t border-line py-3.5 text-[14.5px] text-muted">
                      {item.viewCount ? formatNumber(item.viewCount) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[14px] text-muted">Chưa có bài viết nào.</p>
        )}
      </section>
    </div>
  );
}

/**
 * Biểu đồ cột vẽ bằng div.
 *
 * Không dùng thư viện biểu đồ: một biểu đồ cột đơn giản không đáng để thêm
 * vài trăm kB vào bundle, và tự vẽ thì khớp bảng màu sẵn.
 */
function ViewsChart({ data }: { data: { date: string; views: number }[] }) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-[14px] text-muted">
        Chưa có lượt xem nào được ghi nhận.
      </p>
    );
  }

  const max = Math.max(...data.map((row) => row.views), 1);
  // Nhiều cột quá thì nhãn chen nhau; chỉ hiện nhãn thưa ra.
  const labelEvery = Math.ceil(data.length / 8);

  return (
    <div className="flex h-[180px] items-end gap-1.5">
      {data.map((row, index) => {
        const height = Math.max((row.views / max) * 100, 2);
        const label = new Date(row.date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          timeZone: "Asia/Ho_Chi_Minh",
        });

        return (
          <div
            key={row.date}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            title={`${label}: ${formatNumber(row.views)} lượt xem`}
          >
            <div
              className="w-full rounded-t-[4px] bg-primary-500"
              style={{ height: `${height}%` }}
            />
            <span className="h-4 text-[11px] text-muted">
              {index % labelEvery === 0 ? label : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function firstName(fullName?: string): string {
  if (!fullName) return "bạn";
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1];
}
