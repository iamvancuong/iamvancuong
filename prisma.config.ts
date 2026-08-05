import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 chuyển cấu hình datasource ra khỏi schema.prisma.
 * File này chỉ dùng cho CLI (migrate / db push / seed) — lúc chạy app
 * thì kết nối do lib/db.ts tạo qua driver adapter.
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
