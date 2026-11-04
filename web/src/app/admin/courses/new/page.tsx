"use client";

import { AdminShell } from "@/components/admin/shell";
import { CourseForm } from "@/components/admin/course-form";

export default function NewCoursePage() {
  return (
    <AdminShell>
      <CourseForm />
    </AdminShell>
  );
}
