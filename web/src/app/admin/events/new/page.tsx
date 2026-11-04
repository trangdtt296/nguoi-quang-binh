"use client";

import { AdminShell } from "@/components/admin/shell";
import { EventForm } from "@/components/admin/event-form";

export default function NewEventPage() {
  return (
    <AdminShell>
      <EventForm />
    </AdminShell>
  );
}
