"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { CourseForm } from "@/components/admin/course-form";
import { AdminError, AdminLoading } from "@/components/admin/ui";
import { api, ApiError } from "@/lib/admin/api-client";
import type { AdminCourse } from "@/lib/admin/types";

export default function EditCoursePage() {
  return (
    <AdminShell>
      <EditCourseContent />
    </AdminShell>
  );
}

function EditCourseContent() {
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<AdminCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<AdminCourse>(`/admin/courses/${params.id}`);
      setCourse(data);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được khóa học này",
      );
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <AdminLoading label="Đang tải khóa học" />;
  if (error) return <AdminError message={error} onRetry={load} />;
  if (!course) return null;

  return <CourseForm key={course.id} course={course} />;
}
