"use client";

import { ResourceEditor } from "@/components/admin/resource-editor";
import { ArticleForm } from "@/components/admin/article-form";
import type { AdminArticle } from "@/lib/admin/types";

export default function EditArticlePage() {
  return (
    <ResourceEditor<AdminArticle> endpoint="/admin/articles" noun="bài viết">
      {(article) => <ArticleForm key={article.id} article={article} />}
    </ResourceEditor>
  );
}
