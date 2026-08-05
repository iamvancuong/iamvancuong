import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { OsNav } from "@/components/os/OsNav";
import { db } from "@/lib/db";

/**
 * /os không cho search engine index. Dữ liệu nằm sau đăng nhập, nhưng
 * cấu trúc đời tư cũng không cần xuất hiện trên Google.
 */
export const metadata: Metadata = {
  title: "Life OS",
  robots: { index: false, follow: false },
};

/**
 * Toàn bộ /os render theo từng lượt truy cập.
 *
 * Không được để dựng tĩnh: Dashboard phụ thuộc "hôm nay" và xoay nguyên tắc
 * theo ngày — trang tĩnh sẽ đóng băng ở thời điểm build và ngày mai vẫn hiện
 * dữ liệu của hôm qua. Trang cá nhân một người dùng thì render động cũng
 * không tốn gì.
 */
export const dynamic = "force-dynamic";

export default async function OsLayout({ children }: LayoutProps<"/os">) {
  // Sidebar sinh từ database — thêm lĩnh vực là nó tự hiện, không sửa code.
  const areas = await db.area.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: { slug: true, name: true, icon: true },
  });

  return (
    <Container width="os">
      <div className="flex gap-10 pb-24 md:pb-0">
        <OsNav areas={areas} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
