/**
 * Nhúng một object JSON-LD vào <script type="application/ld+json">.
 *
 * Server component: chuỗi JSON có sẵn lúc dựng HTML, bot đọc được ngay không
 * cần chạy JavaScript. KHÔNG dùng next/script ở đây — nó hoãn hoặc chèn phía
 * client, mà structured data phải nằm sẵn trong HTML đầu tiên.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Dữ liệu tự sinh từ lib/seo.ts (không có input người dùng) nên an toàn.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
