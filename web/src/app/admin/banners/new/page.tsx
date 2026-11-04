"use client";

import { AdminShell } from "@/components/admin/shell";
import { BannerForm } from "@/components/admin/banner-form";

export default function NewBannerPage() {
  return (
    <AdminShell>
      <BannerForm />
    </AdminShell>
  );
}
