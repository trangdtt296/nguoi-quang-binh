"use client";

import { AdminShell } from "@/components/admin/shell";
import { ArticleForm } from "@/components/admin/article-form";

export default function NewArticlePage() {
  return (
    <AdminShell>
      <ArticleForm />
    </AdminShell>
  );
}
