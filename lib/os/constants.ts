/**
 * Hằng số dùng chung. Để riêng khỏi dayActions.ts vì file `"use server"`
 * chỉ được phép export hàm async — export một hằng số ở đó là lỗi build.
 */

/** Trần cứng của NOW — ràng buộc quan trọng nhất của cả hệ thống. */
export const MAX_NOW = 3;

/** Một hiệp pomodoro = bao nhiêu phút. Đổi ở đây là đổi cả hệ thống. */
export const POMO_MIN = 50;

/**
 * Số ô hiện ở /os. 10 hiệp = 8h20 — trần của một ngày học thật sự căng, để
 * ngày nào vượt đích vẫn tick tiếp được. Đây CHỈ là số ô hiển thị; đích mỗi
 * ngày nằm ở `StudyGoal.dailyPomo`.
 */
export const POMO_SLOTS = 10;

/**
 * Checklist học tiếng Nhật mỗi ngày ở trang nhật ký — CHECKBOX THUẦN để biết
 * "hôm nay học gì". Cố ý KHÔNG nối với pomodoro / giờ / đợt N3: chỉ tick cho
 * nhớ, lưu vào `DailyLog.study`.
 *
 * `slots` > 1 = việc dài chia thành nhiều ô (mỗi ô ~1 hiệp). Đổi danh sách này
 * là đổi cả checklist, không cần sửa schema hay chỗ nào khác.
 */
export type StudyTask = {
  key: string;
  label: string;
  icon: string;
  /** Số ô tick (mặc định 1). vd Grammar/Vocab = 3. */
  slots?: number;
};

export const STUDY_TASKS: StudyTask[] = [
  { key: "anki", label: "Ôn Anki", icon: "🗂️" },
  { key: "reading", label: "Reading", icon: "📖" },
  { key: "listening", label: "Listening", icon: "🎧" },
  { key: "kaiwa", label: "Kaiwa", icon: "🗣️" },
  { key: "grammar", label: "Grammar/Vocab", icon: "📝", slots: 3 },
  { key: "kanji", label: "Kanji", icon: "🈶" },
];

/** Mọi key hợp lệ, phẳng ra: việc nhiều ô thành `key-1`, `key-2`… */
export const STUDY_KEYS: string[] = STUDY_TASKS.flatMap((t) =>
  (t.slots ?? 1) <= 1
    ? [t.key]
    : Array.from({ length: t.slots! }, (_, i) => `${t.key}-${i + 1}`),
);
