"use client";

import { ResourceEditor } from "@/components/admin/resource-editor";
import { CourseForm } from "@/components/admin/course-form";
import type { AdminCourse } from "@/lib/admin/types";

export default function EditCoursePage() {
  return (
    <ResourceEditor<AdminCourse> endpoint="/admin/courses" noun="khóa học">
      {(course) => <CourseForm key={course.id} course={course} />}
    </ResourceEditor>
  );
}
