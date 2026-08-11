"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";
import { dateISO, num, str, text } from "./formData";
import { POMO_SLOTS } from "./constants";

/**
 * Mục tiêu học có kỳ hạn + nhịp mỗi ngày. Xem chú thích `StudyGoal` trong
 * prisma/schema.prisma để biết vì sao nó không nằm chung bảng với `Goal`.
 */

async function assertOwner() {
  if (!(await isOwner())) throw new Error("Chưa đăng nhập.");
}

function refresh() {
  revalidatePath("/os");
  revalidatePath("/os/data");
  revalidatePath("/os/calendar");
}

export async function createStudyGoal(fd: FormData) {
  await assertOwner();

  const name = str(fd, "name", 120);
  const startDate = dateISO(fd, "startDate");
  const targetDate = dateISO(fd, "targetDate");

  // Thiếu một trong ba thì không tính được nhịp nào cả — bỏ qua, đừng lưu một
  // dòng nửa vời rồi hiện "NaN ngày" ở Hôm nay.
  if (!name || !startDate || !targetDate) return;
  if (targetDate < startDate) return;

  // Đợt mới bật lên thì đợt cũ tắt đi — /os chỉ hiện MỘT nhịp (xem
  // `toggleStudyGoal`). Hai thanh tiến độ chồng nhau thì không thanh nào có nghĩa.
  await db.$transaction([
    db.studyGoal.updateMany({ where: { active: true }, data: { active: false } }),
    db.studyGoal.create({
      data: {
        name,
        areaId: str(fd, "areaId", 40),
        startDate,
        targetDate,
        // Trần 5000h: một đợt vài tháng mà hơn thế chắc chắn là gõ nhầm.
        // Để trống → null → tổng suy ra từ nhịp, đúng hành vi cũ.
        targetHours: num(fd, "targetHours", { min: 0, max: 5000 }),
        dailyPomo: num(fd, "dailyPomo", { min: 1, max: POMO_SLOTS }) ?? 7,
        note: text(fd, "note", 500),
      },
    }),
  ]);

  refresh();
}

export async function updateStudyGoal(id: string, fd: FormData) {
  await assertOwner();

  const name = str(fd, "name", 120);
  const startDate = dateISO(fd, "startDate");
  const targetDate = dateISO(fd, "targetDate");

  if (!name || !startDate || !targetDate) return;
  if (targetDate < startDate) return;

  await db.studyGoal.update({
    where: { id },
    data: {
      name,
      areaId: str(fd, "areaId", 40),
      startDate,
      targetDate,
      targetHours: num(fd, "targetHours", { min: 0, max: 5000 }),
      dailyPomo: num(fd, "dailyPomo", { min: 1, max: POMO_SLOTS }) ?? 7,
      note: text(fd, "note", 500),
    },
  });

  refresh();
}

/**
 * Bật/tắt một đợt.
 *
 * /os chỉ hiện MỘT mục tiêu, nên bật đợt này thì tắt hết đợt khác — nếu không
 * thì hai thanh tiến độ chồng nhau và không biết đang chạy theo nhịp nào.
 * Xử ở server để mở hai tab cũng không lách được.
 */
export async function toggleStudyGoal(id: string) {
  await assertOwner();

  const goal = await db.studyGoal.findUniqueOrThrow({ where: { id } });

  if (goal.active) {
    await db.studyGoal.update({ where: { id }, data: { active: false } });
  } else {
    await db.$transaction([
      db.studyGoal.updateMany({ where: { active: true }, data: { active: false } }),
      db.studyGoal.update({ where: { id }, data: { active: true } }),
    ]);
  }

  refresh();
}

export async function deleteStudyGoal(id: string) {
  await assertOwner();
  await db.studyGoal.delete({ where: { id } });
  refresh();
}

/* ---------------- Mảng kỹ năng ---------------- */

/**
 * Ngân sách nhập bằng GIỜ vì đó là đơn vị chủ nhân nghĩ ("từ vựng 250h").
 * Trần 2000 giờ: hơn thế cho một đợt vài tháng chắc chắn là gõ nhầm.
 */
export async function createStudySkill(studyGoalId: string, fd: FormData) {
  await assertOwner();

  const name = str(fd, "name", 80);
  if (!name) return;

  const last = await db.studySkill.findFirst({
    where: { studyGoalId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await db.studySkill.create({
    data: {
      studyGoalId,
      name,
      icon: str(fd, "icon", 8),
      targetHours: num(fd, "targetHours", { min: 0, max: 2000 }) ?? 0,
      order: (last?.order ?? 0) + 1,
    },
  });

  refresh();
}

export async function updateStudySkill(id: string, fd: FormData) {
  await assertOwner();

  const name = str(fd, "name", 80);
  if (!name) return;

  await db.studySkill.update({
    where: { id },
    data: {
      name,
      icon: str(fd, "icon", 8),
      targetHours: num(fd, "targetHours", { min: 0, max: 2000 }) ?? 0,
    },
  });

  refresh();
}

/**
 * Xóa một mảng KHÔNG xóa giờ đã học: `PomoSession.skillId` là `SetNull`, nên
 * các hiệp đó rơi về "chưa gắn mảng" và vẫn nằm trong tổng giờ. Mất cái đích,
 * không mất công sức.
 */
export async function deleteStudySkill(id: string) {
  await assertOwner();
  await db.studySkill.delete({ where: { id } });
  refresh();
}
