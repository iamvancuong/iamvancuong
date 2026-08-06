"use server";

import { revalidatePath } from "next/cache";
import {
  GoalOutcome,
  Horizon,
  ItemStatus,
  PrincipleKind,
  GoalStatus,
  Visibility,
} from "@prisma/client";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/session";
import { deleteUpload, saveImage } from "./upload";
import { dayUTC, isoUTC, todayISO } from "./day";
import { isPeriod, nextPeriodStartISO, periodStartISO } from "./period";
import {
  AGE_MAX,
  AGE_MIN,
  bool,
  dateISO,
  enumOf,
  num,
  str,
  text,
  valuesOf,
} from "./formData";

/**
 * Server Actions cho Life OS.
 *
 * MỌI hàm ở đây phải tự kiểm tra đăng nhập. Server Action là một endpoint
 * thật — middleware không chặn nó, nên không được ỷ vào middleware.
 */

async function assertOwner() {
  if (!(await isOwner())) throw new Error("Chưa đăng nhập.");
}

/**
 * Danh sách giá trị hợp lệ cho `enumOf`. Khai bằng tên chứ không đọc từ object
 * enum của Prisma — xem `valuesOf` để biết vì sao. TypeScript bắt liệt kê đủ.
 */
const HORIZONS = valuesOf<Horizon>({
  WEEK: null,
  MONTH: null,
  THIS_YEAR: null,
  NEXT_YEAR: null,
  AGE: null,
  LIFE: null,
});

const OUTCOMES = valuesOf<GoalOutcome>({
  SUCCESS: null,
  PARTIAL: null,
  FAILED: null,
});

const ITEM_STATUSES = valuesOf<ItemStatus>({
  USING: null,
  DROPPED: null,
  WANT: null,
});

/** Trang nào cũng phải làm mới khi một mục tiêu đổi. */
function revalidateGoal(areaSlug: string) {
  revalidatePath(`/os/a/${areaSlug}`);
  revalidatePath("/os/goals");
  revalidatePath("/os/calendar");
  revalidatePath("/os");
}
const PRINCIPLE_KINDS = valuesOf<PrincipleKind>({ DO: null, DONT: null });

/* ---------------- Mục tiêu ---------------- */

/**
 * Các trường mô tả một mục tiêu — dùng chung cho cả tạo và sửa, nên hai bên
 * không thể lệch nhau khi thêm trường mới.
 */
function goalFields(fd: FormData) {
  const horizon = enumOf(fd, "horizon", HORIZONS, Horizon.THIS_YEAR);

  /**
   * Với cam kết tuần/tháng, ô nhập là một NGÀY bất kỳ trong kỳ — người dùng
   * không phải tự tìm xem thứ Hai rơi vào hôm nào. Ở đây nắn về đầu kỳ.
   * `<input type="week">` thì gọn hơn nhưng Firefox không hỗ trợ.
   */
  const inPeriod = dateISO(fd, "periodStart");
  const periodStart = isPeriod(horizon)
    ? dayUTC(
        periodStartISO(horizon, inPeriod ? isoUTC(inPeriod) : todayISO()),
      )
    : null;

  return {
    title: str(fd, "title", 200),
    detail: text(fd, "detail"),
    why: text(fd, "why"),
    horizon,
    horizonAge:
      horizon === Horizon.AGE
        ? (num(fd, "horizonAge", { min: AGE_MIN, max: AGE_MAX }) ?? 25)
        : null,
    periodStart,
    // Cách đo. Để trống nếu mục tiêu không đo được bằng số.
    metric: str(fd, "metric", 120),
    target: str(fd, "target", 120),
    current: str(fd, "current", 120),
  };
}

export async function createGoal(areaSlug: string, fd: FormData) {
  await assertOwner();

  const f = goalFields(fd);
  if (!f.title) return;

  const area = await db.area.findUniqueOrThrow({ where: { slug: areaSlug } });

  await db.goal.create({ data: { areaId: area.id, ...f, title: f.title } });

  revalidateGoal(areaSlug);
}

export async function updateGoal(id: string, areaSlug: string, fd: FormData) {
  await assertOwner();

  const f = goalFields(fd);
  if (!f.title) return;

  await db.goal.update({ where: { id }, data: { ...f, title: f.title } });

  revalidateGoal(areaSlug);
}

/** Cập nhật riêng ô "đang ở đâu" — thứ duy nhất thay đổi thường xuyên. */
export async function setGoalCurrent(
  id: string,
  areaSlug: string,
  fd: FormData,
) {
  await assertOwner();
  await db.goal.update({
    where: { id },
    data: { current: str(fd, "current", 120) },
  });
  revalidateGoal(areaSlug);
}

export async function setGoalStatus(
  id: string,
  status: GoalStatus,
  areaSlug: string,
) {
  await assertOwner();
  await db.goal.update({
    where: { id },
    data: {
      status,
      doneAt: status === GoalStatus.DONE ? new Date() : null,
      // Quay lại làm tiếp thì lý do bỏ không còn đúng nữa
      dropReason: status === GoalStatus.DROPPED ? undefined : null,
    },
  });
  revalidateGoal(areaSlug);
}

/**
 * Bỏ một mục tiêu, kèm lý do.
 *
 * OS-DESIGN §3① nói bỏ đúng lúc là kỹ năng chứ không phải thất bại — nhưng
 * chỉ đúng nếu có ghi lại vì sao. Không có ô lý do thì sáu tháng sau nhìn vào
 * danh sách "đã bỏ" chỉ thấy một danh sách thất bại.
 */
export async function dropGoal(id: string, areaSlug: string, fd: FormData) {
  await assertOwner();

  await db.goal.update({
    where: { id },
    data: {
      status: GoalStatus.DROPPED,
      dropReason: text(fd, "dropReason"),
      doneAt: null,
    },
  });

  revalidateGoal(areaSlug);
}

/**
 * Chấm kết quả một cam kết đã hết kỳ, kèm tự sự.
 *
 * Ba câu hỏi cố tình giống hệt nhật ký ngày (chuyện gì · vì sao · đổi gì) để
 * không phải học thêm khung tư duy thứ hai.
 *
 * Câu thứ hai mới là câu đáng giá. Biết "tuần này không đạt" thì chẳng đổi
 * được gì; biết "không đạt vì tối nào cũng ăn ngoài sau ca làm" thì tuần sau
 * mới có thứ để sửa. Nên nó là ô duy nhất được nhắc là nên viết.
 */
export async function reviewGoal(id: string, areaSlug: string, fd: FormData) {
  await assertOwner();

  const outcome = enumOf(fd, "outcome", OUTCOMES, GoalOutcome.PARTIAL);

  await db.goal.update({
    where: { id },
    data: {
      outcome,
      reviewWhat: text(fd, "reviewWhat"),
      reviewWhy: text(fd, "reviewWhy"),
      reviewNext: text(fd, "reviewNext"),
      reviewedAt: new Date(),
      // Kéo status theo cho khớp: đã chấm rồi thì cam kết coi như đóng lại.
      status:
        outcome === GoalOutcome.SUCCESS ? GoalStatus.DONE : GoalStatus.DOING,
      doneAt: outcome === GoalOutcome.SUCCESS ? new Date() : null,
    },
  });

  revalidateGoal(areaSlug);
}

/** Chấm nhanh, chưa viết gì — để lúc bận vẫn đóng được kỳ. */
export async function setGoalOutcome(
  id: string,
  areaSlug: string,
  outcome: GoalOutcome,
) {
  await assertOwner();

  await db.goal.update({
    where: { id },
    data: {
      outcome,
      reviewedAt: new Date(),
      status:
        outcome === GoalOutcome.SUCCESS ? GoalStatus.DONE : GoalStatus.DOING,
      doneAt: outcome === GoalOutcome.SUCCESS ? new Date() : null,
    },
  });

  revalidateGoal(areaSlug);
}

/**
 * Chép một cam kết sang kỳ kế tiếp.
 *
 * "Tuần này không uống nước ngọt" hiếm khi là chuyện của đúng một tuần. Không
 * có nút này thì mỗi tuần phải gõ lại từ đầu, và sau ba tuần là bỏ.
 *
 * Cố ý KHÔNG chép phần tự sự sang: kỳ mới bắt đầu trắng, còn bài học của kỳ
 * cũ nằm lại đúng chỗ của nó.
 */
export async function repeatGoal(id: string, areaSlug: string) {
  await assertOwner();

  const g = await db.goal.findUniqueOrThrow({ where: { id } });
  if (!isPeriod(g.horizon) || !g.periodStart) return;

  const nextStart = dayUTC(
    nextPeriodStartISO(g.horizon, isoUTC(g.periodStart)),
  );

  // Đã chép rồi thì thôi — bấm hai lần không tạo hai bản.
  const existing = await db.goal.findFirst({
    where: {
      areaId: g.areaId,
      title: g.title,
      horizon: g.horizon,
      periodStart: nextStart,
    },
  });
  if (existing) return;

  await db.goal.create({
    data: {
      areaId: g.areaId,
      title: g.title,
      detail: g.detail,
      why: g.why,
      horizon: g.horizon,
      periodStart: nextStart,
      metric: g.metric,
      target: g.target,
      status: GoalStatus.NOT_STARTED,
    },
  });

  revalidateGoal(areaSlug);
}

export async function deleteGoal(id: string, areaSlug: string) {
  await assertOwner();
  await db.goal.delete({ where: { id } });
  revalidateGoal(areaSlug);
}

/* ---------------- Nguyên tắc ---------------- */

function principleFields(fd: FormData) {
  return {
    text: text(fd, "text", 500),
    why: text(fd, "why"),
    kind: enumOf(fd, "kind", PRINCIPLE_KINDS, PrincipleKind.DO),
  };
}

export async function createPrinciple(areaSlug: string, fd: FormData) {
  await assertOwner();

  const f = principleFields(fd);
  if (!f.text) return;

  const area = await db.area.findUniqueOrThrow({ where: { slug: areaSlug } });

  await db.principle.create({
    data: { areaId: area.id, ...f, text: f.text },
  });

  revalidatePath(`/os/a/${areaSlug}`);
  revalidatePath("/os");
}

export async function updatePrinciple(
  id: string,
  areaSlug: string,
  fd: FormData,
) {
  await assertOwner();

  const f = principleFields(fd);
  if (!f.text) return;

  await db.principle.update({ where: { id }, data: { ...f, text: f.text } });

  revalidatePath(`/os/a/${areaSlug}`);
  revalidatePath("/os");
}

export async function deletePrinciple(id: string, areaSlug: string) {
  await assertOwner();
  await db.principle.delete({ where: { id } });
  revalidatePath(`/os/a/${areaSlug}`);
  revalidatePath("/os");
}

/* ---------------- Đang dùng ---------------- */

export async function createItem(areaSlug: string, fd: FormData) {
  await assertOwner();

  const name = str(fd, "name", 200);
  if (!name) return;

  const area = await db.area.findUniqueOrThrow({ where: { slug: areaSlug } });
  const status = enumOf(fd, "status", ITEM_STATUSES, ItemStatus.WANT);

  await db.item.create({
    data: {
      areaId: area.id,
      name,
      kind: str(fd, "kind", 60),
      status,
      // Trần 10 triệu ¥ — hơn thế thì chắc chắn là gõ thừa số 0.
      cost: num(fd, "cost", { min: 0, max: 10_000_000 }),
      startedAt: status === ItemStatus.USING ? new Date() : null,
    },
  });

  revalidatePath(`/os/a/${areaSlug}`);
}

/** Sửa toàn bộ một món: tên, loại, giá, ghi chú. */
export async function updateItem(id: string, areaSlug: string, fd: FormData) {
  await assertOwner();

  const name = str(fd, "name", 200);
  if (!name) return;

  await db.item.update({
    where: { id },
    data: {
      name,
      kind: str(fd, "kind", 60),
      cost: num(fd, "cost", { min: 0, max: 10_000_000 }),
      note: text(fd, "note"),
      verdict: text(fd, "verdict"),
    },
  });

  revalidatePath(`/os/a/${areaSlug}`);
}

export async function setItemStatus(
  id: string,
  status: ItemStatus,
  areaSlug: string,
) {
  await assertOwner();

  const item = await db.item.findUniqueOrThrow({ where: { id } });

  await db.item.update({
    where: { id },
    data: {
      status,
      // Tự ghi mốc thời gian để sau này biết "dùng bao lâu rồi bỏ".
      startedAt:
        status === ItemStatus.USING && !item.startedAt ? new Date() : item.startedAt,
      endedAt: status === ItemStatus.DROPPED ? new Date() : null,
    },
  });

  revalidatePath(`/os/a/${areaSlug}`);
}

export async function setItemVerdict(
  id: string,
  areaSlug: string,
  fd: FormData,
) {
  await assertOwner();
  await db.item.update({
    where: { id },
    data: { verdict: text(fd, "verdict") },
  });
  revalidatePath(`/os/a/${areaSlug}`);
}

export async function deleteItem(id: string, areaSlug: string) {
  await assertOwner();
  await db.item.delete({ where: { id } });
  revalidatePath(`/os/a/${areaSlug}`);
}

/* ---------------- Ký ức + ảnh ---------------- */

function revalidateMemory(areaSlug?: string | null) {
  if (areaSlug) revalidatePath(`/os/a/${areaSlug}`);
  revalidatePath("/os/journey");
  revalidatePath("/os/log");
  revalidatePath("/journey");
  revalidatePath("/photos");
}

export async function createMemory(areaSlug: string | null, fd: FormData) {
  await assertOwner();

  const title = str(fd, "title", 200);
  const date = dateISO(fd, "date");
  if (!title || !date) return;

  const area = areaSlug
    ? await db.area.findUnique({ where: { slug: areaSlug } })
    : null;

  const visibility = bool(fd, "public") ? Visibility.PUBLIC : Visibility.PRIVATE;

  // Ảnh xử lý trước: nếu một tấm hỏng thì không tạo ký ức rỗng.
  const files = fd.getAll("photos").filter((f): f is File => f instanceof File);
  const saved = [];
  for (const f of files) {
    const s = await saveImage(f);
    if (s) saved.push(s);
  }

  try {
    await db.memory.create({
      data: {
        areaId: area?.id ?? null,
        // Ngày CHUYỆN XẢY RA, không phải ngày nhập — nên lùi được về tuổi thơ.
        // dateISO() đã dựng ở nửa đêm UTC: thiếu quy ước đó là lệch một ngày,
        // vì ở JST (UTC+9) nửa đêm địa phương quy về UTC là hôm trước.
        date,
        title,
        body: text(fd, "body"),
        learned: text(fd, "learned"),
        place: str(fd, "place", 120),
        people: str(fd, "people", 200),
        visibility,
        photos: {
          create: saved.map((s) => ({
            url: s.url,
            thumbUrl: s.thumbUrl,
            width: s.width,
            height: s.height,
            bytes: s.bytes,
            takenAt: s.takenAt,
            areaId: area?.id ?? null,
            visibility, // ảnh theo quyền của ký ức chứa nó
          })),
        },
      },
    });
  } catch (e) {
    // Ảnh đã nằm trên đĩa trước khi ghi database. Nếu bước ghi hỏng thì phải
    // dọn, nếu không thư mục uploads đầy file không ai tham chiếu tới.
    for (const s of saved) {
      await deleteUpload(s.url);
      await deleteUpload(s.thumbUrl);
    }
    throw e;
  }

  revalidateMemory(areaSlug);
}

/**
 * Sửa một ký ức đã ghi.
 *
 * Thiếu hàm này là lỗi dùng nặng nhất của cả hệ thống: gõ sai một chữ trong
 * tiêu đề thì cách duy nhất là xóa rồi nhập lại — và xóa ký ức là xóa luôn
 * ảnh kèm theo. Ảnh cũ giữ nguyên; ảnh mới chọn thêm sẽ được nối vào.
 */
export async function updateMemory(
  id: string,
  areaSlug: string | null,
  fd: FormData,
) {
  await assertOwner();

  const title = str(fd, "title", 200);
  const date = dateISO(fd, "date");
  if (!title || !date) return;

  const existing = await db.memory.findUniqueOrThrow({ where: { id } });

  /**
   * Đổi lĩnh vực của ký ức.
   *
   * Trước đây `updateMemory` không đụng `areaId`, nên ghi nhầm lĩnh vực là
   * phải xóa đi ghi lại — kéo theo mất luôn ảnh đã up. Chuỗi rỗng nghĩa là
   * "không thuộc lĩnh vực nào" (cột này nullable), khác hẳn với "không gửi
   * trường này lên" — nên phải phân biệt bằng `has`, không dùng `str()`.
   */
  const rawArea = fd.get("areaId");
  const areaId =
    typeof rawArea === "string"
      ? rawArea === ""
        ? null
        : ((await db.area.findUnique({
            where: { id: rawArea },
            select: { id: true },
          }))?.id ?? existing.areaId)
      : existing.areaId;

  const files = fd.getAll("photos").filter((f): f is File => f instanceof File);
  const saved = [];
  for (const f of files) {
    const s = await saveImage(f);
    if (s) saved.push(s);
  }

  try {
    await db.memory.update({
      where: { id },
      data: {
        date,
        title,
        areaId,
        body: text(fd, "body"),
        learned: text(fd, "learned"),
        place: str(fd, "place", 120),
        people: str(fd, "people", 200),
        photos: {
          create: saved.map((s) => ({
            url: s.url,
            thumbUrl: s.thumbUrl,
            width: s.width,
            height: s.height,
            bytes: s.bytes,
            takenAt: s.takenAt,
            areaId,
            visibility: existing.visibility, // ảnh mới theo quyền của ký ức
          })),
        },
      },
    });
  } catch (e) {
    for (const s of saved) {
      await deleteUpload(s.url);
      await deleteUpload(s.thumbUrl);
    }
    throw e;
  }

  revalidateMemory(areaSlug);
}

export async function toggleMemoryVisibility(id: string, areaSlug?: string) {
  await assertOwner();

  const m = await db.memory.findUniqueOrThrow({ where: { id } });
  const next =
    m.visibility === Visibility.PUBLIC ? Visibility.PRIVATE : Visibility.PUBLIC;

  // Ảnh phải đổi theo, nếu không sẽ có ký ức công khai mà ảnh 404
  // hoặc tệ hơn: ký ức riêng tư mà ảnh vẫn xem được.
  await db.$transaction([
    db.memory.update({ where: { id }, data: { visibility: next } }),
    db.photo.updateMany({ where: { memoryId: id }, data: { visibility: next } }),
  ]);

  revalidateMemory(areaSlug);
}

export async function deleteMemory(id: string, areaSlug?: string) {
  await assertOwner();

  const photos = await db.photo.findMany({
    where: { memoryId: id },
    select: { url: true, thumbUrl: true },
  });

  await db.memory.delete({ where: { id } }); // photo xóa theo (onDelete: Cascade)

  // Xóa file thật, nếu không thư mục uploads sẽ đầy rác không ai biết.
  for (const p of photos) {
    await deleteUpload(p.url);
    if (p.thumbUrl) await deleteUpload(p.thumbUrl);
  }

  revalidateMemory(areaSlug);
}

/* ---------------- Ảnh ---------------- */

/**
 * Chú thích ảnh. Cột `caption` đã có từ đầu và đã được hiển thị ở lưới ảnh
 * lẫn Lightbox, nhưng chưa từng có chỗ nhập — nên nó luôn rỗng.
 */
export async function setPhotoCaption(
  id: string,
  areaSlug: string | null,
  fd: FormData,
) {
  await assertOwner();
  await db.photo.update({
    where: { id },
    data: { caption: text(fd, "caption", 500) },
  });
  revalidateMemory(areaSlug);
}

/** Xóa một tấm ảnh khỏi ký ức, kèm file thật trên đĩa. */
/**
 * Ảnh tiến trình — ảnh gắn thẳng vào lĩnh vực, KHÔNG thuộc ký ức nào.
 *
 * Vì sao cần loại ảnh không có ký ức: da, tóc, cơ thể đổi quá chậm để nhớ, và
 * bạn nhìn mình mỗi ngày nên không bao giờ thấy nó đổi — trí nhớ về ngoại hình
 * của chính mình là thứ kém tin cậy nhất. Với những lĩnh vực đó thì **ảnh
 * chính là biểu đồ**, cùng vai trò với Số đo ở lĩnh vực đo được bằng số.
 *
 * Bắt mỗi tấm phải kèm một "ký ức" là bắt bịa ra một câu chuyện cho việc chụp
 * mặt mình tháng một lần. `Photo.memoryId` vốn đã nullable — chỗ này chỉ là
 * dùng đúng điều schema cho phép từ đầu.
 *
 * `takenAt` lấy từ EXIF nếu ảnh có; không có thì để null và giao diện xếp theo
 * ngày tải lên. Ảnh tiến trình mặc định RIÊNG TƯ, không kế thừa gì.
 */
export async function uploadAreaPhotos(areaSlug: string, fd: FormData) {
  await assertOwner();

  const area = await db.area.findUniqueOrThrow({ where: { slug: areaSlug } });

  const files = fd.getAll("photos").filter((f): f is File => f instanceof File);
  const saved = [];
  for (const f of files) {
    const s = await saveImage(f);
    if (s) saved.push(s);
  }
  if (saved.length === 0) return;

  const caption = str(fd, "caption", 200);

  try {
    await db.photo.createMany({
      data: saved.map((s) => ({
        url: s.url,
        thumbUrl: s.thumbUrl,
        width: s.width,
        height: s.height,
        bytes: s.bytes,
        takenAt: s.takenAt,
        caption,
        areaId: area.id,
        visibility: Visibility.PRIVATE,
      })),
    });
  } catch (e) {
    // Ghi database hỏng thì phải dọn file đã nằm trên đĩa, nếu không thư mục
    // uploads sẽ đầy dần bằng những tấm không bản ghi nào trỏ tới.
    for (const s of saved) {
      await deleteUpload(s.url);
      await deleteUpload(s.thumbUrl);
    }
    throw e;
  }

  revalidatePath(`/os/a/${areaSlug}`);
}

/**
 * Đổi chỗ ảnh với tấm liền kề TRONG CÙNG một ký ức.
 *
 * Focus sắp xếp được từ lâu, ảnh thì chưa — nên tấm đại diện của một ký ức
 * (và tấm đứng đầu trên /journey, /photos) là tấm tình cờ up trước, không phải
 * tấm đáng nhìn nhất. Cùng cách làm với `reorderFocusItem`: gán lại cả cột
 * `order` theo vị trí, vì dữ liệu cũ đang cùng `order = 0` hết.
 */
export async function reorderPhoto(
  id: string,
  areaSlug: string | null,
  dir: "up" | "down",
) {
  await assertOwner();

  const photo = await db.photo.findUniqueOrThrow({
    where: { id },
    select: { memoryId: true },
  });
  if (!photo.memoryId) return; // ảnh rời, không thuộc ký ức nào thì không có hàng để xếp

  const siblings = await db.photo.findMany({
    where: { memoryId: photo.memoryId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  const i = siblings.findIndex((s) => s.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i === -1 || j < 0 || j >= siblings.length) return;

  const next = [...siblings];
  [next[i], next[j]] = [next[j], next[i]];

  await db.$transaction(
    next.map((s, idx) =>
      db.photo.update({ where: { id: s.id }, data: { order: idx } }),
    ),
  );

  revalidateMemory(areaSlug ?? undefined);
}

export async function deletePhoto(id: string, areaSlug: string | null) {
  await assertOwner();

  const photo = await db.photo.findUniqueOrThrow({ where: { id } });
  await db.photo.delete({ where: { id } });

  await deleteUpload(photo.url);
  if (photo.thumbUrl) await deleteUpload(photo.thumbUrl);

  revalidateMemory(areaSlug);
}
