"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { BannerForm } from "@/components/admin/banner-form";
import { AdminError, AdminLoading } from "@/components/admin/ui";
import { api, ApiError } from "@/lib/admin/api-client";
import type { AdminBanner } from "@/lib/admin/types";

export default function EditBannerPage() {
  return (
    <AdminShell>
      <EditBannerContent />
    </AdminShell>
  );
}

function EditBannerContent() {
  const params = useParams<{ id: string }>();
  const [banner, setBanner] = useState<AdminBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<AdminBanner>(`/admin/banners/${params.id}`);
      setBanner(data);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được banner này",
      );
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <AdminLoading label="Đang tải banner" />;
  if (error) return <AdminError message={error} onRetry={load} />;
  if (!banner) return null;

  return <BannerForm key={banner.id} banner={banner} />;
}
