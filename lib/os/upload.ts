import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp, { type Metadata } from "sharp";

/**
 * Lưu ảnh ra ổ đĩa, KHÔNG lưu vào database.
 *
 * Database chỉ giữ đường dẫn. Nhồi ảnh vào MySQL làm backup chậm kinh khủng
 * và không có CDN nên trang tải rất ì. (OS-DESIGN §5)
 *
 * Ảnh điện thoại giờ 4–8MB/tấm. Up thẳng vài trăm tấm là trang chết, nên
 * mọi ảnh đều được nén sang WebP và tạo thêm bản nhỏ cho trang lưới.
 */

const MAX_EDGE = 2000; // cạnh dài nhất của bản đầy đủ
const THUMB_EDGE = 480; // bản cho lưới ảnh
const MAX_BYTES = 25 * 1024 * 1024;

/**
 * Thư mục gốc chứa ảnh. Đọc từ env để sau này đổi sang đường dẫn trên hosting
 * mà không phải sửa code.
 *
 * turbopackIgnore: đường dẫn động khiến Next trace cả project vào bản build.
 * Ở đây là truy cập có chủ đích và đã chặn leo thư mục ở resolveUpload().
 */
export function uploadRoot() {
  return path.resolve(
    /* turbopackIgnore: true */ process.env.UPLOAD_DIR ?? "./uploads",
  );
}

export type Saved = {
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  bytes: number;
  takenAt: Date | null;
};

/** Đọc ngày chụp từ EXIF — ảnh cũ scan lại vẫn giữ đúng mốc thời gian. */
function exifDate(meta: Metadata): Date | null {
  const raw = (meta as { exif?: Buffer }).exif;
  if (!raw) return null;
  // "YYYY:MM:DD HH:MM:SS"
  const m = raw.toString("latin1").match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const d = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    Number(m[6]),
  );
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function saveImage(file: File): Promise<Saved | null> {
  if (!file || file.size === 0) return null;
  if (!file.type.startsWith("image/")) {
    throw new Error(`"${file.name}" không phải ảnh.`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`"${file.name}" lớn hơn 25MB.`);
  }

  const input = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(input).metadata();

  // Thư mục theo năm/tháng để sau này vài nghìn ảnh vẫn dễ tìm
  const now = new Date();
  const dir = path.join(
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0"),
  );
  await fs.mkdir(path.join(uploadRoot(), dir), { recursive: true });

  // Tên ngẫu nhiên — không đoán được, và không lộ tên file gốc
  const id = randomUUID();
  const rel = path.join(dir, `${id}.webp`).replaceAll("\\", "/");
  const relThumb = path.join(dir, `${id}_t.webp`).replaceAll("\\", "/");

  const full = await sharp(input)
    .rotate() // xoay theo EXIF, nếu không ảnh dọc chụp điện thoại sẽ nằm ngang
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  await sharp(input)
    .rotate()
    .resize(THUMB_EDGE, THUMB_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(path.join(uploadRoot(), relThumb));

  await fs.writeFile(path.join(uploadRoot(), rel), full.data);

  return {
    url: `/api/uploads/${rel}`,
    thumbUrl: `/api/uploads/${relThumb}`,
    width: full.info.width,
    height: full.info.height,
    bytes: full.info.size,
    takenAt: exifDate(meta),
  };
}

/**
 * Đổi URL công khai thành đường dẫn thật trên đĩa.
 * Trả về null nếu có dấu hiệu leo thư mục (../) — chặn đọc file ngoài kho ảnh.
 */
export function resolveUpload(segments: string[]): string | null {
  const root = uploadRoot();
  const target = path.resolve(root, ...segments);
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}

export async function deleteUpload(url: string) {
  const rel = url.replace(/^\/api\/uploads\//, "");
  const target = resolveUpload(rel.split("/"));
  if (!target) return;
  await fs.rm(target, { force: true });
}
