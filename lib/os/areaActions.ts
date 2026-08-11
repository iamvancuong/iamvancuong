"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";
import { slugify } from "@/lib/posts";
import { str } from "./formData";

/**
 * Lĩnh vực — bảng duy nhất mà cả hệ thống dựng theo.
 *
 * Cho tới giờ thêm/sửa/ẩn một lĩnh vực chỉ làm được bằng `prisma studio`, tức
 * là bằng cách mở thẳng database. Cột `Area.active` tồn tại đúng để tắt bớt
 * lĩnh vực chưa cần, mà không có chỗ nào bật/tắt được nó.
 *
 * MỌI hàm ở đây phải tự kiểm đăng nhập — Server Action là endpoint thật,
 * middleware không chặn nó.
 */

async function assertOwner() {
  if (!(await isOwner())) throw new Error("Chưa đăng nhập.");
}

/**
 * Thanh bên sinh từ database và nằm trong `app/os/layout.tsx`, nên phải làm
 * mới cả LAYOUT chứ không chỉ trang — đổi tên lĩnh vực mà chỉ revalidate
 * trang thì thanh bên vẫn hiện tên cũ cho tới lần tải lại sau.
 */
function revalidateAreas() {
  revalidatePath("/os", "layout");
}

export async function createArea(fd: FormData) {
  await assertOwner();

  const name = str(fd, "name", 60);
  if (!name) return;

  const slug = slugify(name);
  if (!slug) return;

  // Trùng slug thì bỏ qua chứ KHÔNG upsert: upsert ở đây nghĩa là gõ trùng tên
  // một lĩnh vực đang có sẽ âm thầm ghi đè lên nó.
  if (await db.area.findUnique({ where: { slug }, select: { id: true } })) return;

  const count = await db.area.count();

  await db.area.create({
    data: {
      slug,
      name,
      tagline: str(fd, "tagline", 200),
      icon: str(fd, "icon", 40),
      order: count,
    },
  });

  revalidateAreas();
}

/**
 * Sửa tên / câu hỏi / icon. **Không sửa `slug`** — slug là địa chỉ trang
 * (`/os/a/tinh-yeu`), đổi nó là làm chết mọi link đã lưu và mọi chỗ đã ghi
 * lại đường dẫn. Đổi tên hiển thị là đủ cho việc gọi nó khác đi.
 */
export async function updateArea(id: string, fd: FormData) {
  await assertOwner();

  const name = str(fd, "name", 60);
  if (!name) return;

  await db.area.update({
    where: { id },
    data: {
      name,
      tagline: str(fd, "tagline", 200),
      icon: str(fd, "icon", 40),
    },
  });

  revalidateAreas();
}

/**
 * Ẩn / hiện. Ẩn chỉ bỏ khỏi thanh bên, KHÔNG xóa gì — trang `/os/a/<slug>`
 * vẫn mở được bằng địa chỉ trực tiếp, và dữ liệu bên trong còn nguyên.
 * Đây là cách đúng để tạm gác một lĩnh vực chưa tới lúc.
 */
/**
 * Bật/tắt bấm giờ pomodoro cho một lĩnh vực.
 *
 * Mặc định tắt hết. Bật cho Tiếng Nhật là hàng ô pomodoro + đợt học hiện ra ở
 * /os và trong tab «Mục tiêu» của chính lĩnh vực đó; lĩnh vực khác không thấy
 * gì thêm. Đây là chỗ duy nhất quyết định — không hard-code slug ở đâu cả.
 */
export async function toggleAreaStudy(id: string) {
  await assertOwner();
  const area = await db.area.findUniqueOrThrow({ where: { id } });
  await db.area.update({
    where: { id },
    data: { tracksStudy: !area.tracksStudy },
  });
  revalidatePath("/os/data");
  revalidatePath(`/os/a/${area.slug}`);
  revalidatePath("/os");
}

export async function toggleAreaActive(id: string) {
  await assertOwner();

  const area = await db.area.findUniqueOrThrow({
    where: { id },
    select: { active: true },
  });

  await db.area.update({ where: { id }, data: { active: !area.active } });
  revalidateAreas();
}

/**
 * Đổi chỗ với lĩnh vực liền kề. Cùng cách làm với `reorderFocusItem`: gán lại
 * cả cột `order` theo vị trí thay vì hoán đổi hai ô, vì dữ liệu cũ có thể
 * đang cùng `order` hết.
 */
export async function reorderArea(id: string, dir: "up" | "down") {
  await assertOwner();

  const siblings = await db.area.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  const i = siblings.findIndex((s) => s.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i === -1 || j < 0 || j >= siblings.length) return; // đã ở đầu/cuối

  const next = [...siblings];
  [next[i], next[j]] = [next[j], next[i]];

  await db.$transaction(
    next.map((s, idx) =>
      db.area.update({ where: { id: s.id }, data: { order: idx } }),
    ),
  );

  revalidateAreas();
}

/**
 * Xóa hẳn.
 *
 * Hai loại hậu quả khác nhau, và giao diện phải nói rõ cả hai trước khi hỏi:
 *   - Mục tiêu · Nguyên tắc · Đang dùng · Số đo → **xóa theo** (Cascade)
 *   - Ký ức · Ảnh · việc trong Focus            → **giữ lại**, chỉ mất nhãn
 *     lĩnh vực (SetNull)
 *
 * Gần như lúc nào «ẩn» cũng là thứ bạn thật sự muốn, không phải «xóa».
 */
export async function deleteArea(id: string) {
  await assertOwner();
  await db.area.delete({ where: { id } });
  revalidateAreas();
}
