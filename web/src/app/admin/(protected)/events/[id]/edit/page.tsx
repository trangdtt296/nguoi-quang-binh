"use client";

import { ResourceEditor } from "@/components/admin/resource-editor";
import { EventForm } from "@/components/admin/event-form";
import type { AdminEvent } from "@/lib/admin/types";

export default function EditEventPage() {
  return (
    <ResourceEditor<AdminEvent> endpoint="/admin/events" noun="sự kiện">
      {(event) => <EventForm key={event.id} event={event} />}
    </ResourceEditor>
  );
}
