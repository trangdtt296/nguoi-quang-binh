"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Trash2,
  Video,
  X,
} from "lucide-react";
import {
  AdminButton,
  AdminEmpty,
  AdminError,
  AdminLoading,
  ConfirmDialog,
  Field,
  StatusBadge,
  Toast,
  inputClass,
  textareaClass,
  useToast,
} from "./ui";
import { RichTextEditor } from "./rich-text-editor";
import { api, ApiError } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";
import type { AdminLesson, ContentStatus } from "@/lib/admin/types";

/**
 * Quản lý bài học của một khóa học.
 *
 * Bài học là bản ghi Article với type = "lesson", nhưng người dùng không nên
 * phải hiểu điều đó: họ thêm và sắp xếp bài ngay trong khóa học. Vì vậy phần
 * này có form riêng gọn hơn form bài viết, chỉ những trường bài học cần.
 */
export function CourseLessons({ courseId }: { courseId: string }) {
  const { isAdmin } = useAuth();
  const { toast, showSuccess, showError, dismiss } = useToast();

  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<AdminLesson | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AdminLesson | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<AdminLesson[]>(
        `/admin/courses/${courseId}/lessons`,
      );
      setLessons(data);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Không tải được danh sách bài",
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Gửi thứ tự mới lên server; cũng là chỗ cập nhật lại số bài của khóa. */
  const persistOrder = async (ordered: AdminLesson[]) => {
    setSavingOrder(true);
    try {
      await api.patch(`/admin/courses/${courseId}/reorder`, {
        lessonIds: ordered.map((lesson) => lesson.id),
      });
      await load();
    } catch (caught) {
      showError(
        caught instanceof ApiError ? caught.message : "Không lưu được thứ tự bài",
      );
      await load();
    } finally {
      setSavingOrder(false);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= lessons.length) return;

    const next = [...lessons];
    [next[index], next[target]] = [next[target], next[index]];
    // Đổi chỗ ngay trên giao diện để không phải chờ server, rồi mới lưu.
    setLessons(next);
    void persistOrder(next);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await api.del(`/admin/articles/${deleting.id}`);
      const remaining = lessons.filter((lesson) => lesson.id !== deleting.id);
      setDeleting(null);
      showSuccess(`Đã chuyển bài "${deleting.title}" vào thùng rác`);
      await persistOrder(remaining);
    } catch (caught) {
      showError(caught instanceof ApiError ? caught.message : "Không xóa được bài");
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold">Bài học</h2>
          <p className="mt-1 max-w-[70ch] text-[14px] leading-relaxed text-muted">
            Thứ tự ở đây chính là thứ tự người học thấy trên website. Mỗi bài có thể
            kèm video, không bắt buộc.
          </p>
        </div>
        <AdminButton onClick={() => setCreating(true)} disabled={savingOrder}>
          <Plus size={16} aria-hidden="true" />
          Thêm bài học
        </AdminButton>
      </div>

      {loading ? (
        <AdminLoading label="Đang tải bài học" />
      ) : error ? (
        <AdminError message={error} onRetry={load} />
      ) : lessons.length === 0 ? (
        <AdminEmpty
          title="Khóa học chưa có bài nào"
          description="Thêm bài đầu tiên để khóa học có nội dung."
          action={
            <AdminButton onClick={() => setCreating(true)}>
              <Plus size={16} aria-hidden="true" />
              Thêm bài học
            </AdminButton>
          }
        />
      ) : (
        <ol className="flex flex-col gap-2">
          {lessons.map((lesson, index) => (
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
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || savingOrder}
                  title="Chuyển lên"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink disabled:opacity-40"
                >
                  <ArrowUp size={15} aria-hidden="true" />
                  <span className="sr-only">Chuyển bài {lesson.title} lên</span>
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === lessons.length - 1 || savingOrder}
                  title="Chuyển xuống"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink disabled:opacity-40"
                >
                  <ArrowDown size={15} aria-hidden="true" />
                  <span className="sr-only">Chuyển bài {lesson.title} xuống</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(lesson)}
                  title="Sửa bài"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
                >
                  <Pencil size={15} aria-hidden="true" />
                  <span className="sr-only">Sửa bài {lesson.title}</span>
                </button>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => setDeleting(lesson)}
                    title="Chuyển bài vào thùng rác"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-50 hover:text-ink"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    <span className="sr-only">Xóa bài {lesson.title}</span>
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}

      {creating || editing ? (
        <LessonDialog
          courseId={courseId}
          lesson={editing}
          nextOrder={lessons.length + 1}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={async (message) => {
            setCreating(false);
            setEditing(null);
            showSuccess(message);
            await load();
          }}
          onError={showError}
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
        loading={deletePending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={dismiss} />
      ) : null}
    </div>
  );
}

function LessonDialog({
  courseId,
  lesson,
  nextOrder,
  onClose,
  onSaved,
  onError,
}: {
  courseId: string;
  lesson: AdminLesson | null;
  /** Thứ tự gán cho bài mới — xếp cuối danh sách hiện tại. */
  nextOrder: number;
  onClose: () => void;
  onSaved: (message: string) => void | Promise<void>;
  onError: (message: string) => void;
}) {
  const { isAdmin } = useAuth();

  const [title, setTitle] = useState(lesson?.title ?? "");
  const [excerpt, setExcerpt] = useState(lesson?.excerpt ?? "");
  const [contentHtml, setContentHtml] = useState(lesson?.contentHtml ?? "");
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? "");
  const [durationMinutes, setDurationMinutes] = useState(
    lesson?.durationMinutes != null ? String(lesson.durationMinutes) : "",
  );
  const [status, setStatus] = useState<ContentStatus>(lesson?.status ?? "draft");

  const [titleError, setTitleError] = useState("");
  const [videoError, setVideoError] = useState("");
  const [durationError, setDurationError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    let invalid = false;

    if (title.trim().length < 3) {
      setTitleError("Tiêu đề bài phải dài ít nhất 3 ký tự");
      invalid = true;
    }

    if (videoUrl.trim()) {
      try {
        new URL(videoUrl.trim());
      } catch {
        setVideoError("Đường dẫn video không hợp lệ, cần dạng https://…");
        invalid = true;
      }
    }

    const duration = durationMinutes.trim();
    if (duration) {
      const parsed = Number(duration);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 600) {
        setDurationError("Thời lượng phải là số nguyên từ 1 đến 600 phút");
        invalid = true;
      }
    }

    if (invalid) return;

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        contentHtml: contentHtml || null,
        content: {},
        type: "lesson" as const,
        courseId,
        videoUrl: videoUrl.trim() || null,
        durationMinutes: duration ? Number(duration) : null,
        status,
      };

      if (lesson) {
        await api.patch(`/admin/articles/${lesson.id}`, payload);
        await onSaved("Đã lưu bài học");
      } else {
        await api.post("/admin/articles", { ...payload, lessonOrder: nextOrder });
        await onSaved("Đã thêm bài học");
      }
    } catch (caught) {
      if (caught instanceof ApiError && caught.details?.length) {
        onError(
          `${caught.message}: ${caught.details.map((d) => d.message).join(", ")}`,
        );
      } else {
        onError(caught instanceof ApiError ? caught.message : "Không lưu được bài");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-abyss/60 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        noValidate
        onClick={(event) => event.stopPropagation()}
        className="my-8 flex w-full max-w-[720px] flex-col gap-5 rounded-[12px] bg-surface p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[19px] font-semibold">
            {lesson ? "Sửa bài học" : "Thêm bài học"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] text-muted hover:bg-primary-50 hover:text-ink"
          >
            <X size={18} aria-hidden="true" />
            <span className="sr-only">Đóng</span>
          </button>
        </div>

        <Field label="Tiêu đề bài" htmlFor="lesson-title" error={titleError} required>
          <input
            id="lesson-title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setTitleError("");
            }}
            aria-invalid={Boolean(titleError)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Mô tả ngắn"
          htmlFor="lesson-excerpt"
          hint="Một hai câu giới thiệu bài này học gì."
        >
          <textarea
            id="lesson-excerpt"
            rows={2}
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            className={textareaClass}
          />
        </Field>

        <div className="flex flex-wrap gap-5">
          <div className="min-w-[240px] flex-[2]">
            <Field
              label="Đường dẫn video"
              htmlFor="lesson-video-url"
              error={videoError}
              hint="Dán link YouTube hoặc Vimeo. Để trống nếu bài chỉ có chữ."
            >
              <input
                id="lesson-video-url"
                value={videoUrl}
                onChange={(event) => {
                  setVideoUrl(event.target.value);
                  setVideoError("");
                }}
                placeholder="https://www.youtube.com/watch?v=…"
                aria-invalid={Boolean(videoError)}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="min-w-[140px] flex-1">
            <Field
              label="Thời lượng (phút)"
              htmlFor="lesson-duration"
              error={durationError}
            >
              <input
                id="lesson-duration"
                inputMode="numeric"
                value={durationMinutes}
                onChange={(event) => {
                  setDurationMinutes(event.target.value);
                  setDurationError("");
                }}
                aria-invalid={Boolean(durationError)}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[14px] font-semibold">Nội dung bài</p>
          <RichTextEditor value={contentHtml} onChange={setContentHtml} />
        </div>

        <Field label="Trạng thái" htmlFor="lesson-status">
          <select
            id="lesson-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ContentStatus)}
            className={inputClass}
          >
            <option value="draft">Bản nháp</option>
            {isAdmin ? (
              <>
                <option value="published">Xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </>
            ) : null}
          </select>
        </Field>

        <div className="flex justify-end gap-3">
          <AdminButton variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </AdminButton>
          <AdminButton type="submit" loading={saving}>
            {lesson ? "Lưu bài học" : "Thêm bài học"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
