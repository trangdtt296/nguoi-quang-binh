import clsx from "clsx";

/**
 * Hiển thị nội dung HTML do CMS sinh ra.
 *
 * Kiểu chữ đặt ở đây một chỗ, nên mọi bài viết, món ăn, bài học đều đọc
 * giống nhau. Dùng selector con thay vì bắt CMS gắn class vào từng thẻ.
 *
 * Lưu ý bảo mật: `html` phải là nội dung do quản trị viên soạn trong CMS,
 * không bao giờ là nội dung người dùng gửi lên. Giai đoạn 4 sẽ làm sạch
 * HTML ngay ở bước lưu, trước khi vào database.
 */
export function Prose({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={clsx(
        "prose-body",
        "[&_p]:mb-5 [&_p]:text-[17px] [&_p]:leading-[1.75] [&_p]:text-[#2a3036]",
        "[&_h2]:mt-9 [&_h2]:mb-3.5 [&_h2]:text-[24px] [&_h2]:font-semibold [&_h2]:tracking-[-0.01em]",
        "[&_h3]:mt-7 [&_h3]:mb-3 [&_h3]:text-[19px] [&_h3]:font-semibold",
        "[&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:mb-2 [&_li]:text-[17px] [&_li]:leading-[1.75] [&_li]:text-[#2a3036]",
        "[&_strong]:font-semibold [&_strong]:text-ink",
        "[&_em]:italic",
        "[&_code]:rounded [&_code]:bg-silver-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[15px]",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-ink [&_blockquote]:pl-5 [&_blockquote]:italic",
        "[&_img]:my-6 [&_img]:rounded-[12px]",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
