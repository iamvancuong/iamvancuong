import Link from "next/link";

/**
 * Dải ảnh nghiêng ở trang chủ — MỘT hàng, dùng hai lần (hành trình và blog).
 *
 * ## Vì sao nghiêng
 *
 * Một hàng ảnh chữ nhật thẳng hàng đọc ra là "lưới ảnh" — thứ mọi trang đều
 * có. Cho mỗi tấm lệch vài độ thì nó đọc ra là **ảnh in rải trên bàn**: cùng
 * chừng ấy tấm ảnh, nhưng thành một cử chỉ thay vì một thành phần giao diện.
 *
 * Góc nghiêng lấy từ MỘT MẢNG CỐ ĐỊNH theo chỉ số, không phải `Math.random()`.
 * Random chạy khác nhau ở server và ở trình duyệt → React báo lỗi hydration,
 * và tệ hơn là ảnh nhảy sang góc khác ngay sau khi trang tải xong.
 *
 * Rê chuột thì tấm ảnh **thẳng lại** và nhích lên: nó vừa là phản hồi, vừa nói
 * đúng thứ sắp xảy ra — tấm đang xiêu vẹo trở về ngay ngắn nghĩa là "cái này
 * bấm được".
 *
 * ## Ảnh ở đây từ đâu ra
 *
 * Ảnh bìa của những ký ức / bài viết đã tick **«hiện ở trang chủ»** trong
 * `/os`. Ảnh bìa không có cột riêng trong database: là tấm đầu tiên theo
 * `Photo.order` — thứ tự vốn đã sắp được bằng hai nút lên/xuống sẵn có.
 *
 * Bấm vào ảnh là sang thẳng ký ức / bài viết đó.
 */

export type StripItem = {
  id: string;
  /** Bấm vào thì đi đâu — `/journey` hoặc `/blog/<slug>`. */
  href: string;
  url: string;
  thumbUrl: string | null;
  /** Tiêu đề ký ức / bài viết. Dùng cho `alt` và chú thích khi rê chuột. */
  caption: string | null;
  width: number | null;
  height: number | null;
};

/**
 * Góc nghiêng, lặp lại theo chỉ số. Cố ý KHÔNG đối xứng và không đều: dãy đều
 * (−3, +3, −3, +3…) lại thành một hoa văn, mà hoa văn thì trông có chủ đích —
 * đúng thứ cần tránh, vì hiệu ứng này giả vờ là ngẫu nhiên.
 */
const TILT = [-3, 2.2, -1.4, 3.1, -2.6, 1.6, -3.4, 2.8];

export function PhotoStrip({
  label,
  items,
}: {
  label: string;
  items: StripItem[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="w-full">
      <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-3">
        {label}
      </div>

      {/* Tràn ra sát mép màn hình rồi tự chừa lề bằng padding: ảnh bị cắt ở
          đúng mép trình duyệt trông như còn tiếp, chứ dừng lại ở lề container
          thì trông như hết rồi mà xếp lệch.
          `py` chừa chỗ cho góc nghiêng và cho cú nhích lên khi rê chuột —
          thiếu nó thì đỉnh ảnh bị `overflow` cắt cụt. */}
      <div className="-mx-6 mt-4 overflow-x-auto px-6 py-4 md:-mx-8 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max items-center gap-4 md:gap-5">
          {items.map((p, i) => {
            // Giữ đúng tỉ lệ gốc trong một băng cao cố định. Thiếu số đo (ảnh
            // cũ) thì rơi về 4:3 — chỉ lệch khung, không vỡ bố cục.
            const ratio = p.width && p.height ? p.width / p.height : 4 / 3;
            return (
              <li key={p.id} className="shrink-0">
                <Link
                  href={p.href}
                  title={p.caption ?? undefined}
                  style={{
                    aspectRatio: String(ratio),
                    ["--tilt" as string]: `${TILT[i % TILT.length]}deg`,
                  }}
                  className="group relative block h-[180px] overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface shadow-sm transition-[transform,box-shadow] duration-300 ease-out [transform:rotate(var(--tilt))] hover:z-10 hover:shadow-lg hover:[transform:rotate(0deg)_translateY(-6px)] md:h-[240px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- ảnh đi
                      qua /api/uploads (kiểm quyền từng tấm), next/image không qua đó */}
                  <img
                    src={p.thumbUrl ?? p.url}
                    alt={p.caption ?? ""}
                    loading="lazy"
                    className="size-full object-cover"
                  />

                  {p.caption && (
                    // Chú thích chỉ hiện khi rê tới: để sẵn thì mười tấm ảnh
                    // thành mười dòng chữ, và dải ảnh hết còn là dải ảnh.
                    <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/75 to-transparent p-3 pt-8 text-[13px] leading-snug text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="line-clamp-2">{p.caption}</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
