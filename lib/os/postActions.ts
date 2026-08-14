"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Visibility } from "@prisma/client";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";
import { slugify } from "@/lib/posts";
import { deleteUpload, saveImage } from "./upload";
import { dayUTC, fmtDateVN } from "./day";
import { str, text } from "./formData";

async function assertOwner() {
  if (!(await isOwner())) throw new Error("Chưa đăng nhập.");
}

function revalidateAll(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/blog/${slug}/ja`);
  revalidatePath("/os/write");
  revalidatePath("/");
  // Sitemap không cần gọi ở đây: nó đã là force-dynamic (xem app/sitemap.ts,
  // có ghi rõ vì sao) nên mỗi lượt truy cập đều đọc lại từ database.
}

/**
 * Slug phải là duy nhất — thêm hậu tố nếu đã có bài trùng tên.
 *
 * `exceptId` để lúc SỬA bài không tự đụng chính mình: không có nó thì bấm Lưu
 * mà không đổi gì cũng biến `bai-cua-toi` thành `bai-cua-toi-2`, rồi `-3`…
 */
async function uniqueSlug(raw: string, exceptId?: string): Promise<string> {
  const base = slugify(raw) || "bai-viet";
  let slug = base;

  for (let i = 2; ; i++) {
    const taken = await db.post.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!taken || taken.id === exceptId) return slug;
    slug = `${base}-${i}`;
  }
}

export async function createPost(fd: FormData) {
  await assertOwner();

  const title = str(fd, "title", 200) ?? "Bài chưa đặt tên";
  // Tính MỘT lần: gọi lại sau khi đã tạo sẽ ra slug khác (bài vừa tạo chiếm chỗ).
  const slug = await uniqueSlug(title);

  await db.post.create({
    data: { slug, title, body: "", visibility: Visibility.PRIVATE },
  });

  redirect(`/os/write/${slug}`);
}

/**
 * Tạo bản nháp từ một ngày đã đánh dấu "đáng viết".
 *
 * Đây là mắt xích còn thiếu của vòng lặp `Sống → ghi vào OS → chọn cái đáng
 * kể → viết thành bài`. Trước đây trang Viết chỉ liệt kê link tới ngày đó,
 * còn lại phải tự mở, tự đọc, tự chép sang bài mới — và vì phải chép tay nên
 * trên thực tế không ai chép.
 *
 * Cố tình KHÔNG tự động: bạn phải bấm nút. Việc chọn cái gì đáng viết chính
 * là phần có giá trị của quy trình; tự động hóa nó là bỏ mất phần đó.
 */
export async function createPostFromLog(iso: string) {
  await assertOwner();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;

  const log = await db.dailyLog.findUnique({ where: { date: dayUTC(iso) } });
  if (!log) return;

  // Ký ức cùng ngày cũng là nguyên liệu — gộp luôn để khỏi phải mở hai chỗ.
  const memories = await db.memory.findMany({
    where: { date: dayUTC(iso) },
    orderBy: { createdAt: "asc" },
  });

  const title =
    memories[0]?.title ??
    log.journalWhat?.split("\n")[0].slice(0, 80) ??
    `Ghi chép ngày ${fmtDateVN(iso)}`;

  // Ghép thành bản nháp có sẵn khung, không phải một ô trắng.
  const parts: string[] = [];
  if (log.journalWhat) parts.push(log.journalWhat);
  for (const m of memories) {
    parts.push(`## ${m.title}`);
    if (m.body) parts.push(m.body);
    if (m.learned) parts.push(`> ${m.learned}`);
  }
  if (log.journalLearn) parts.push(`## Học được gì\n\n${log.journalLearn}`);
  if (log.journalChange) parts.push(`## Mai đổi gì\n\n${log.journalChange}`);

  const slug = await uniqueSlug(title);

  await db.post.create({
    data: {
      slug,
      title,
      excerpt: log.journalLearn?.slice(0, 160) ?? null,
      body: parts.join("\n\n"),
      visibility: Visibility.PRIVATE,
    },
  });

  redirect(`/os/write/${slug}`);
}

export async function savePost(id: string, fd: FormData) {
  await assertOwner();

  const title = str(fd, "title", 200) ?? "Bài chưa đặt tên";

  /**
   * ⚠️ Trước đây hàm này KHÔNG đụng tới `slug`, nên slug bị đóng băng ở giá trị
   * sinh ra lúc bấm «bài mới» — lúc đó bài chưa có tiêu đề, nên mọi bài đều
   * thành `bai-viet-chua-dat-ten`, `-2`, `-3`… và không có cách nào sửa.
   *
   * Nay: ô slug để trống thì LẤY THEO TIÊU ĐỀ, gõ vào thì dùng đúng cái đó
   * (vẫn qua `slugify` để không lọt dấu cách hay ký tự lạ vào địa chỉ).
   */
  const wanted = str(fd, "slug", 200);
  const slug = await uniqueSlug(wanted || title, id);

  // Checkbox không được tick thì không có trong FormData — getAll trả về
  // đúng những chủ đề đang được chọn.
  const tagIds = fd.getAll("tagIds").map(String).filter(Boolean);

  const before = await db.post.findUniqueOrThrow({
    where: { id },
    select: { slug: true },
  });

  const post = await db.post.update({
    where: { id },
    data: {
      slug,
      title,
      excerpt: str(fd, "excerpt", 300),
      body: fd.get("body")?.toString() ?? "",
      titleJa: str(fd, "titleJa", 200),
      // Chuỗi rỗng → null, để route /blog/[slug]/ja không được sinh ra
      // cho bài chưa có bản tiếng Nhật.
      bodyJa: text(fd, "bodyJa"),
      tags: { set: tagIds.map((tid) => ({ id: tid })) },
    },
  });

  revalidateAll(post.slug);

  // Đổi slug là đổi cả địa chỉ trang đang mở và địa chỉ công khai cũ. Phải xóa
  // cache đường dẫn CŨ, nếu không /blog/<slug-cũ> còn phục vụ bản đã chết.
  if (before.slug !== post.slug) {
    revalidateAll(before.slug);
    redirect(`/os/write/${post.slug}`);
  }
}

/**
 * Tạo chủ đề mới ngay lúc viết bài.
 * Trang /blog tự có thêm bộ lọc tương ứng — không phải sửa code.
 */
export async function createTag(fd: FormData) {
  await assertOwner();

  const name = str(fd, "name", 60);
  if (!name) return;

  const slug = slugify(name);
  if (!slug) return;

  const count = await db.tag.count();
  await db.tag.upsert({
    where: { slug },
    update: { name },
    create: { slug, name, order: count },
  });

  revalidatePath("/os/write", "layout");
  revalidatePath("/blog");
}

/**
 * Đổi TÊN hiển thị của chủ đề, giữ nguyên `slug`.
 *
 * Trước đây chỉ đổi được bằng cách gõ lại vào form "thêm chủ đề" đúng một tên
 * sinh ra cùng slug cũ — tức là phải tự đoán `slugify` làm gì. Gõ lệch một
 * chữ là đẻ ra chủ đề thứ hai chứ không phải sửa cái đang có.
 *
 * Không đổi `slug` vì nó nằm trong địa chỉ bộ lọc của /blog; đổi là làm chết
 * link đã chia sẻ. Cùng lý do với `Area.slug`.
 */
export async function updateTag(id: string, fd: FormData) {
  await assertOwner();

  const name = str(fd, "name", 60);
  if (!name) return;

  await db.tag.update({ where: { id }, data: { name } });

  revalidatePath("/os/write", "layout");
  revalidatePath("/blog");
}

export async function deleteTag(id: string) {
  await assertOwner();
  // Xóa chủ đề KHÔNG xóa bài — quan hệ nhiều-nhiều nên bài chỉ mất nhãn đó.
  await db.tag.delete({ where: { id } });
  revalidatePath("/os/write", "layout");
  revalidatePath("/blog");
}

/**
 * Xuất bản = vừa đặt PUBLIC vừa đóng dấu thời gian.
 * Gỡ xuống thì giữ lại publishedAt để lần sau bật lên không mất ngày gốc.
 */
export async function togglePublish(id: string) {
  await assertOwner();

  const post = await db.post.findUniqueOrThrow({ where: { id } });
  const next =
    post.visibility === Visibility.PUBLIC
      ? Visibility.PRIVATE
      : Visibility.PUBLIC;

  await db.post.update({
    where: { id },
    data: {
      visibility: next,
      publishedAt:
        next === Visibility.PUBLIC ? (post.publishedAt ?? new Date()) : post.publishedAt,
    },
  });

  revalidateAll(post.slug);
}

/* ---------------- Ảnh của bài ---------------- */

/**
 * Tải ảnh cho một bài viết.
 *
 * Trước đây bài viết **không có đường nào để thêm ảnh** — `Post.photos` có
 * trong schema từ đầu nhưng không giao diện nào ghi vào nó. Hậu quả là nút
 * «Lên trang chủ» (chỉ hiện khi bài có ảnh) không bao giờ hiện được, và dải
 * ảnh "Viết" ở trang chủ vĩnh viễn trống.
 *
 * Tấm ĐẦU TIÊN theo `order` là ảnh bìa — thứ hiện ở trang chủ.
 */
export async function uploadPostPhotos(id: string, fd: FormData) {
  await assertOwner();

  const post = await db.post.findUniqueOrThrow({
    where: { id },
    select: { slug: true, visibility: true, _count: { select: { photos: true } } },
  });

  const files = fd.getAll("photos").filter((f): f is File => f instanceof File);
  const saved = [];
  for (const f of files) {
    const s = await saveImage(f);
    if (s) saved.push(s);
  }
  if (saved.length === 0) return;

  try {
    await db.photo.createMany({
      data: saved.map((s, i) => ({
        url: s.url,
        thumbUrl: s.thumbUrl,
        width: s.width,
        height: s.height,
        bytes: s.bytes,
        takenAt: s.takenAt,
        postId: id,
        // Ảnh theo quyền của bài chứa nó — bài riêng tư mà ảnh công khai thì
        // ảnh bìa lộ ra ngoài dù bài chưa đăng.
        visibility: post.visibility,
        order: post._count.photos + i,
      })),
    });
  } catch (e) {
    // Ghi database hỏng thì phải dọn file đã nằm trên đĩa, nếu không thư mục
    // uploads đầy dần bằng những tấm không bản ghi nào trỏ tới.
    for (const s of saved) {
      await deleteUpload(s.url);
      await deleteUpload(s.thumbUrl);
    }
    throw e;
  }

  revalidateAll(post.slug);
}

/**
 * Đưa một tấm lên đầu = đặt nó làm ảnh bìa.
 *
 * Gán lại cả cột `order` theo vị trí mới chứ không chỉ sửa một dòng: dữ liệu
 * cũ đang cùng `order = 0` hết, nên chỉ đổi một dòng thì thứ tự vẫn do
 * `createdAt` quyết định và nút bấm trông như không có tác dụng.
 */
export async function setPostCover(photoId: string) {
  await assertOwner();

  const photo = await db.photo.findUniqueOrThrow({
    where: { id: photoId },
    select: { postId: true, post: { select: { slug: true } } },
  });
  if (!photo.postId) return;

  const siblings = await db.photo.findMany({
    where: { postId: photo.postId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  const reordered = [
    photoId,
    ...siblings.map((s) => s.id).filter((id) => id !== photoId),
  ];

  await db.$transaction(
    reordered.map((id, idx) =>
      db.photo.update({ where: { id }, data: { order: idx } }),
    ),
  );

  if (photo.post) revalidateAll(photo.post.slug);
}

export async function deletePostPhoto(photoId: string) {
  await assertOwner();

  const photo = await db.photo.findUniqueOrThrow({
    where: { id: photoId },
    select: { url: true, thumbUrl: true, post: { select: { slug: true } } },
  });

  await db.photo.delete({ where: { id: photoId } });
  await deleteUpload(photo.url);
  if (photo.thumbUrl) await deleteUpload(photo.thumbUrl);

  if (photo.post) revalidateAll(photo.post.slug);
}

/**
 * Bật/tắt "hiện ảnh bìa ở trang chủ" — song sinh với `toggleMemoryHome`.
 *
 * Bật ở đây KHÔNG tự xuất bản bài. Bài còn nháp thì vẫn không lên trang chủ vì
 * `getHomeStrips()` đòi cả `visibility = PUBLIC` lẫn `publishedAt != null`.
 */
export async function togglePostHome(id: string) {
  await assertOwner();

  const post = await db.post.findUniqueOrThrow({
    where: { id },
    select: { slug: true, showOnHome: true },
  });
  await db.post.update({
    where: { id },
    data: { showOnHome: !post.showOnHome },
  });

  revalidateAll(post.slug);
}

export async function deletePost(id: string) {
  await assertOwner();
  const post = await db.post.delete({ where: { id } });
  revalidateAll(post.slug);
  redirect("/os/write");
}
