/**
 * Hằng số dùng chung. Để riêng khỏi dayActions.ts vì file `"use server"`
 * chỉ được phép export hàm async — export một hằng số ở đó là lỗi build.
 */

/** Trần cứng của NOW — ràng buộc quan trọng nhất của cả hệ thống. */
export const MAX_NOW = 3;
