"use client";

import { ResourceEditor } from "@/components/admin/resource-editor";
import { BannerForm } from "@/components/admin/banner-form";
import type { AdminBanner } from "@/lib/admin/types";

export default function EditBannerPage() {
  return (
    <ResourceEditor<AdminBanner> endpoint="/admin/banners" noun="banner">
      {(banner) => <BannerForm key={banner.id} banner={banner} />}
    </ResourceEditor>
  );
}
