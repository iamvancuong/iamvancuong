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
