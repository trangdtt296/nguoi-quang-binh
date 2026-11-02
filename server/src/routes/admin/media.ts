import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { ApiError, buildMeta, readPaging, sendData, serialize } from "../../utils/api";
import { requireAuth } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/rbac";

export const mediaRouter = Router();

if (env.hasCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Giữ file trong bộ nhớ rồi đẩy thẳng lên Cloudinary, không ghi ra đĩa —
 * Render gói free không có ổ đĩa bền, file ghi ra sẽ mất khi service ngủ dậy.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      cb(new Error("Chỉ nhận ảnh JPG, PNG, WebP, GIF hoặc AVIF"));
      return;
    }
    cb(null, true);
  },
});

mediaRouter.use(requireAuth);

mediaRouter.get("/", async (req, res, next) => {
  try {
    const { page, limit, skip } = readPaging(req.query, 24);
    const { q, type } = req.query as Record<string, string>;

    const where = {
      deletedAt: null,
      ...(type ? { type: type as never } : {}),
      ...(q
        ? {
            OR: [
              { fileName: { contains: q, mode: "insensitive" as const } },
              { altText: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total, usage] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { uploadedBy: { select: { id: true, fullName: true } } },
      }),
      prisma.media.count({ where }),
      prisma.media.aggregate({ where: { deletedAt: null }, _sum: { sizeBytes: true } }),
    ]);

    sendData(
      res,
      serialize({ items, totalBytes: usage._sum.sizeBytes ?? 0n }),
      buildMeta(total, page, limit),
    );
  } catch (error) {
    next(error);
  }
});

mediaRouter.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!env.hasCloudinary) {
      throw new ApiError(
        503,
        "UPLOAD_UNAVAILABLE",
        "Chưa cấu hình Cloudinary nên chưa tải ảnh lên được. Kiểm tra biến môi trường CLOUDINARY_*.",
      );
    }
    if (!req.file) throw ApiError.badRequest("Chưa chọn file để tải lên");

    const folder = (req.body.folder as string | undefined)?.trim() || "nguoi-quang-binh";

    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (error, uploaded) => {
          if (error || !uploaded) reject(error ?? new Error("Tải ảnh lên thất bại"));
          else resolve(uploaded as unknown as Record<string, unknown>);
        },
      );
      stream.end(req.file!.buffer);
    });

    const media = await prisma.media.create({
      data: {
        publicId: result.public_id as string,
        url: result.secure_url as string,
        thumbnailUrl: cloudinary.url(result.public_id as string, {
          width: 400,
          height: 300,
          crop: "fill",
          fetch_format: "auto",
          quality: "auto",
        }),
        type: "image",
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: BigInt(req.file.size),
        width: result.width as number,
        height: result.height as number,
        altText: (req.body.altText as string | undefined)?.trim() || req.file.originalname,
        folder,
        uploadedById: req.user!.id,
      },
    });

    sendData(res, serialize(media), undefined, 201);
  } catch (error) {
    next(error);
  }
});

mediaRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const media = await prisma.media.findFirst({ where: { id: req.params.id } });
    if (!media) throw ApiError.notFound("Không tìm thấy file này");

    // Xóa trên Cloudinary trước để không giữ file rác chiếm dung lượng,
    // nhưng không để lỗi ở đó chặn việc xóa bản ghi trong database.
    if (media.publicId && env.hasCloudinary) {
      try {
        await cloudinary.uploader.destroy(media.publicId);
      } catch {
        // Bỏ qua: file có thể đã bị xóa thủ công trên Cloudinary.
      }
    }

    await prisma.media.update({
      where: { id: media.id },
      data: { deletedAt: new Date() },
    });

    sendData(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});
