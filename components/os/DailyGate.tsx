"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { fmtDateVN, weekdayVN } from "@/lib/os/day";

/**
 * «Hệ điều hành hôm nay» — cửa bắt buộc mở MỖI LẦN vào /os.
 *
 * Một nghi thức, không phải một tính năng: bốn câu creed phải được ĐỌC và TICK
 * theo thứ tự thì mới vào được Hôm nay. CỐ Ý lặp lại mỗi lần bước vào trang, KHÔNG
 * nhớ "đã qua cửa hôm nay rồi" — mục tiêu là đọc lại liên tục, một câu đọc một lần
 * rồi thôi thì thành chữ chết. (Trước đây từng gate 1 lần/ngày bằng localStorage;
 * đã bỏ theo yêu cầu.)
 *
 * Vì thế trạng thái chỉ nằm trong BỘ NHỚ component:
 *   - Mở trang /os (tải mới, hoặc quay lại từ trang khác) ⇒ component mount lại
 *     ⇒ modal hiện, mọi ô tick về trắng.
 *   - Đổi tab trong chính /os (?tab=) là đổi searchParams của CÙNG một trang,
 *     component không mount lại nên state `dismissed` giữ nguyên — đã tick xong
 *     thì không bị hỏi lại khi bấm qua tab «Việc», «Nhìn lại»…
 *   - Ngày "hôm nay" lấy từ server (prop `iso`, `todayISO()` JST) chỉ để HIỂN THỊ.
 *
 * BỐN CÂU hardcode ngay đây, cùng lý do như bảy dòng «Nỗ lực»: sửa phải mở code
 * ra, và chính cái phải-mở-code đó là cái phanh giữ cho chúng không thành ô nội
 * dung xoàng phải điền mỗi tuần.
 *
 * Tick theo THỨ TỰ (guided): chỉ bước kế tiếp mới bật; bước sau bị khóa & mờ,
 * mũi tên nối sáng lên xanh khi bước trên đã xong. Gỡ một bước đã tick thì gỡ
 * luôn mọi bước sau nó, vì thứ tự đọc là có chủ đích.
 */

const STEPS = [
  "Làm việc 12 tiếng một ngày, 6 ngày một tuần",
  "Bạn sẽ bị lãng quên – vì vậy, hãy hành động",
  "Thất bại duy nhất là KHÔNG LÀM GÌ CẢ",
  "Không tồn tại sự cân bằng",
];

/**
 * «Nỗ lực để làm gì?» — bảy dòng câu trả lời viết sẵn, gập trong modal.
 *
 * Trước đây là component `WhyPanel` riêng ở tab «Nên nhớ»; nay modal đọc mỗi
 * sáng đã bao trọn nó nên chỗ kia thành thừa và đã gỡ. Cố ý HARDCODE, cùng lý
 * do như bốn câu creed: muốn đổi phải mở code ra — chính cái phanh đó giữ cho
 * nó không thành một ô nội dung xoàng phải điền mỗi tuần. Bảy dòng đều mở đầu
 * bằng «Để», đọc dọc xuống là một câu trả lời liền mạch.
 */
const REASONS = [
  "Để mình không thiếu — tiền bạc, hiểu biết, cảm xúc, trải nghiệm.",
  "Để nhà mình không phải cãi nhau vì chuyện mưu sinh.",
  "Để dẫn được bố mẹ đến nơi họ chưa từng đến, và giúp được người thân lúc họ cần.",
  "Để không ai xem thường mình, và cũng không ai xem thường người nhà mình.",
  "Để gặp được những người tốt hơn.",
  "Để con mình học được điều tốt nhất từ chính mình — người dạy nó sớm nhất là mình.",
  "Để đi được nơi mình muốn đến, và quay lại được nơi mình muốn quay lại.",
];

export function DailyGate({ iso }: { iso: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(() =>
    STEPS.map(() => false),
  );
  const [openReasons, setOpenReasons] = useState(false);

  // Hiện ngay từ khung hình đầu (cả SSR lẫn client cùng `true`, không lệch
  // hydration), ẩn đi khi đã bấm «Vào Hôm nay» trong lần vào này.
  const show = !dismissed;

  // Khóa cuộn nền khi mở, trả lại đúng giá trị cũ khi đóng.
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  if (!show) return null;

  const doneCount = checked.filter(Boolean).length;
  const firstOpen = checked.findIndex((c) => !c); // bước kế tiếp cần tick (-1 = xong)
  const allDone = firstOpen === -1;

  const toggle = (i: number) => {
    setChecked((cur) => {
      // Gỡ một bước đã tick ⇒ gỡ luôn mọi bước sau (chúng dựa trên bước này).
      if (cur[i]) return cur.map((c, k) => (k >= i ? false : c));
      // Chỉ cho tick đúng bước kế tiếp; bước xa hơn còn bị khóa.
      const next = cur.findIndex((c) => !c);
      if (i === next) return cur.map((c, k) => (k === i ? true : c));
      return cur;
    });
  };

  // Đóng modal cho LẦN vào này thôi — không ghi nhớ đâu cả, nên lần vào /os sau
  // (tải lại / quay lại từ trang khác) modal lại hiện, đúng ý «lặp lại liên tục».
  const enter = () => {
    if (allDone) setDismissed(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hệ điều hành hôm nay"
      className="gate-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
    >
      <div className="gate-card flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-bg shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line-soft px-6 pb-4 pt-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="size-2 shrink-0 rounded-full bg-accent" />
              <span className="tag">Hệ điều hành hôm nay — Daily OS</span>
            </div>
            <h2 className="mt-2 text-[17px] font-semibold leading-snug tracking-[-0.01em]">
              Đọc &amp; tick 4 mục trước khi vào Hôm nay
            </h2>
            <p className="mt-0.5 text-[13px] text-ink-3">
              {weekdayVN(iso)}, {fmtDateVN(iso)}
            </p>
          </div>
          <span className="shrink-0 pt-1 text-[13px] font-medium tabular-nums text-ink-3">
            {doneCount}/{STEPS.length}
          </span>
        </div>

        {/* Thân — cuộn được nếu màn hình thấp */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <ol>
            {STEPS.map((s, i) => {
              const on = checked[i];
              const active = i === firstOpen; // bước đang chờ tick
              const locked = !on && !active;
              return (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    disabled={locked}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-3.5 rounded-[var(--radius-lg)] border p-4 text-left transition-all ${
                      on
                        ? "border-accent/30 bg-accent/[0.07]"
                        : active
                          ? "gate-active border-accent/60 bg-surface-2 ring-2 ring-accent/25"
                          : "cursor-not-allowed border-line bg-surface-2 opacity-45"
                    }`}
                  >
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        on
                          ? "gate-check border-accent bg-accent text-bg"
                          : "border-ink-3/50 text-transparent"
                      }`}
                    >
                      <Check size={16} strokeWidth={2.5} />
                    </span>
                    <span className="min-w-0">
                      <span className="tag block">Bước 0{i + 1}</span>
                      <span className="mt-0.5 block text-[15px] font-medium leading-snug">
                        {s}
                      </span>
                    </span>
                  </button>

                  {i < STEPS.length - 1 && (
                    <div className="flex justify-center py-1.5">
                      <ChevronDown
                        size={18}
                        strokeWidth={2}
                        className={on ? "text-accent" : "text-ink-3/40"}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          {/* «Nỗ lực để làm gì?» — gập/mở, dùng lại bảy dòng của WhyPanel */}
          <div className="mt-5 overflow-hidden rounded-[var(--radius-lg)] border border-line">
            <button
              type="button"
              onClick={() => setOpenReasons((v) => !v)}
              aria-expanded={openReasons}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-surface-2"
            >
              <span className="tag">{"// Nỗ lực để làm gì?"}</span>
              <ChevronDown
                size={16}
                strokeWidth={2}
                className={`shrink-0 text-ink-3 transition-transform ${
                  openReasons ? "rotate-180" : ""
                }`}
              />
            </button>
            {openReasons && (
              <ol className="space-y-2.5 border-t border-line-soft px-4 py-4">
                {REASONS.map((r, i) => (
                  <li
                    key={r}
                    className="flex gap-2.5 text-[14px] leading-relaxed text-ink-2"
                  >
                    <span className="shrink-0 pt-px text-[12px] font-medium tabular-nums text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Chân — nút chỉ bật khi đủ 4/4 */}
        <div className="flex items-center justify-between gap-4 border-t border-line-soft px-6 py-4">
          <span className="tag min-w-0">
            {allDone
              ? "Đã sẵn sàng — bạn có thể vào Hôm nay"
              : `Còn ${STEPS.length - doneCount} mục chưa tick`}
          </span>
          <button
            type="button"
            onClick={enter}
            disabled={!allDone}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-bg transition-opacity disabled:opacity-30"
          >
            <Check size={15} strokeWidth={2.5} />
            Vào Hôm nay
          </button>
        </div>
      </div>
    </div>
  );
}
