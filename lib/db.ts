import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma 7 kết nối qua driver adapter thay vì đọc url trong schema.
 * Adapter mariadb dùng được cho cả MySQL.
 *
 * Next.js ở chế độ dev hot-reload liên tục. Nếu tạo client mới mỗi lần sửa
 * file thì sau vài chục lần sẽ hết sạch connection của MySQL — nên giữ một
 * instance trên globalThis để dùng lại.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Tách DATABASE_URL thành cấu hình pool.
 *
 * Phải làm thủ công vì adapter chỉ nhận **hoặc** một chuỗi URL **hoặc** một
 * object cấu hình — không trộn được. Mà ta cần thêm tùy chọn vào (xem dưới),
 * nên buộc phải đi đường object.
 */
function poolConfig() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("Thiếu DATABASE_URL trong .env");

  const u = new URL(raw);

  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),

    /**
     * ⚠️ Không có dòng này thì app CHẾT sau mỗi lần MySQL khởi động lại.
     *
     * MySQL 8.4 mặc định dùng `caching_sha2_password`. Server giữ một bộ nhớ
     * đệm mật khẩu, và bộ nhớ đó **rỗng sau mỗi lần restart**. Lần đăng nhập
     * đầu tiên vì thế phải làm "full authentication": client mã hóa mật khẩu
     * bằng khóa RSA công khai của server. Không có sẵn khóa thì client phải
     * xin — và mặc định của mariadb connector là **không được phép xin**.
     *
     * Hậu quả không phải là báo lỗi tử tế mà là **treo im**: kết nối TCP mở
     * được, handshake bắt đầu, rồi đứng đó tới khi pool bỏ cuộc sau 10 giây.
     * Lỗi hiện ra là `pool timeout ... active=0 idle=0`, trông hệt như "không
     * kết nối được database" nên rất dễ đi tìm nhầm chỗ.
     *
     * Triệu chứng đặc trưng: chỉ cần một client bất kỳ đăng nhập thành công
     * (ví dụ `docker exec ... mysql -ucuong`) là bộ đệm được ghi, và app chạy
     * lại ngay lập tức — cho tới lần restart sau.
     *
     * 🔒 Đánh đổi: bật lên nghĩa là chấp nhận nhận khóa công khai qua kênh
     * chưa mã hóa. Với MySQL chạy localhost/Docker trên cùng máy thì không có
     * rủi ro thật. **Khi nào MySQL nằm ở máy khác thì phải bật TLS (`ssl`)
     * thay cho tùy chọn này**, vì lúc đó kẻ đứng giữa có thể tráo khóa để lấy
     * mật khẩu.
     */
    allowPublicKeyRetrieval: true,

    /**
     * Thà báo lỗi sớm còn hơn treo. Mặc định của pool là chờ 10 giây rồi mới
     * kêu, mà 10 giây thì người dùng đã kịp nghĩ là trang bị hỏng.
     */
    connectTimeout: 5_000,
    initializationTimeout: 5_000,

    /**
     * Dev hot-reload có thể để lại vài pool cũ chưa được dọn. Giữ số kết nối
     * mỗi pool nhỏ để không ăn hết trần 151 của MySQL.
     */
    connectionLimit: 5,
  };
}

function createClient() {
  return new PrismaClient({
    adapter: new PrismaMariaDb(poolConfig()),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
