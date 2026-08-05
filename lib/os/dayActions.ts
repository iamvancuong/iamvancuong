"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FocusStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";
import { dayUTC } from "./day";
import { MAX_NOW } from "./constants";
import {
  bool,
  enumOf,
  MINUTES_IN_DAY,
  num,
  str,
  text,
  valuesOf,
} from "./formData";

async function assertOwner() {
  if (!(await isOwner())) throw new Error("Chưa đăng nhập.");
}

/** Khai bằng tên, không đọc từ object enum lúc chạy — xem `valuesOf`. */
const FOCUS_STATUSES = valuesOf<FocusStatus>({
  NOW: null,
  NEXT: null,
  LATER: null,
  NO: null,
});

/* ---------------- Focus ---------------- */

export async function createFocusItem(fd: FormData) {
  await assertOwner();

  const title = str(fd, "title", 200);
  if (!title) return;

  // Xếp cuối cột NEXT
  const last = await db.focusItem.findFirst({
    where: { status: FocusStatus.NEXT },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await db.focusItem.create({
    data: {
      title,
      areaId: str(fd, "areaId", 40),
      why: text(fd, "why", 500),
      order: (last?.order ?? 0) + 1,
      // Mọi thứ vào NEXT trước. Lên NOW phải là quyết định có ý thức.
      status: FocusStatus.NEXT,
    },
  });

  revalidatePath("/os/focus");
}

export async function updateFocusItem(id: string, fd: FormData) {
  await assertOwner();

  const title = str(fd, "title", 200);
  if (!title) return;

  await db.focusItem.update({
    where: { id },
    data: {
      title,
      areaId: str(fd, "areaId", 40),
      why: text(fd, "why", 500),
    },
  });

  revalidatePath("/os/focus");
  revalidatePath("/os");
}

export async function moveFocusItem(id: string, fd: FormData) {
  await assertOwner();

  const status = enumOf(fd, "status", FOCUS_STATUSES, FocusStatus.NEXT);
  const current = await db.focusItem.findUniqueOrThrow({ where: { id } });

  // Chỉ chặn khi thật sự ĐANG CHUYỂN VÀO NOW. Trước đây một việc đã ở NOW mà
  // bấm "đổi" giữ nguyên NOW cũng bị tính là dòng thứ tư và bị chặn oan.
  if (status === FocusStatus.NOW && current.status !== FocusStatus.NOW) {
    const now = await db.focusItem.count({ where: { status: FocusStatus.NOW } });
    // Kiểm tra ở SERVER, không phải ở giao diện — đây là ràng buộc thật,
    // không phải gợi ý. Sửa DOM hay gọi thẳng action đều không lách được.
    if (now >= MAX_NOW) redirect("/os/focus?err=now-full");
  }

  await db.focusItem.update({ where: { id }, data: { status } });
  revalidatePath("/os/focus");
  revalidatePath("/os");
}

/**
 * Đổi chỗ với việc liền kề trong cùng một cột.
 *
 * Cột `order` có từ đầu nhưng chưa bao giờ đổi được, nên thứ tự ba việc NOW
 * là thứ tự tình cờ lúc tạo. Với danh sách tối đa ba dòng thì hai nút
 * lên/xuống là đủ — kéo thả cần thêm thư viện và không dùng được bằng bàn phím.
 */
export async function reorderFocusItem(id: string, dir: "up" | "down") {
  await assertOwner();

  const item = await db.focusItem.findUniqueOrThrow({ where: { id } });

  // Danh sách xếp theo [order, createdAt], nên "liền kề" cũng phải so bằng
  // cả hai — nếu không, các dòng cùng order sẽ nhảy loạn.
  const siblings = await db.focusItem.findMany({
    where: { status: item.status },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, order: true },
  });

  const i = siblings.findIndex((s) => s.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i === -1 || j < 0 || j >= siblings.length) return; // đã ở đầu/cuối cột

  // Gán lại order theo vị trí sau khi hoán đổi. Ghi cả cột thay vì đổi hai ô,
  // vì dữ liệu cũ có thể đang cùng order = 0 hết.
  const next = [...siblings];
  [next[i], next[j]] = [next[j], next[i]];

  await db.$transaction(
    next.map((s, idx) =>
      db.focusItem.update({ where: { id: s.id }, data: { order: idx } }),
    ),
  );

  revalidatePath("/os/focus");
  revalidatePath("/os");
}

export async function deleteFocusItem(id: string) {
  await assertOwner();
  await db.focusItem.delete({ where: { id } });
  revalidatePath("/os/focus");
  revalidatePath("/os");
}

/* ---------------- Nhật ký ngày ---------------- */

/**
 * Một bản ghi mỗi ngày. Dùng upsert theo cột `date` (unique) nên bấm bao
 * nhiêu lần cũng không tạo trùng.
 */
export async function saveDailyLog(iso: string, fd: FormData) {
  await assertOwner();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;

  const data = {
    sleepAt: str(fd, "sleepAt", 5),
    // Kẹp ở 24 giờ. Gõ thừa một số 0 thì thống kê tuần hỏng mà không ai nhận ra.
    jpMin: num(fd, "jpMin", { min: 0, max: MINUTES_IN_DAY }) ?? 0,
    itMin: num(fd, "itMin", { min: 0, max: MINUTES_IN_DAY }) ?? 0,
    spend: num(fd, "spend", { min: 0, max: 10_000_000 }),
    kSleep: bool(fd, "kSleep"),
    kJapanese: bool(fd, "kJapanese"),
    kEat: bool(fd, "kEat"),
    workout: bool(fd, "workout"),
    journalWhat: text(fd, "journalWhat"),
    journalLearn: text(fd, "journalLearn"),
    journalChange: text(fd, "journalChange"),
    publishable: bool(fd, "publishable"),
  };

  await db.dailyLog.upsert({
    where: { date: dayUTC(iso) },
    update: data,
    create: { date: dayUTC(iso), ...data },
  });

  revalidatePath("/os/log");
  revalidatePath("/os");
  revalidatePath("/os/write");
}

/** Tick nhanh từ Dashboard — không phải mở trang nhật ký. */
export async function toggleKeystone(
  iso: string,
  field: "kSleep" | "kJapanese" | "kEat" | "workout",
) {
  await assertOwner();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;

  const date = dayUTC(iso);
  const existing = await db.dailyLog.findUnique({ where: { date } });
  const next = !(existing?.[field] ?? false);

  await db.dailyLog.upsert({
    where: { date },
    update: { [field]: next },
    create: { date, [field]: next },
  });

  revalidatePath("/os");
  revalidatePath("/os/log");
}
