"use client";

import { ResourceEditor } from "@/components/admin/resource-editor";
import { DestinationForm } from "@/components/admin/destination-form";
import type { AdminDestination } from "@/lib/admin/types";

export default function EditDestinationPage() {
  return (
    <ResourceEditor<AdminDestination> endpoint="/admin/destinations" noun="điểm đến">
      {(destination) => <DestinationForm key={destination.id} destination={destination} />}
    </ResourceEditor>
  );
}
