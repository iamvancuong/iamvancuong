/**
 * Dải ảnh ngang ở trang chủ.
 *
 * Đây là thứ trang chủ đang thiếu hẳn: toàn bộ trang là chữ, một tấm chân dung
 * và mấy con số. Người lạ đọc xong vẫn không thấy được cuộc sống ở Nhật trông
 * ra sao — mà đó chính là thứ trang này nói về.
 *
 * **Cuộn ngang chứ không phải lưới.** Lưới ép mọi tấm phải vừa một khung ô
 * vuông và ăn hết chiều cao màn hình; dải ngang giữ đúng tỉ lệ gốc từng tấm,
 * chiếm một băng cố định, và bản thân việc nó tràn ra khỏi mép phải là lời mời
 * kéo tiếp — không cần nút, không cần chấm tròn chỉ trang.
 *
 * Ảnh lấy từ `Photo` có `visibility = PUBLIC` — tức là ảnh của những **ký ức**
 * đã tick chia sẻ trong `/os`. Không còn trang quản lý ảnh riêng: ảnh thuộc về
 * ký ức và bài viết, nên chỗ bật/tắt cũng nằm ngay trong ký ức.
 *
 * Đây CHỈ là một băng để lướt qua, không phải cửa vào một trang ảnh — nên nó
 * cố ý không có link "xem tất cả".
 */

export type StripPhoto = {
  id: string;
  url: string;
  thumbUrl: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
};

/**
 * Ảnh mẫu — dùng khi CHƯA có tấm nào được tick công khai.
 *
 * Trang chủ mà thiếu hẳn một mục thì không đánh giá được bố cục, nên chỗ này
 * luôn có ảnh. Sáu file nằm ở `public/images/home/`; **thay ảnh thật chỉ cần
 * ghi đè đúng tên file đó**, không phải sửa code.
 *
 * Ngay khi có ký ức đầu tiên kèm ảnh được tick công khai, ảnh thật thay hết
 * chỗ này — không trộn lẫn, vì trộn thì không nhìn ra tấm nào là mẫu.
 *
 * Kích thước ghi cứng ở đây vì `aspectRatio` phải biết TRƯỚC khi ảnh tải xong;
 * đợi ảnh mới biết tỉ lệ thì cả dải giật một nhịp lúc tải.
 */
const SAMPLES: StripPhoto[] = [
  { n: 1, w: 1600, h: 1067 },
  { n: 2, w: 1067, h: 1600 },
  { n: 3, w: 1400, h: 1400 },
  { n: 4, w: 1600, h: 1067 },
  { n: 5, w: 1280, h: 1600 },
  { n: 6, w: 1600, h: 1067 },
].map(({ n, w, h }) => ({
  id: `sample-${n}`,
  url: `/images/home/photo-${n}.jpg`,
  thumbUrl: null,
  caption: null,
  width: w,
  height: h,
}));

export function PhotoStrip({ photos }: { photos: StripPhoto[] }) {
  const list = photos.length > 0 ? photos : SAMPLES;

  return (
    <div className="w-full">
      {/* Tràn ra sát mép màn hình rồi tự chừa lề bằng padding: ảnh bị cắt ở
          đúng mép trình duyệt trông như còn tiếp, chứ dừng lại ở lề container
          thì trông như hết rồi mà xếp lệch. */}
      <div className="-mx-6 overflow-x-auto pb-2 md:-mx-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max gap-3 px-6 md:gap-4 md:px-8">
          {list.map((p) => {
            // Giữ đúng tỉ lệ gốc trong một băng cao cố định. Thiếu số đo (ảnh
            // cũ) thì rơi về 4:3 — chỉ lệch khung, không vỡ bố cục.
            const ratio = p.width && p.height ? p.width / p.height : 4 / 3;
            return (
              <li
                key={p.id}
                // `aspect-ratio` + chiều cao cố định → chiều rộng tự suy ra, nên
                // đổi chiều cao ở md không cần tính lại chiều rộng ở JS.
                className="h-[190px] shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-line md:h-[260px]"
                style={{ aspectRatio: String(ratio) }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh đi
                    qua /api/uploads (kiểm quyền từng tấm), next/image không qua đó */}
                <img
                  src={p.thumbUrl ?? p.url}
                  alt={p.caption ?? ""}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                />
              </li>
            );
          })}
        </ul>
      </div>

    </div>
  );
}
