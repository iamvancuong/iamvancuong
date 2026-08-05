import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, Horizon, PrincipleKind, ItemStatus } from "@prisma/client";

const db = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

/**
 * Tạo 7 lĩnh vực + một ít nội dung mẫu cho mỗi loại, để bạn thấy ngay
 * mỗi loại dùng vào việc gì.
 *
 * Chạy lại nhiều lần được — dùng upsert theo slug nên không tạo trùng.
 * Nội dung mẫu chỉ thêm khi lĩnh vực đó đang trống, nên nó không bao giờ
 * ghi đè thứ bạn tự viết.
 */

const AREAS = [
  {
    slug: "tieng-nhat",
    name: "Tiếng Nhật",
    tagline: "Tôi đang ở đâu trên đường tới N2?",
    icon: "Languages",
  },
  {
    slug: "cong-viec",
    name: "Công việc",
    tagline: "Tôi có đang tiến gần một công việc IT ở Nhật không?",
    icon: "Code",
  },
  {
    slug: "ban-than",
    name: "Bản thân",
    tagline: "Tôi đang chăm mình thế nào — da, tóc, quần áo, răng?",
    icon: "User",
  },
  {
    slug: "tinh-yeu",
    name: "Tình yêu",
    tagline: "Tôi muốn đối xử với người mình yêu ra sao?",
    icon: "Heart",
  },
  {
    slug: "gia-dinh",
    name: "Gia đình",
    tagline: "Tôi làm được gì cho bố mẹ?",
    icon: "Home",
  },
  {
    slug: "tien",
    name: "Tiền",
    tagline: "Tôi đang đứng ở đâu về tài chính?",
    icon: "Wallet",
  },
  {
    slug: "suc-khoe",
    name: "Sức khỏe",
    tagline: "Cơ thể tôi có đang khỏe lên không?",
    icon: "Activity",
  },
];

/** Nội dung mẫu — sửa hoặc xóa thoải mái, đây chỉ là ví dụ về cách dùng. */
const SAMPLES: Record<
  string,
  {
    goals?: { title: string; horizon: Horizon; horizonAge?: number; why?: string }[];
    principles?: { kind: PrincipleKind; text: string; why?: string }[];
    items?: { name: string; kind?: string; status: ItemStatus; verdict?: string }[];
  }
> = {
  "tieng-nhat": {
    goals: [
      {
        title: "Thi đậu JLPT N3",
        horizon: Horizon.THIS_YEAR,
        why: "N3 là cửa vào — chưa có nó thì hồ sơ xin việc IT gần như không được đọc.",
      },
      {
        title: "Đậu N2 và nói chuyện công việc được bằng tiếng Nhật",
        horizon: Horizon.AGE,
        horizonAge: 25,
      },
    ],
    principles: [
      {
        kind: PrincipleKind.DO,
        text: "Học mỗi ngày một ít, kể cả hôm mệt chỉ làm 10 phút Anki",
        why: "Đứt chuỗi tốn nhiều sức khôi phục hơn là duy trì.",
      },
      {
        kind: PrincipleKind.DONT,
        text: "Không chép lại từ vựng ra sổ hay file khác — Anki lo phần đó",
        why: "Chép ba nơi cho cảm giác chăm chỉ nhưng không nhớ thêm được gì.",
      },
    ],
    items: [{ name: "Anki", kind: "công cụ", status: ItemStatus.USING }],
  },

  "cong-viec": {
    goals: [
      {
        title: "Có 3 project thật đủ tốt để mang đi phỏng vấn",
        horizon: Horizon.THIS_YEAR,
      },
      {
        title: "Đang đi làm IT ở Nhật",
        horizon: Horizon.AGE,
        horizonAge: 25,
        why: "Đây là lý do tôi sang đây.",
      },
    ],
    principles: [
      {
        kind: PrincipleKind.DO,
        text: "Học xong thứ gì thì phải build ra được một thứ dùng được",
        why: "Xem hết khóa học không chứng minh được gì với người tuyển dụng.",
      },
      {
        kind: PrincipleKind.DONT,
        text: "Không tự nhận giỏi một kỹ năng nếu chưa có link chứng minh",
      },
    ],
  },

  "ban-than": {
    principles: [
      {
        kind: PrincipleKind.DO,
        text: "Quần áo ít nhưng vừa người, hơn nhiều mà rộng thùng thình",
      },
      {
        kind: PrincipleKind.DONT,
        text: "Không mua chỉ vì đang giảm giá",
        why: "Đồ mua vì giảm giá thường nằm trong tủ không mặc.",
      },
      {
        kind: PrincipleKind.DONT,
        text: "Không đổi cả routine skincare cùng lúc",
        why: "Đổi một lúc nhiều thứ thì không biết cái nào có tác dụng.",
      },
    ],
    items: [
      {
        name: "Sữa rửa mặt (điền tên thật)",
        kind: "skincare",
        status: ItemStatus.USING,
      },
      {
        name: "Kem chống nắng",
        kind: "skincare",
        status: ItemStatus.WANT,
        verdict: "Thứ đáng tiền nhất cho da về lâu dài.",
      },
    ],
  },

  "tinh-yeu": {
    principles: [
      {
        kind: PrincipleKind.DO,
        text: "Nói ra điều mình cần, đừng bắt người ta đoán",
      },
      {
        kind: PrincipleKind.DO,
        text: "Cãi nhau xong phải chốt lại, không để lửng lơ qua đêm",
      },
      {
        kind: PrincipleKind.DONT,
        text: "Không im lặng bỏ đi giữa lúc đang nói chuyện",
      },
      {
        kind: PrincipleKind.DONT,
        text: "Không đem chuyện của hai người ra kể với người thứ ba",
      },
    ],
  },

  "gia-dinh": {
    goals: [
      {
        title: "Gọi về nhà mỗi tuần một lần",
        horizon: Horizon.THIS_YEAR,
        why: "Bố mẹ không gọi trước vì sợ mình đang bận.",
      },
    ],
    principles: [
      {
        kind: PrincipleKind.DO,
        text: "Kể cả chuyện không hay, đừng chỉ báo tin tốt",
        why: "Báo mỗi tin tốt thì thành người lạ lịch sự.",
      },
    ],
  },

  tien: {
    goals: [
      {
        title: "Có quỹ khẩn cấp bằng 3 tháng chi phí",
        horizon: Horizon.THIS_YEAR,
      },
    ],
    principles: [
      {
        kind: PrincipleKind.DO,
        text: "Ghi lại tổng chi mỗi ngày, chỉ một con số",
      },
      {
        kind: PrincipleKind.DONT,
        text: "Không để tiền ăn ngoài + mua sắm + giải trí vượt 20% thu nhập",
      },
    ],
  },

  "suc-khoe": {
    goals: [
      {
        title: "Lên 58kg mà vẫn giữ được dáng",
        horizon: Horizon.THIS_YEAR,
        why: "1m76 / 54kg đang quá gầy, ảnh hưởng cả sức lẫn ngoại hình.",
      },
    ],
    principles: [
      {
        kind: PrincipleKind.DO,
        text: "Ngủ trước 12h — thứ này kéo theo gần như mọi thứ khác",
      },
      {
        kind: PrincipleKind.DO,
        text: "Ăn đủ ba bữa, không đếm calo",
        why: "Vấn đề của mình là bỏ bữa, không phải ăn sai.",
      },
      { kind: PrincipleKind.DONT, text: "Không bỏ bữa sáng vì dậy muộn" },
    ],
  },
};

async function main() {
  console.log("Đang tạo 7 lĩnh vực...");

  for (const [i, a] of AREAS.entries()) {
    const area = await db.area.upsert({
      where: { slug: a.slug },
      update: { name: a.name, tagline: a.tagline, icon: a.icon, order: i },
      create: { ...a, order: i },
    });

    const sample = SAMPLES[a.slug];
    if (!sample) continue;

    // Chỉ thêm mẫu khi lĩnh vực đang trống — không bao giờ ghi đè bài tự viết.
    const [goals, principles, items] = await Promise.all([
      db.goal.count({ where: { areaId: area.id } }),
      db.principle.count({ where: { areaId: area.id } }),
      db.item.count({ where: { areaId: area.id } }),
    ]);

    if (goals === 0 && sample.goals) {
      await db.goal.createMany({
        data: sample.goals.map((g, order) => ({ ...g, areaId: area.id, order })),
      });
    }
    if (principles === 0 && sample.principles) {
      await db.principle.createMany({
        data: sample.principles.map((p, order) => ({
          ...p,
          areaId: area.id,
          order,
        })),
      });
    }
    if (items === 0 && sample.items) {
      await db.item.createMany({
        data: sample.items.map((it) => ({ ...it, areaId: area.id })),
      });
    }

    console.log(`  ✓ ${a.name}`);
  }

  const counts = {
    "lĩnh vực": await db.area.count(),
    "mục tiêu": await db.goal.count(),
    "nguyên tắc": await db.principle.count(),
    "đồ dùng": await db.item.count(),
  };
  console.log("Xong:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
