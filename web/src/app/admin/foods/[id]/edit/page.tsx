"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { FoodForm } from "@/components/admin/food-form";
import { AdminError, AdminLoading } from "@/components/admin/ui";
import { api, ApiError } from "@/lib/admin/api-client";
import type { AdminFood } from "@/lib/admin/types";

export default function EditFoodPage() {
  return (
    <AdminShell>
      <EditFoodContent />
    </AdminShell>
  );
}

function EditFoodContent() {
  const params = useParams<{ id: string }>();
  const [food, setFood] = useState<AdminFood | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<AdminFood>(`/admin/foods/${params.id}`);
      setFood(data);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được món ăn này",
      );
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <AdminLoading label="Đang tải món ăn" />;
  if (error) return <AdminError message={error} onRetry={load} />;
  if (!food) return null;

  return <FoodForm key={food.id} food={food} />;
}
