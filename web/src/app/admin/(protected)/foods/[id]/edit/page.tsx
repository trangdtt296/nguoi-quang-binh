"use client";

import { ResourceEditor } from "@/components/admin/resource-editor";
import { FoodForm } from "@/components/admin/food-form";
import type { AdminFood } from "@/lib/admin/types";

export default function EditFoodPage() {
  return (
    <ResourceEditor<AdminFood> endpoint="/admin/foods" noun="món ăn">
      {(food) => <FoodForm key={food.id} food={food} />}
    </ResourceEditor>
  );
}
