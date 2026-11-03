"use client";

import { useCallback } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import clsx from "clsx";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Link2Off,
  ImagePlus,
  Undo2,
  Redo2,
} from "lucide-react";
import { api } from "@/lib/admin/api-client";

/**
 * Trình soạn thảo nội dung.
 *
 * Trả về HTML qua `onChange`. Backend lưu cả HTML (để hiển thị) lẫn JSON
 * (để mở lại chỉnh sửa) — xem docs/04-database.md, cột content và
 * content_html.
 */
export function RichTextEditor({
  value,
  onChange,
  onUploadError,
}: {
  value: string;
  onChange: (html: string) => void;
  onUploadError?: (message: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Image.configure({ inline: false }),
    ],
    content: value,
    // Bắt buộc với Next.js: nếu render ngay lúc dựng trang phía server thì
    // nội dung lệch với phía trình duyệt và React báo lỗi hydrate.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[360px] px-4 py-4 outline-none " +
          "[&_p]:mb-4 [&_p]:text-[16px] [&_p]:leading-[1.7] " +
          "[&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-[22px] [&_h2]:font-semibold " +
          "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[18px] [&_h3]:font-semibold " +
          "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 " +
          "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 " +
          "[&_li]:mb-1.5 " +
          "[&_blockquote]:border-l-2 [&_blockquote]:border-ink [&_blockquote]:pl-4 [&_blockquote]:italic " +
          "[&_a]:underline [&_a]:underline-offset-2 " +
          "[&_img]:my-4 [&_img]:rounded-[8px]",
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập địa chỉ liên kết", previous ?? "https://");
    if (url === null) return;

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  const addImage = useCallback(async () => {
    if (!editor) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const media = await api.upload(file);
        editor.chain().focus().setImage({ src: media.url, alt: file.name }).run();
      } catch (error) {
        onUploadError?.(
          error instanceof Error ? error.message : "Không tải được ảnh lên",
        );
      }
    };

    input.click();
  }, [editor, onUploadError]);

  if (!editor) {
    return (
      <div className="min-h-[420px] rounded-[8px] border border-line bg-surface-alt" />
    );
  }

  return (
    <div className="overflow-hidden rounded-[8px] border border-line bg-surface focus-within:border-ink">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface-alt p-2">
        <ToolButton
          editor={editor}
          label="In đậm"
          icon={Bold}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolButton
          editor={editor}
          label="In nghiêng"
          icon={Italic}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />

        <Divider />

        <ToolButton
          editor={editor}
          label="Tiêu đề lớn"
          icon={Heading2}
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolButton
          editor={editor}
          label="Tiêu đề nhỏ"
          icon={Heading3}
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />

        <Divider />

        <ToolButton
          editor={editor}
          label="Danh sách gạch đầu dòng"
          icon={List}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolButton
          editor={editor}
          label="Danh sách đánh số"
          icon={ListOrdered}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolButton
          editor={editor}
          label="Trích dẫn"
          icon={Quote}
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />

        <Divider />

        <ToolButton
          editor={editor}
          label="Chèn liên kết"
          icon={Link2}
          active={editor.isActive("link")}
          onClick={addLink}
        />
        <ToolButton
          editor={editor}
          label="Bỏ liên kết"
          icon={Link2Off}
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        />
        <ToolButton
          editor={editor}
          label="Chèn ảnh"
          icon={ImagePlus}
          onClick={addImage}
        />

        <Divider />

        <ToolButton
          editor={editor}
          label="Hoàn tác"
          icon={Undo2}
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolButton
          editor={editor}
          label="Làm lại"
          icon={Redo2}
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px bg-line" aria-hidden="true" />;
}

function ToolButton({
  label,
  icon: Icon,
  active,
  disabled,
  onClick,
}: {
  editor: Editor;
  label: string;
  icon: typeof Bold;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={clsx(
        "inline-flex h-9 w-9 items-center justify-center rounded-[6px] transition-colors",
        active ? "bg-ink text-white" : "text-ink hover:bg-primary-50",
        disabled && "cursor-not-allowed opacity-35 hover:bg-transparent",
      )}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}
