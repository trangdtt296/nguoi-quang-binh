"use client";

import { AdminShell } from "@/components/admin/shell";
import { FoodForm } from "@/components/admin/food-form";

export default function NewFoodPage() {
  return (
    <AdminShell>
      <FoodForm />
    </AdminShell>
  );
}
