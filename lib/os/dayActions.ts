"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FocusStatus } from "@prisma/client";
// `import type`: chỉ mượn KIỂU, không đụng vào object lúc chạy — cùng lý do
// với `valuesOf` ở formData.ts (STATE.md §7.2, bẫy Prisma client cũ).
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";
import { dayUTC } from "./day";
import { MAX_NOW, POMO_MIN, POMO_SLOTS } from "./constants";
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
    // ⚠️ KHÔNG có `jpPomo` ở đây, và đừng thêm vào. Cột đó là bản sao của số
    // dòng `PomoSession`; chỉ `setPomodoro()` được ghi nó, vì chỉ hàm đó sửa
    // cả hai bảng cùng lúc. Ngày đã qua mà quên tick thì sửa bằng chính hàng ô
    // pomodoro ở đầu trang nhật ký — nó chạy được với mọi ngày, không riêng hôm nay.
    // Kẹp ở 24 giờ. Gõ thừa một số 0 thì thống kê tuần hỏng mà không ai nhận ra.
    jpMin: num(fd, "jpMin", { min: 0, max: MINUTES_IN_DAY }) ?? 0,
    itMin: num(fd, "itMin", { min: 0, max: MINUTES_IN_DAY }) ?? 0,
    webMin: num(fd, "webMin", { min: 0, max: MINUTES_IN_DAY }) ?? 0,
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

/**
 * Xóa hẳn nhật ký của một ngày.
 *
 * Cần vì trang nhật ký lưu ngay khi rời ô, không có nút Lưu — nên ghi nhầm
 * sang ngày khác là đã nằm trong database rồi. Trước đây chỉ xóa trắng được
 * từng ô một, mà bản ghi vẫn còn: ngày đó vẫn tính là "đã ghi" trong thống kê
 * và vẫn hiện trong danh sách.
 *
 * Chỉ đụng DailyLog. Ký ức cùng ngày là bảng khác, không mất theo.
 */
export async function deleteDailyLog(iso: string) {
  await assertOwner();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;

  // deleteMany chứ không delete: ngày chưa từng ghi thì delete ném lỗi.
  await db.dailyLog.deleteMany({ where: { date: dayUTC(iso) } });

  revalidatePath("/os/log");
  revalidatePath("/os");
  revalidatePath("/os/write");
}

/* ---------------- Pomodoro tiếng Nhật ---------------- */

/**
 * Đặt số hiệp pomodoro của một ngày về đúng `n`, gắn mảng `skillId`.
 *
 * Hàng ô ở /os hoạt động như thanh chấm sao, không phải mười ô tick rời: bấm ô
 * thứ 5 là "hôm nay xong 5 hiệp" (một chạm, không phải năm chạm). Bấm lại đúng
 * ô đang là cuối cùng thì lùi một hiệp — cách duy nhất để sửa khi bấm nhầm.
 * Việc quyết định lùi hay không nằm ở ĐÂY chứ không ở giao diện, để gọi thẳng
 * action cũng không đặt được số vô lý.
 *
 * ⚠️ Đây là ĐƯỜNG GHI DUY NHẤT cho `DailyLog.jpPomo`, và nó ghi cùng lúc với
 * các dòng `PomoSession` trong một transaction. Bất biến cần giữ:
 * `jpPomo == số dòng PomoSession cùng ngày`. Thêm một chỗ ghi thứ hai là hai
 * con số bắt đầu trôi khỏi nhau, và không có lỗi nào hiện ra.
 *
 * Chỉ những hiệp MỚI THÊM mới nhận `skillId`. Học hai mảng trong một ngày thì
 * chọn mảng rồi bấm tiếp — các hiệp cũ giữ nguyên mảng của chúng.
 */
export async function setPomodoro(
  iso: string,
  n: number,
  skillId: string | null,
) {
  await assertOwner();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;

  const want = Math.min(POMO_SLOTS, Math.max(0, Math.round(n)));
  const date = dayUTC(iso);

  const [existing, sessions] = await Promise.all([
    db.dailyLog.findUnique({ where: { date } }),
    db.pomoSession.findMany({
      where: { date },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    }),
  ]);

  const current = sessions.length;
  // Bấm đúng ô cuối cùng đang sáng = bỏ hiệp đó.
  const jpPomo = Math.max(0, want === current ? want - 1 : want);

  // Học đủ 60 phút thì việc nền tảng «Tiếng Nhật» tự sáng — nó vốn hỏi đúng
  // câu này, mà giờ hệ thống đã tự biết câu trả lời. Chỉ BẬT, không bao giờ
  // tự tắt: bỏ một hiệp bấm nhầm không có nghĩa là hôm đó không học.
  const total = jpPomo * POMO_MIN + (existing?.jpMin ?? 0);
  const logData = total >= 60 ? { jpPomo, kJapanese: true } : { jpPomo };

  // `PrismaPromise[]`, không phải `Parameters<typeof db.$transaction>[0]`:
  // `$transaction` có hai chữ ký, và TypeScript chọn nhầm chữ ký callback.
  const writes: Prisma.PrismaPromise<unknown>[] = [
    db.dailyLog.upsert({
      where: { date },
      update: logData,
      create: { date, ...logData },
    }),
  ];

  if (jpPomo < current) {
    // Bỏ từ cuối lên — hiệp bị bỏ là hiệp vừa bấm nhầm, không phải hiệp đầu ngày.
    writes.push(
      db.pomoSession.deleteMany({
        where: { id: { in: sessions.slice(jpPomo).map((s) => s.id) } },
      }),
    );
  } else if (jpPomo > current) {
    writes.push(
      db.pomoSession.createMany({
        data: Array.from({ length: jpPomo - current }, (_, i) => ({
          date,
          skillId,
          order: current + i + 1,
        })),
      }),
    );
  }

  await db.$transaction(writes);

  revalidatePath("/os");
  revalidatePath("/os/log");
  revalidatePath("/os/calendar");
}

/** Đổi mảng của một hiệp đã ghi — bấm xong mới nhớ ra mình học cái khác. */
export async function setSessionSkill(id: string, skillId: string | null) {
  await assertOwner();
  await db.pomoSession.update({ where: { id }, data: { skillId } });
  revalidatePath("/os");
  revalidatePath("/os/log");
}

/* ---------------- Việc trong ngày ---------------- */

/**
 * `iso` là NGÀY PHẢI LÀM, không phải ngày viết — nên 12 giờ đêm ghi cho mai
 * thì sáng mai mở /os là nó đã nằm sẵn ở tab «Hôm nay».
 */
export async function createDayTask(iso: string, fd: FormData) {
  await assertOwner();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;

  const title = str(fd, "title", 200);
  if (!title) return;

  const date = dayUTC(iso);
  const last = await db.dayTask.findFirst({
    where: { date },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await db.dayTask.create({
    data: { date, title, order: (last?.order ?? 0) + 1 },
  });

  revalidatePath("/os");
}

export async function toggleDayTask(id: string) {
  await assertOwner();

  const task = await db.dayTask.findUniqueOrThrow({ where: { id } });
  await db.dayTask.update({ where: { id }, data: { done: !task.done } });

  revalidatePath("/os");
}

export async function deleteDayTask(id: string) {
  await assertOwner();
  await db.dayTask.delete({ where: { id } });
  revalidatePath("/os");
}

/**
 * Dời việc chưa xong của một ngày sang ngày khác.
 *
 * Không có nút này thì việc chưa xong của hôm qua nằm lại đúng chỗ cũ và
 * không bao giờ ai nhìn nữa — danh sách hôm nay trông sạch trong khi việc thì
 * vẫn còn đó. Chỉ dời việc CHƯA xong; việc đã tick nằm lại đúng ngày đã làm,
 * nếu không thì nhật ký của ngày đó sai.
 */
export async function moveUndoneTasks(fromISO: string, toISO: string) {
  await assertOwner();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fromISO)) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(toISO)) return;

  await db.dayTask.updateMany({
    where: { date: dayUTC(fromISO), done: false },
    data: { date: dayUTC(toISO) },
  });

  revalidatePath("/os");
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
