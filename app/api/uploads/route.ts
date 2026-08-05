import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";
import { saveImage } from "@/lib/os/upload";

export const runtime = "nodejs";

/**
 * Tải ảnh lên từ trong lúc soạn bài, trả về URL để chèn vào Markdown.
 *
 * Ảnh của bài viết được đặt PUBLIC ngay: bài chưa xuất bản thì không ai tới
 * được trang đó, còn khi đã xuất bản thì ảnh phải xem được. Nếu để PRIVATE,
 * bài công khai sẽ hiện toàn ảnh vỡ.
 */
export async function POST(req: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const fd = await req.formData();
  const file = fd.get("file");
  const postId = fd.get("postId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Thiếu file." }, { status: 400 });
  }

  try {
    const saved = await saveImage(file);
    if (!saved) {
      return NextResponse.json({ error: "File rỗng." }, { status: 400 });
    }

    const photo = await db.photo.create({
      data: {
        url: saved.url,
        thumbUrl: saved.thumbUrl,
        width: saved.width,
        height: saved.height,
        bytes: saved.bytes,
        takenAt: saved.takenAt,
        postId: typeof postId === "string" && postId ? postId : null,
        visibility: "PUBLIC",
      },
    });

    return NextResponse.json({ url: photo.url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Tải ảnh thất bại." },
      { status: 400 },
    );
  }
}
