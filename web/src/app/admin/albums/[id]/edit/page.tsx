"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { AlbumForm } from "@/components/admin/album-form";
import { AdminError, AdminLoading } from "@/components/admin/ui";
import { api, ApiError } from "@/lib/admin/api-client";
import type { AdminAlbum } from "@/lib/admin/types";

export default function EditAlbumPage() {
  return (
    <AdminShell>
      <EditAlbumContent />
    </AdminShell>
  );
}

function EditAlbumContent() {
  const params = useParams<{ id: string }>();
  const [album, setAlbum] = useState<AdminAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<AdminAlbum>(`/admin/albums/${params.id}`);
      setAlbum(data);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Không tải được album này");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <AdminLoading label="Đang tải album" />;
  if (error) return <AdminError message={error} onRetry={load} />;
  if (!album) return null;

  return <AlbumForm key={album.id} album={album} />;
}
