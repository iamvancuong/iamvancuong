import fs from "node:fs/promises";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";
import { resolveUpload } from "@/lib/os/upload";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/**
 * Phục vụ ảnh từ thư mục uploads (nằm ngoài /public nên Next không tự serve).
 *
 * Ảnh PRIVATE chỉ trả về khi đã đăng nhập. Tên file ngẫu nhiên đã khó đoán,
 * nhưng vẫn phải kiểm tra thật — link ảnh rất dễ bị chia sẻ nhầm.
 */
export async function GET(
  _req: Request,
  { params }: RouteContext<"/api/uploads/[...path]">,
) {
  const { path: segments } = await params;

  const file = resolveUpload(segments);
  if (!file) return new Response("Not found", { status: 404 });

  const url = `/api/uploads/${segments.join("/")}`;

  // Bản thumbnail dùng chung quyền với bản đầy đủ
  const fullUrl = url.replace(/_t\.webp$/, ".webp");

  const photo = await db.photo.findFirst({
    where: { OR: [{ url }, { url: fullUrl }] },
    select: { visibility: true },
  });

  // Không có trong database = file mồ côi, không phục vụ.
  if (!photo) return new Response("Not found", { status: 404 });

  if (photo.visibility === "PRIVATE" && !(await isOwner())) {
    return new Response("Not found", { status: 404 });
  }

  let data: Buffer;
  try {
    data = await fs.readFile(file);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const ext = segments.at(-1)?.split(".").pop()?.toLowerCase() ?? "webp";

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      // Ảnh không bao giờ đổi (tên ngẫu nhiên) nên cache lâu được.
      // private: ảnh riêng tư không nằm lại trên CDN dùng chung.
      "Cache-Control":
        photo.visibility === "PUBLIC"
          ? "public, max-age=31536000, immutable"
          : "private, max-age=3600",
    },
  });
}
