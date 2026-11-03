"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { ArticleForm } from "@/components/admin/article-form";
import { AdminError, AdminLoading } from "@/components/admin/ui";
import { api, ApiError } from "@/lib/admin/api-client";
import type { AdminArticle } from "@/lib/admin/types";

export default function EditArticlePage() {
  return (
    <AdminShell>
      <EditArticleContent />
    </AdminShell>
  );
}

function EditArticleContent() {
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<AdminArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<AdminArticle>(`/admin/articles/${params.id}`);
      setArticle(data);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Không tải được bài viết này",
      );
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <AdminLoading label="Đang tải bài viết" />;
  if (error) return <AdminError message={error} onRetry={load} />;
  if (!article) return null;

  // key buộc form dựng lại từ đầu khi chuyển sang bài khác, tránh giữ lại
  // dữ liệu của bài trước trong state.
  return <ArticleForm key={article.id} article={article} />;
}
