import { prisma } from "../config/prisma";

/** Bỏ dấu tiếng Việt và chuyển thành slug gạch nối. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

type SlugTable = "article" | "destination" | "food" | "event" | "album" | "learningCourse";

/**
 * Sinh slug duy nhất. Nếu đã có bản ghi khác dùng slug đó thì thêm hậu tố số:
 * "hang-son-doong", "hang-son-doong-2", "hang-son-doong-3"...
 *
 * `excludeId` dùng khi sửa bản ghi, để nó không tự coi mình là trùng.
 */
export async function uniqueSlug(
  table: SlugTable,
  source: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(source) || "noi-dung";
  let candidate = base;
  let suffix = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const delegate = prisma[table] as unknown as {
      findFirst: (args: unknown) => Promise<{ id: string } | null>;
    };

    const existing = await delegate.findFirst({
      where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });

    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}
