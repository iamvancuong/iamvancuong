import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {
  FocusStatus,
  GoalStatus,
  Horizon,
  ItemStatus,
  PrincipleKind,
  PrismaClient,
  Visibility,
} from "@prisma/client";

/**
 * DỮ LIỆU MẪU — chỉ để xem thử giao diện, KHÔNG phải dữ liệu thật.
 *
 *   npm run db:demo         tạo
 *   npm run db:demo:clear   xóa sạch, trả về trạng thái trước đó
 *
 * Mọi bản ghi do file này tạo đều có dấu "[demo]" ở đâu đó, hoặc nằm trong
 * danh sách slug cố định bên dưới — nhờ vậy xóa được chính xác, không đụng
 * vào thứ bạn tự viết.
 */

const db = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

const UPLOADS = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");
const DEMO_DIR = "demo";

/**
 * Danh sách ngày do bản mẫu tạo ra.
 *
 * DailyLog không có cột nào để đánh dấu "đây là dữ liệu mẫu", nên ghi ra
 * file. Nhờ vậy `--clear` chỉ xóa đúng những ngày nó tạo, không đụng vào
 * ngày bạn tự ghi sau này.
 */
const MANIFEST = path.join(process.cwd(), "prisma", ".demo-days.json");

async function readManifest(): Promise<string[]> {
  try {
    return JSON.parse(await fs.readFile(MANIFEST, "utf8")) as string[];
  } catch {
    return [];
  }
}

const DEMO_POST_SLUGS = [
  "demo-thang-dau-tien-o-tokyo",
  "demo-tu-hoc-react-trong-30-ngay",
  "demo-chi-phi-song-mot-thang",
];

/* ---------------- tiện ích ---------------- */

const iso = (d: Date) => d.toISOString().slice(0, 10);
const dayUTC = (s: string) => new Date(`${s}T00:00:00.000Z`);

function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return iso(d);
}

/** Ngẫu nhiên nhưng lặp lại được — chạy hai lần ra cùng một bộ số. */
let seed = 20260804;
function rand(): number {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const between = (a: number, b: number) => Math.floor(a + rand() * (b - a + 1));

/** Ảnh giả: nền chuyển màu + chữ, đủ để kiểm tra hiển thị. */
async function makePhoto(label: string, hue: number) {
  const w = 1400;
  const h = 1000;
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue},45%,42%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 40) % 360},50%,26%)"/>
    </linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
      font-family="sans-serif" font-size="64" fill="rgba(255,255,255,.92)">${label}</text>
    <text x="50%" y="60%" text-anchor="middle" dominant-baseline="middle"
      font-family="sans-serif" font-size="26" fill="rgba(255,255,255,.6)">ảnh mẫu</text>
  </svg>`;

  await fs.mkdir(path.join(UPLOADS, DEMO_DIR), { recursive: true });

  const id = randomUUID();
  const rel = `${DEMO_DIR}/${id}.webp`;
  const relThumb = `${DEMO_DIR}/${id}_t.webp`;

  const full = await sharp(Buffer.from(svg))
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });
  await fs.writeFile(path.join(UPLOADS, rel), full.data);

  await sharp(Buffer.from(svg))
    .resize(480, 480, { fit: "inside" })
    .webp({ quality: 70 })
    .toFile(path.join(UPLOADS, relThumb));

  return {
    url: `/api/uploads/${rel}`,
    thumbUrl: `/api/uploads/${relThumb}`,
    width: full.info.width,
    height: full.info.height,
    bytes: full.info.size,
  };
}

/* ---------------- xóa ---------------- */

async function clear() {
  const memories = await db.memory.findMany({
    where: { title: { startsWith: "[demo]" } },
    select: { id: true },
  });
  const ids = memories.map((m) => m.id);

  await db.photo.deleteMany({
    where: { OR: [{ memoryId: { in: ids } }, { url: { contains: `/${DEMO_DIR}/` } }] },
  });
  await db.memory.deleteMany({ where: { id: { in: ids } } });
  await db.post.deleteMany({ where: { slug: { in: DEMO_POST_SLUGS } } });
  await db.focusItem.deleteMany({ where: { title: { startsWith: "[demo]" } } });
  await db.goal.deleteMany({ where: { title: { startsWith: "[demo]" } } });
  await db.principle.deleteMany({ where: { text: { startsWith: "[demo]" } } });
  await db.item.deleteMany({ where: { name: { startsWith: "[demo]" } } });

  // Chỉ xóa đúng những ngày bản mẫu đã tạo
  const demoDays = await readManifest();
  if (demoDays.length > 0) {
    await db.dailyLog.deleteMany({
      where: { date: { in: demoDays.map(dayUTC) } },
    });
    await fs.rm(MANIFEST, { force: true });
  }

  await fs.rm(path.join(UPLOADS, DEMO_DIR), { recursive: true, force: true });

  const left = await db.dailyLog.count();
  console.log(
    `Đã xóa dữ liệu mẫu (${demoDays.length} ngày nhật ký).` +
      (left > 0 ? ` Còn giữ nguyên ${left} ngày bạn tự ghi.` : ""),
  );
}

/* ---------------- tạo ---------------- */

const JOURNAL_WHAT = [
  "Học ngữ pháp N3 buổi sáng, chiều đi baito. Tối ngồi sửa cái bug CSS mãi không ra.",
  "Đi Shinjuku với bạn cùng lớp. Nói tiếng Nhật cả buổi, mệt nhưng vui.",
  "Ngày dài. Làm xong phần đăng nhập cho project cá nhân.",
  "Mưa cả ngày nên ở nhà. Cày Anki được 180 thẻ.",
  "Thi thử nghe hiểu, sai nhiều ở phần hội thoại dài.",
  "Đi siêu thị, nấu ăn ở nhà. Tiết kiệm được kha khá.",
  "Gọi về cho bố mẹ. Lâu rồi mới nói chuyện quá 30 phút.",
  "Tập gym buổi sáng, người nhẹ hẳn cả ngày.",
  "Cày TypeScript, hiểu ra generic dùng để làm gì.",
  "Hơi uể oải. Ngủ muộn hôm qua nên hôm nay không tập trung nổi.",
];

const JOURNAL_LEARN = [
  "Ngữ pháp 〜ようになる dùng khi nói về thay đổi dần dần.",
  "Đọc hiểu chậm vì cố dịch từng câu sang tiếng Việt. Phải bỏ thói quen đó.",
  "useEffect chạy sau khi render, không phải trước.",
  "Ăn sáng tử tế thì buổi sáng làm việc hiệu quả hơn hẳn.",
  "Nghe kém không phải vì không biết từ, mà vì không kịp tốc độ.",
  "Nói chuyện với người Nhật thật khác hẳn nghe file luyện thi.",
];

const JOURNAL_CHANGE = [
  "Mai dậy sớm hơn 30 phút để làm Anki trước khi đi học.",
  "Mai bắt đầu bằng việc khó nhất thay vì việc dễ nhất.",
  "Ngủ trước 12h, không mở điện thoại trên giường.",
  "Mai tập trung đúng một việc: đọc hiểu.",
  "Bớt xem video, ngồi build thật.",
];

async function seedDailyLogs() {
  const rows = [];

  for (let i = 0; i < 75; i++) {
    const d = daysAgo(i);

    // Bỏ trống vài ngày rải rác cho giống thật — có ngày quên ghi
    if (i > 6 && rand() < 0.18) continue;

    // 6 ngày gần nhất làm đủ 3 việc → tạo chuỗi đang chạy
    const streaking = i <= 5;
    const good = streaking || rand() < 0.55;

    const kSleep = streaking || rand() < 0.6;
    const kJapanese = good;
    const kEat = streaking || rand() < 0.75;

    const jpMin = kJapanese ? between(60, 130) : between(0, 45);
    const itMin = between(0, 110);

    rows.push({
      date: dayUTC(d),
      sleepAt: kSleep ? pick(["23:10", "23:35", "23:50"]) : pick(["00:40", "01:20", "02:05"]),
      jpMin,
      itMin,
      spend: rand() < 0.85 ? between(300, 4200) : null,
      kSleep,
      kJapanese,
      kEat,
      workout: rand() < 0.4,
      journalWhat: rand() < 0.75 ? pick(JOURNAL_WHAT) : null,
      journalLearn: rand() < 0.5 ? pick(JOURNAL_LEARN) : null,
      journalChange: rand() < 0.45 ? pick(JOURNAL_CHANGE) : null,
      publishable: rand() < 0.12,
    });
  }

  await db.dailyLog.createMany({ data: rows, skipDuplicates: true });

  // Ghi lại để lần sau `--clear` biết đúng ngày nào cần xóa
  await fs.writeFile(
    MANIFEST,
    JSON.stringify(rows.map((r) => iso(r.date)), null, 0),
  );

  console.log(`  ✓ ${rows.length} ngày nhật ký`);
}

async function seedFocus() {
  const areas = await db.area.findMany({ select: { id: true, slug: true } });
  const byslug = new Map(areas.map((a) => [a.slug, a.id]));

  const items = [
    { title: "[demo] Học 60 phút tiếng Nhật mỗi ngày", area: "tieng-nhat", status: FocusStatus.NOW, why: "N3 còn 4 tháng" },
    { title: "[demo] Làm xong portfolio", area: "cong-viec", status: FocusStatus.NOW, why: "Cần cái mang đi phỏng vấn" },
    { title: "[demo] Lên 58kg", area: "suc-khoe", status: FocusStatus.NOW, why: "" },
    { title: "[demo] Luyện kaiwa 2 buổi/tuần", area: "tieng-nhat", status: FocusStatus.NEXT, why: "Sau khi qua N3" },
    { title: "[demo] Viết CV tiếng Nhật", area: "cong-viec", status: FocusStatus.NEXT, why: "" },
    { title: "[demo] Học thêm Docker", area: "cong-viec", status: FocusStatus.LATER, why: "Chưa cần cho vị trí junior" },
    { title: "[demo] Đi Hokkaido", area: "life" in {} ? "life" : "gia-dinh", status: FocusStatus.LATER, why: "Để dành hè sau" },
    { title: "[demo] Học thêm tiếng Trung", area: "tieng-nhat", status: FocusStatus.NO, why: "Một ngoại ngữ một lúc là đủ" },
    { title: "[demo] Làm kênh YouTube", area: "cong-viec", status: FocusStatus.NO, why: "Tốn thời gian, chưa có gì để nói" },
  ];

  await db.focusItem.createMany({
    data: items.map((i, order) => ({
      title: i.title,
      areaId: byslug.get(i.area) ?? null,
      status: i.status,
      why: i.why || null,
      order,
    })),
  });
  console.log(`  ✓ ${items.length} việc trong Focus`);
}

async function seedGoalsAndItems() {
  const areas = await db.area.findMany({ select: { id: true, slug: true } });
  const byslug = new Map(areas.map((a) => [a.slug, a.id]));

  await db.goal.createMany({
    data: [
      { areaId: byslug.get("tieng-nhat")!, title: "[demo] Đạt 120/180 ở kỳ thi thử tháng 10", horizon: Horizon.THIS_YEAR, status: GoalStatus.DOING, why: "Cần biên an toàn trước kỳ thi thật" },
      { areaId: byslug.get("cong-viec")!, title: "[demo] Nộp hồ sơ 10 công ty IT", horizon: Horizon.NEXT_YEAR, status: GoalStatus.NOT_STARTED },
      { areaId: byslug.get("cong-viec")!, title: "[demo] Đã đi làm IT toàn thời gian ở Nhật", horizon: Horizon.AGE, horizonAge: 25, status: GoalStatus.NOT_STARTED, why: "Đây là lý do tôi sang đây" },
      { areaId: byslug.get("tien")!, title: "[demo] Tiết kiệm được 1 triệu yên", horizon: Horizon.AGE, horizonAge: 27, status: GoalStatus.NOT_STARTED },
      { areaId: byslug.get("gia-dinh")!, title: "[demo] Đưa bố mẹ sang Nhật chơi một lần", horizon: Horizon.AGE, horizonAge: 30, status: GoalStatus.NOT_STARTED, why: "Bố mẹ chưa ra nước ngoài bao giờ" },
      { areaId: byslug.get("ban-than")!, title: "[demo] Sống gọn gàng, không mua đồ thừa", horizon: Horizon.LIFE, status: GoalStatus.DOING },
      { areaId: byslug.get("tieng-nhat")!, title: "[demo] Đọc xong Minna no Nihongo II", horizon: Horizon.THIS_YEAR, status: GoalStatus.DONE, doneAt: new Date() },
      { areaId: byslug.get("suc-khoe")!, title: "[demo] Chạy bộ mỗi sáng", horizon: Horizon.THIS_YEAR, status: GoalStatus.DROPPED, dropReason: "Sáng nào cũng phải đi học sớm, không khả thi. Chuyển sang gym buổi tối." },
    ],
  });

  await db.item.createMany({
    data: [
      { areaId: byslug.get("ban-than")!, name: "[demo] CeraVe Foaming Cleanser", kind: "skincare", status: ItemStatus.USING, startedAt: new Date(Date.now() - 90 * 864e5), verdict: "Da đỡ dầu hẳn sau 3 tuần. Giữ." },
      { areaId: byslug.get("ban-than")!, name: "[demo] Dầu gội bạc hà rẻ tiền", kind: "tóc", status: ItemStatus.DROPPED, startedAt: new Date(Date.now() - 180 * 864e5), endedAt: new Date(Date.now() - 100 * 864e5), verdict: "Dùng 2 tháng không thấy khác gì, tóc còn khô hơn. Không mua lại." },
      { areaId: byslug.get("ban-than")!, name: "[demo] Kem chống nắng Anessa", kind: "skincare", status: ItemStatus.WANT },
      { areaId: byslug.get("tieng-nhat")!, name: "[demo] Shin Kanzen Master N3 — 読解", kind: "sách", status: ItemStatus.USING, startedAt: new Date(Date.now() - 40 * 864e5) },
      { areaId: byslug.get("tieng-nhat")!, name: "[demo] App luyện nghe X", kind: "app", status: ItemStatus.DROPPED, verdict: "Quảng cáo nhiều, nội dung mỏng. Bỏ sau 2 tuần." },
      { areaId: byslug.get("cong-viec")!, name: "[demo] Khóa TypeScript trên Udemy", kind: "khóa học", status: ItemStatus.USING, cost: 2400 },
    ],
  });

  await db.principle.createMany({
    data: [
      { areaId: byslug.get("gia-dinh")!, kind: PrincipleKind.DO, text: "[demo] Gọi về nhà tối Chủ nhật, thành lệ luôn", why: "Có lịch cố định thì không phải nhớ" },
      { areaId: byslug.get("tien")!, kind: PrincipleKind.DONT, text: "[demo] Không mua gì trên 5000¥ mà chưa để qua một đêm" },
      { areaId: byslug.get("cong-viec")!, kind: PrincipleKind.DO, text: "[demo] Mỗi thứ học xong phải đẻ ra một commit" },
    ],
  });

  console.log("  ✓ mục tiêu, đồ dùng, nguyên tắc");
}

async function seedMemories() {
  const areas = await db.area.findMany({ select: { id: true, slug: true } });
  const byslug = new Map(areas.map((a) => [a.slug, a.id]));

  const list: {
    date: string;
    title: string;
    body: string;
    learned?: string;
    place?: string;
    people?: string;
    area?: string;
    pub: boolean;
    photos: [string, number][];
  }[] = [
    {
      date: "2009-06-12", title: "[demo] Mùa hè ở quê", place: "Quảng Trị", area: "gia-dinh", pub: false,
      body: "Nghỉ hè về quê ngoại. Cả ngày lội ruộng, tối ngồi trước sân nghe người lớn nói chuyện.",
      photos: [["2009", 30]],
    },
    {
      date: "2015-09-05", title: "[demo] Ngày đầu vào cấp ba", place: "Quảng Trị", area: "gia-dinh", pub: false,
      body: "Áo trắng còn hồ cứng. Lúc đó chưa nghĩ mười năm sau mình sẽ ở Nhật.",
      photos: [],
    },
    {
      date: "2024-04-02", title: "[demo] Ngày đầu tiên đặt chân xuống Narita", place: "Tokyo", people: "một mình", area: "cong-viec", pub: true,
      body: "Máy bay hạ cánh lúc chiều. Trời lạnh hơn tôi tưởng. Kéo hai vali đi tàu về ký túc, lạc mất 40 phút vì không đọc nổi bảng chỉ dẫn.",
      learned: "Chuẩn bị kỹ đến đâu thì ngày đầu vẫn sẽ có thứ ngoài dự tính.",
      photos: [["Narita", 210], ["Tokyo", 240]],
    },
    {
      date: "2024-04-20", title: "[demo] Buổi học tiếng Nhật đầu tiên", place: "Trường Nhật ngữ", area: "tieng-nhat", pub: true,
      body: "Lớp có người Việt, Nepal, Trung Quốc. Cô giáo nói tiếng Nhật từ đầu tới cuối, tôi hiểu chắc 20%.",
      learned: "Không hiểu hết cũng không sao. Ngồi đủ buổi là đã hơn hôm qua.",
      photos: [["教室", 190]],
    },
    {
      date: "2024-07-14", title: "[demo] Baito đầu tiên — quán cơm", place: "Shinjuku", area: "cong-viec", pub: false,
      body: "Ngày đầu bưng bê, làm rơi một cái đĩa. Bác quản lý chỉ cười rồi bảo mai tới sớm 10 phút.",
      learned: "Người ta không khó tính như mình tưởng. Cái mình sợ phần lớn là tự nghĩ ra.",
      photos: [["Baito", 20]],
    },
    {
      date: "2025-01-01", title: "[demo] Hatsumode đầu năm", place: "Meiji Jingu", people: "bạn cùng lớp", pub: true,
      body: "Xếp hàng hơn một tiếng trong giá lạnh để rút quẻ. Ra 小吉.",
      photos: [["初詣", 340], ["Meiji", 300]],
    },
    {
      date: "2025-04-05", title: "[demo] Hanami ở công viên Ueno", place: "Ueno", people: "bạn bè", pub: true,
      body: "Hoa nở đúng đợt. Trải bạt ngồi từ trưa tới tối, ăn bento và nói chuyện linh tinh.",
      learned: "Một năm ở Nhật chỉ có đúng một tuần như thế này.",
      photos: [["花見", 330], ["Ueno", 350], ["Sakura", 310]],
    },
    {
      date: "2025-11-10", title: "[demo] Lần đầu thuyết trình bằng tiếng Nhật", place: "Trường", area: "tieng-nhat", pub: true,
      body: "Năm phút trước lớp. Tay run, đọc vấp hai chỗ, nhưng đi hết bài.",
      learned: "Chuẩn bị kỹ thì run vẫn run, nhưng vẫn nói được.",
      photos: [],
    },
    {
      date: daysAgo(21), title: "[demo] Đi Kamakura một mình", place: "Kamakura", pub: true,
      body: "Đi tàu Enoden dọc bờ biển. Ngồi ở ga Kamakurakokomae rất lâu chỉ để nhìn biển.",
      photos: [["鎌倉", 200], ["海", 195]],
    },
    {
      date: daysAgo(9), title: "[demo] Nhận kết quả thi thử", area: "tieng-nhat", pub: false,
      body: "97/180. Đậu sát nút. Phần đọc hiểu kéo xuống.",
      learned: "Đọc chậm là vấn đề lớn nhất lúc này, không phải từ vựng.",
      photos: [],
    },
    {
      date: daysAgo(3), title: "[demo] Mua được cái bàn làm việc tử tế", place: "Tokyo", area: "ban-than", pub: false,
      body: "Săn được ở cửa hàng đồ cũ, 4000 yên. Ngồi học thoải mái hơn hẳn.",
      photos: [["机", 25]],
    },
  ];

  let count = 0;
  for (const m of list) {
    const vis = m.pub ? Visibility.PUBLIC : Visibility.PRIVATE;
    const photos = [];
    for (const [label, hue] of m.photos) {
      const p = await makePhoto(label, hue);
      photos.push({ ...p, visibility: vis, takenAt: dayUTC(m.date) });
      count++;
    }

    await db.memory.create({
      data: {
        date: dayUTC(m.date),
        title: m.title,
        body: m.body,
        learned: m.learned ?? null,
        place: m.place ?? null,
        people: m.people ?? null,
        areaId: m.area ? (byslug.get(m.area) ?? null) : null,
        visibility: vis,
        photos: { create: photos },
      },
    });
  }

  console.log(`  ✓ ${list.length} ký ức, ${count} ảnh`);
}

async function seedPosts() {
  const tags = await db.tag.findMany();
  const t = (slug: string) => {
    const found = tags.find((x) => x.slug === slug);
    return found ? [{ id: found.id }] : [];
  };

  const posts = [
    {
      slug: DEMO_POST_SLUGS[0],
      title: "[demo] Tháng đầu tiên ở Tokyo",
      excerpt: "Những thứ không ai nói trước với tôi: tàu, rác, và cảm giác không hiểu gì cả.",
      tags: t("japan-life"),
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(Date.now() - 30 * 864e5),
      titleJa: "[demo] 東京での最初の一ヶ月",
      bodyJa: "日本に来て一ヶ月がたちました。\n\n一番大変だったのは電車です。乗り換えが多くて、最初の一週間は毎日迷いました。\n\nゴミの分別も難しかったです。でも、近所の人が丁寧に教えてくれました。\n\n言葉が分からなくても、生活はなんとかなります。少しずつ慣れていきたいです。",
      body: `Tôi hạ cánh xuống Narita một chiều đầu tháng Tư, mang theo hai vali và một vốn tiếng Nhật đủ để chào hỏi.

## Tàu điện

Không ai nói trước với tôi rằng phần khó nhất không phải là mua vé, mà là **đổi tàu**. Ga Shinjuku có hơn hai trăm lối ra. Tuần đầu tôi lạc gần như mỗi ngày.

Thứ cứu tôi không phải là ứng dụng bản đồ, mà là thói quen: đi sớm hơn giờ hẹn 30 phút, và chấp nhận rằng mình sẽ đi nhầm.

## Rác

Ở quê tôi, rác là rác. Ở đây rác có lịch:

- Thứ Hai, thứ Năm: rác cháy được
- Thứ Tư: chai nhựa
- Thứ Bảy cách tuần: giấy

Tuần đầu tôi để nhầm túi ra ngoài. Sáng hôm sau nó vẫn nằm đó, kèm một tờ giấy dán lên. Không ai mắng, nhưng cũng không ai dọn hộ.

> Nhiều quy tắc ở đây không có ai giám sát. Nó vận hành được vì mọi người đều làm.

## Cảm giác không hiểu gì cả

Đây mới là thứ mệt nhất. Không phải mệt vì khó, mà mệt vì **liên tục**. Nghe không hiểu, đọc không hiểu, hỏi thì người ta trả lời nhanh quá cũng không hiểu.

Sau khoảng ba tuần thì đỡ hơn — không phải vì tôi giỏi lên, mà vì tôi bớt sợ chuyện không hiểu.

Nếu bạn cũng sắp sang: chuẩn bị kỹ đến đâu thì tháng đầu vẫn sẽ có thứ ngoài dự tính. Đó là chuyện bình thường.`,
    },
    {
      slug: DEMO_POST_SLUGS[1],
      title: "[demo] Tự học React trong 30 ngày — cái gì có tác dụng",
      excerpt: "Tôi xem hết ba khóa học rồi vẫn không build nổi gì. Đây là chỗ tôi làm sai.",
      tags: t("dev"),
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(Date.now() - 12 * 864e5),
      body: `Tôi mất khoảng hai tháng đầu để nhận ra một điều: **xem khóa học không phải là học**.

## Cái không có tác dụng

Xem video từ đầu đến cuối rồi gật gù. Cảm giác rất dễ chịu vì mọi thứ đều có vẻ hợp lý — cho tới lúc mở editor trắng ra và không gõ nổi dòng nào.

Chép lại code trong video cũng vậy. Chép xong chạy được, nhưng đổi một chỗ là hỏng.

## Cái có tác dụng

**Build một thứ mình thật sự cần.** Với tôi là trang web này. Không phải to-do app trong tutorial.

Khi bạn cần một tính năng cụ thể, bạn sẽ tự đi tìm và tự hiểu:

\`\`\`tsx
const [value, setValue] = useState("");
\`\`\`

Câu đó tôi đọc chắc mười lần trong tutorial mà không nhớ. Tới lúc cần một ô nhập liệu tự lưu, tôi hiểu nó trong năm phút.

## Ba việc tôi làm mỗi ngày

1. Viết code ít nhất 30 phút, kể cả hôm mệt
2. Mỗi thứ học được phải đẻ ra một commit
3. Chỗ nào không hiểu thì ghi lại, không lướt qua

Sau 30 ngày tôi không giỏi React. Nhưng tôi có một thứ đang chạy thật, và đó là khác biệt lớn nhất.`,
    },
    {
      slug: DEMO_POST_SLUGS[2],
      title: "[demo] Chi phí sống một tháng của du học sinh ở Tokyo",
      excerpt: "Con số thật của tôi, không phải con số trong tờ rơi tư vấn du học.",
      tags: t("japan-life"),
      visibility: Visibility.PRIVATE,
      publishedAt: null,
      body: `*Bài này tôi để riêng tư vì còn muốn kiểm tra lại vài con số.*

| Khoản | Một tháng |
|---|---|
| Tiền nhà | 42.000¥ |
| Ăn uống | 28.000¥ |
| Đi lại | 8.000¥ |
| Điện thoại + mạng | 6.000¥ |
| Linh tinh | 12.000¥ |
| **Tổng** | **96.000¥** |

Baito được khoảng 85.000¥/tháng, nên vẫn phải bù thêm.`,
    },
  ];

  for (const p of posts) {
    await db.post.create({
      data: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        body: p.body,
        titleJa: p.titleJa ?? null,
        bodyJa: p.bodyJa ?? null,
        visibility: p.visibility,
        publishedAt: p.publishedAt,
        tags: { connect: p.tags },
      },
    });
  }
  console.log(`  ✓ ${posts.length} bài viết (2 công khai, 1 riêng tư)`);
}

/* ---------------- chạy ---------------- */

async function main() {
  const wantClear = process.argv.includes("--clear");

  await clear();
  if (wantClear) return;

  console.log("Đang tạo dữ liệu mẫu…");
  await seedDailyLogs();
  await seedFocus();
  await seedGoalsAndItems();
  await seedMemories();
  await seedPosts();

  console.log("\nXong. Vào /os để xem.");
  console.log("Xóa sạch bằng:  npm run db:demo:clear");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
