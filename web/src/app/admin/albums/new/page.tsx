"use client";

import { AdminShell } from "@/components/admin/shell";
import { AlbumForm } from "@/components/admin/album-form";

export default function NewAlbumPage() {
  return (
    <AdminShell>
      <AlbumForm />
    </AdminShell>
  );
}
