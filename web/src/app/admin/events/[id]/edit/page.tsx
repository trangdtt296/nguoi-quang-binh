"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { EventForm } from "@/components/admin/event-form";
import { AdminError, AdminLoading } from "@/components/admin/ui";
import { api, ApiError } from "@/lib/admin/api-client";
import type { AdminEvent } from "@/lib/admin/types";

export default function EditEventPage() {
  return (
    <AdminShell>
      <EditEventContent />
    </AdminShell>
  );
}

function EditEventContent() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<AdminEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<AdminEvent>(`/admin/events/${params.id}`);
      setEvent(data);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được sự kiện này",
      );
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <AdminLoading label="Đang tải sự kiện" />;
  if (error) return <AdminError message={error} onRetry={load} />;
  if (!event) return null;

  return <EventForm key={event.id} event={event} />;
}
