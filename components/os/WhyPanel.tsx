/**
 * «Nỗ lực để làm gì?» — câu trả lời viết sẵn, nằm ngay đầu tab «Nên nhớ».
 *
 * Cố ý **hardcode chứ không cho sửa trong giao diện**. Mọi thứ khác trong Life
 * OS đều sửa được vì chúng thay đổi theo tuần; cái này thì không — nếu tuần nào
 * cũng sửa được thì nó thành một ô nội dung nữa phải điền, và mất đúng cái sức
 * nặng khiến nó đáng đọc mỗi sáng. Muốn đổi thì sửa file này, và việc phải mở
 * code ra để đổi chính là cái phanh.
 *
 * Bảy dòng đều bắt đầu bằng «Để» — đọc dọc xuống là một câu trả lời liền mạch,
 * không phải bảy gạch đầu dòng rời rạc.
 *
 * `REASONS` được XUẤT ra để `DailyGate` (modal bắt buộc mỗi sáng) dùng lại đúng
 * bảy dòng này — một nguồn duy nhất, sửa một chỗ là hai nơi cùng đổi.
 */

export const REASONS = [
  "Để mình không thiếu — tiền bạc, hiểu biết, cảm xúc, trải nghiệm.",
  "Để nhà mình không phải cãi nhau vì chuyện mưu sinh.",
  "Để dẫn được bố mẹ đến nơi họ chưa từng đến, và giúp được người thân lúc họ cần.",
  "Để không ai xem thường mình, và cũng không ai xem thường người nhà mình.",
  "Để gặp được những người tốt hơn.",
  "Để con mình học được điều tốt nhất từ chính mình — người dạy nó sớm nhất là mình.",
  "Để đi được nơi mình muốn đến, và quay lại được nơi mình muốn quay lại.",
];

export function WhyPanel() {
  return (
    <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
      <h2 className="text-[17px] font-semibold tracking-[-0.01em]">
        Nỗ lực để làm gì?
      </h2>
      <ol className="mt-4 space-y-3">
        {REASONS.map((r, i) => (
          <li key={r} className="flex gap-3">
            <span className="shrink-0 pt-px text-[12px] font-medium tabular-nums text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[15px] leading-relaxed text-ink-2">{r}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
