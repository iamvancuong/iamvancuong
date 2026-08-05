"use server";

import { revalidatePath } from "next/cache";
import { MetricDirection } from "@prisma/client";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";
import { dateISO, enumOf, str, text, valuesOf } from "./formData";

/**
 * Số đo của một lĩnh vực.
 *
 * MỌI hàm ở đây phải tự kiểm đăng nhập — Server Action là endpoint thật,
 * middleware không chặn nó.
 */

async function assertOwner() {
  if (!(await isOwner())) throw new Error("Chưa đăng nhập.");
}

/** Khai bằng tên, không đọc object enum lúc chạy — xem `valuesOf`. */
const DIRECTIONS = valuesOf<MetricDirection>({ UP: null, DOWN: null });

function revalidateArea(areaSlug: string) {
  revalidatePath(`/os/a/${areaSlug}`);
  revalidatePath("/os");
}

/* ---------------- Số đo ---------------- */

function metricFields(fd: FormData) {
  return {
    name: str(fd, "name", 120),
    unit: str(fd, "unit", 20),
    target: str(fd, "target", 60),
    direction: enumOf(fd, "direction", DIRECTIONS, MetricDirection.UP),
    note: text(fd, "note", 500),
    group: str(fd, "group", 40),
  };
}

export async function createMetric(areaSlug: string, fd: FormData) {
  await assertOwner();

  const f = metricFields(fd);
  if (!f.name) return;

  const area = await db.area.findUniqueOrThrow({ where: { slug: areaSlug } });
  const count = await db.metric.count({ where: { areaId: area.id } });

  await db.metric.create({
    data: { areaId: area.id, ...f, name: f.name, order: count },
  });

  revalidateArea(areaSlug);
}

export async function updateMetric(
  id: string,
  areaSlug: string,
  fd: FormData,
) {
  await assertOwner();

  const f = metricFields(fd);
  if (!f.name) return;

  await db.metric.update({ where: { id }, data: { ...f, name: f.name } });
  revalidateArea(areaSlug);
}

export async function deleteMetric(id: string, areaSlug: string) {
  await assertOwner();
  // Các lần ghi xóa theo (onDelete: Cascade)
  await db.metric.delete({ where: { id } });
  revalidateArea(areaSlug);
}

/* ---------------- Lần ghi ---------------- */

/**
 * Ghi một giá trị.
 *
 * Dùng upsert theo (metricId, date) nên ghi lại cùng ngày là **đè lên**, không
 * tạo dòng thứ hai. Sửa một con số gõ nhầm chỉ là ghi lại đúng ngày đó.
 */
export async function addMetricEntry(
  metricId: string,
  areaSlug: string,
  fd: FormData,
) {
  await assertOwner();

  const date = dateISO(fd, "date");
  // Không dùng num() vì số đo có thể là số lẻ (57,5 kg) — num() làm tròn.
  const raw = str(fd, "value", 20);
  if (!date || raw == null) return;

  const value = Number(raw.replace(",", "."));
  if (!Number.isFinite(value)) return;

  const note = text(fd, "note", 300);

  await db.metricEntry.upsert({
    where: { metricId_date: { metricId, date } },
    update: { value, note },
    create: { metricId, date, value, note },
  });

  revalidateArea(areaSlug);
}

export async function deleteMetricEntry(id: string, areaSlug: string) {
  await assertOwner();
  await db.metricEntry.delete({ where: { id } });
  revalidateArea(areaSlug);
}
