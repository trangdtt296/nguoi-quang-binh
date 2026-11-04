"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { DestinationForm } from "@/components/admin/destination-form";
import { AdminError, AdminLoading } from "@/components/admin/ui";
import { api, ApiError } from "@/lib/admin/api-client";
import type { AdminDestination } from "@/lib/admin/types";

export default function EditDestinationPage() {
  return (
    <AdminShell>
      <EditDestinationContent />
    </AdminShell>
  );
}

function EditDestinationContent() {
  const params = useParams<{ id: string }>();
  const [destination, setDestination] = useState<AdminDestination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<AdminDestination>(
        `/admin/destinations/${params.id}`,
      );
      setDestination(data);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được điểm đến này",
      );
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <AdminLoading label="Đang tải điểm đến" />;
  if (error) return <AdminError message={error} onRetry={load} />;
  if (!destination) return null;

  return <DestinationForm key={destination.id} destination={destination} />;
}
