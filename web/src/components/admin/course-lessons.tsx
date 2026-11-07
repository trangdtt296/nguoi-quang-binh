"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Video } from "lucide-react";
import {
  AdminButton,
  AdminEmpty,
  ConfirmDialog,
  DialogHeader,
  IconButton,
  Modal,
  QueryState,
  StatusBadge,
  useToast,
} from "./ui";
import { AdminForm, FormInput, FormRichText, FormSelect, FormTextarea } from "./form-fields";
import { api } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";
import {
  CONTENT_STATUSES,
  optionalNumber,
  optionalUrl,
  orNull,
  requiredText,
  text,
  toNumberOrNull,
  type FieldLimits,
} from "@/lib/admin/form-utils";
import { queryKeys } from "@/lib/admin/queries";
import { FIELD_LIMITS as F } from "@/lib/field-limits";
import type { AdminLesson } from "@/lib/admin/types";
import { swap } from "@/lib/array";
import { getErrorMessage } from "@/lib/http";

/**
 * Quản lý bài học của một khóa học.
 *
 * Bài học là bản ghi Article với type = "lesson", nhưng người dùng không nên
 * phải hiểu điều đó: họ thêm và sắp xếp bài ngay trong khóa học. Vì vậy phần
 * này có form riêng gọn hơn form bài viết, chỉ những trường bài học cần.
 */

/** Đổi bài học cũng đổi số bài của khóa và nội dung thùng rác bài viết. */
function useInvalidateLessons() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.resource("/admin/courses") }),
      queryClient.invalidateQueries({ queryKey: queryKeys.resource("/admin/articles") }),
    ]);
}

export function CourseLessons({ courseId }: { courseId: string }) {
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateLessons();

  const [dialog, setDialog] = useState<{ lesson: AdminLesson | null } | null>(null);
  const [deleting, setDeleting] = useState<AdminLesson | null>(null);

  const lessonsKey = ["/admin/courses", courseId, "lessons"];
  const query = useQuery({
    queryKey: lessonsKey,
    queryFn: async () =>
      (await api.get<AdminLesson[]>(`/admin/courses/${courseId}/lessons`)).data,
  });
  const lessons = query.data ?? [];

  /** Gửi thứ tự mới lên server; cũng là chỗ server cập nhật lại số bài của khóa. */
  const reorder = useMutation({
    mutationFn: (ordered: AdminLesson[]) =>
      api.patch(`/admin/courses/${courseId}/reorder`, {
        lessonIds: ordered.map((lesson) => lesson.id),
      }),
    // Đổi chỗ ngay trên giao diện để không phải chờ server.
    onMutate: async (ordered) => {
      await queryClient.cancelQueries({ queryKey: lessonsKey });
      queryClient.setQueryData(lessonsKey, ordered);
    },
    onError: (error) => showError(getErrorMessage(error, "Không lưu được thứ tự bài")),
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: (lesson: AdminLesson) => api.del(`/admin/articles/${lesson.id}`),
    onSuccess: (_data, lesson) => {
      showSuccess(`Đã chuyển bài "${lesson.title}" vào thùng rác`);
      setDeleting(null);
      // Đánh lại số thứ tự cho các bài còn lại.
      reorder.mutate(lessons.filter((item) => item.id !== lesson.id));
    },
    onError: (error) => showError(getErrorMessage(error, "Không xóa được bài")),
  });

  const move = (index: number, target: number) => {
    if (target < 0 || target >= lessons.length) return;
    reorder.mutate(swap(lessons, index, target));
  };

  const addButton = (
    <AdminButton onClick={() => setDialog({ lesson: null })} disabled={reorder.isPending}>
      <Plus size={16} aria-hidden="true" />
      Thêm bài học
    </AdminButton>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold">Bài học</h2>
          <p className="mt-1 max-w-[70ch] text-[14px] leading-relaxed text-muted">
            Thứ tự ở đây chính là thứ tự người học thấy trên website. Mỗi bài có thể kèm
            video, không bắt buộc.
          </p>
        </div>
        {addButton}
      </div>

      <QueryState query={query} loadingLabel="Đang tải bài học" errorMessage="Không tải được danh sách bài">
        {(items) =>
          items.length === 0 ? (
            <AdminEmpty
              title="Khóa học chưa có bài nào"
              description="Thêm bài đầu tiên để khóa học có nội dung."
              action={addButton}
            />
          ) : (
            <ol className="flex flex-col gap-2">
              {items.map((lesson, index) => (
                <li
                  key={lesson.id}
                  className="flex flex-wrap items-center gap-3 rounded-[8px] border border-line bg-surface px-4 py-3"
                >
                  <span className="w-7 shrink-0 text-[14px] font-semibold text-muted">
                    {index + 1}.
                  </span>

                  <span className="min-w-[180px] flex-1 text-[14.5px] font-medium">
                    {lesson.title}
                    {lesson.videoUrl ? (
                      <Video
                        size={14}
                        className="ml-2 inline-block align-[-2px] text-muted"
                        aria-label="Có video"
                      />
                    ) : null}
                    {lesson.durationMinutes ? (
                      <span className="ml-2 text-[13px] font-normal text-muted">
                        {lesson.durationMinutes} phút
                      </span>
                    ) : null}
                  </span>

                  <StatusBadge status={lesson.status} />

                  <div className="flex shrink-0 gap-1">
                    <IconButton
                      label={`Chuyển bài ${lesson.title} lên`}
                      title="Chuyển lên"
                      disabled={index === 0 || reorder.isPending}
                      onClick={() => move(index, index - 1)}
                    >
                      <ArrowUp size={15} aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label={`Chuyển bài ${lesson.title} xuống`}
                      title="Chuyển xuống"
                      disabled={index === items.length - 1 || reorder.isPending}
                      onClick={() => move(index, index + 1)}
                    >
                      <ArrowDown size={15} aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label={`Sửa bài ${lesson.title}`}
                      title="Sửa bài"
                      onClick={() => setDialog({ lesson })}
                    >
                      <Pencil size={15} aria-hidden="true" />
                    </IconButton>
                    {isAdmin ? (
                      <IconButton
                        label={`Xóa bài ${lesson.title}`}
                        title="Chuyển bài vào thùng rác"
                        onClick={() => setDeleting(lesson)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </IconButton>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )
        }
      </QueryState>

      {dialog ? (
        <LessonDialog
          courseId={courseId}
          lesson={dialog.lesson}
          nextOrder={lessons.length + 1}
          onClose={() => setDialog(null)}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Chuyển bài này vào thùng rác?"
        description={
          deleting
            ? `Bài "${deleting.title}" sẽ biến khỏi khóa học nhưng vẫn khôi phục được từ mục Thùng rác.`
            : ""
        }
        confirmLabel="Chuyển vào thùng rác"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

/* ---------- Hộp thoại thêm / sửa bài ---------- */

/** Bài học là bài viết type = lesson: giới hạn theo articleCreateSchema ở server. */
const LESSON_LIMITS = {
  title: F.lessonTitle,
  excerpt: F.summary,
} satisfies FieldLimits;

const lessonSchema = z.object({
  title: requiredText("Tiêu đề bài phải dài ít nhất 3 ký tự", LESSON_LIMITS.title),
  excerpt: text(LESSON_LIMITS.excerpt),
  contentHtml: z.string(),
  videoUrl: optionalUrl("Đường dẫn video không hợp lệ, cần dạng https://…"),
  durationMinutes: optionalNumber({
    min: 1,
    max: 600,
    integer: true,
    message: "Thời lượng phải là số nguyên từ 1 đến 600 phút",
  }),
  status: z.enum(CONTENT_STATUSES),
});

type LessonValues = z.infer<typeof lessonSchema>;

function LessonDialog({
  courseId,
  lesson,
  nextOrder,
  onClose,
}: {
  courseId: string;
  lesson: AdminLesson | null;
  /** Thứ tự gán cho bài mới — xếp cuối danh sách hiện tại. */
  nextOrder: number;
  onClose: () => void;
}) {
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const invalidate = useInvalidateLessons();

  const form = useForm<LessonValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title ?? "",
      excerpt: lesson?.excerpt ?? "",
      contentHtml: lesson?.contentHtml ?? "",
      videoUrl: lesson?.videoUrl ?? "",
      durationMinutes: lesson?.durationMinutes != null ? String(lesson.durationMinutes) : "",
      status: lesson?.status ?? "draft",
    },
  });

  const save = useMutation({
    mutationFn: (values: LessonValues) => {
      const payload = {
        title: values.title,
        excerpt: orNull(values.excerpt),
        contentHtml: orNull(values.contentHtml),
        content: {},
        type: "lesson" as const,
        courseId,
        videoUrl: orNull(values.videoUrl),
        durationMinutes: toNumberOrNull(values.durationMinutes),
        status: values.status,
      };
      return lesson
        ? api.patch(`/admin/articles/${lesson.id}`, payload)
        : api.post("/admin/articles", { ...payload, lessonOrder: nextOrder });
    },
    onSuccess: async () => {
      showSuccess(lesson ? "Đã lưu bài học" : "Đã thêm bài học");
      onClose();
      await invalidate();
    },
    onError: (error) => showError(getErrorMessage(error, "Không lưu được bài")),
  });

  const statusOptions = [
    { value: "draft", label: "Bản nháp" },
    ...(isAdmin
      ? [
          { value: "published", label: "Xuất bản" },
          { value: "archived", label: "Lưu trữ" },
        ]
      : []),
  ];

  return (
    <Modal onClose={onClose} labelledBy="lesson-dialog-title" align="top" className="max-w-[720px]">
      <AdminForm
        form={form}
        idPrefix="lesson"
        limits={LESSON_LIMITS}
        onSubmit={(values) => save.mutate(values)}
        className="flex flex-col gap-5"
      >
        <DialogHeader
          id="lesson-dialog-title"
          title={lesson ? "Sửa bài học" : "Thêm bài học"}
          onClose={onClose}
        />

        <FormInput name="title" label="Tiêu đề bài" required />
        <FormTextarea
          name="excerpt"
          label="Mô tả ngắn"
          rows={2}
          hint="Một hai câu giới thiệu bài này học gì."
        />

        <div className="flex flex-wrap gap-5">
          <div className="min-w-[240px] flex-[2]">
            <FormInput
              name="videoUrl"
              label="Đường dẫn video"
              placeholder="https://www.youtube.com/watch?v=…"
              hint="Dán link YouTube hoặc Vimeo. Để trống nếu bài chỉ có chữ."
            />
          </div>
          <div className="min-w-[140px] flex-1">
            <FormInput
              name="durationMinutes"
              label="Thời lượng (phút)"
              inputMode="numeric"
              maxLength={3}
              hint="Từ 1 đến 600 phút."
            />
          </div>
        </div>

        <FormRichText name="contentHtml" label="Nội dung bài" />
        <FormSelect name="status" label="Trạng thái" options={statusOptions} />

        <div className="flex justify-end gap-3">
          <AdminButton variant="ghost" onClick={onClose} disabled={save.isPending}>
            Hủy
          </AdminButton>
          <AdminButton type="submit" loading={save.isPending}>
            {lesson ? "Lưu bài học" : "Thêm bài học"}
          </AdminButton>
        </div>
      </AdminForm>
    </Modal>
  );
}
