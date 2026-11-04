"use client";

import { AdminShell } from "@/components/admin/shell";
import { DestinationForm } from "@/components/admin/destination-form";

export default function NewDestinationPage() {
  return (
    <AdminShell>
      <DestinationForm />
    </AdminShell>
  );
}
