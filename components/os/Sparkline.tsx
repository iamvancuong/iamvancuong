import { MetricDirection } from "@prisma/client";

/**
 * Đường biểu diễn một số đo theo thời gian — SVG tự vẽ.
 *
 * Không cài thư viện biểu đồ: Chart.js nặng ~200KB cho đúng một đường kẻ
 * (PLAN §3 đã hoãn quyết định này và nghiêng về tự vẽ). Ở đây chỉ cần map
 * giá trị vào toạ độ, khoảng ba chục dòng.
 *
 * Trục X **theo ngày thật**, không phải theo thứ tự bản ghi: hai lần đo cách
 * nhau 3 tháng phải nhìn ra là xa nhau, nếu không đường biểu diễn nói dối về
 * nhịp độ.
 */

export type Point = { iso: string; value: number };

const W = 320;
const H = 64;
const PAD = 6;

export function Sparkline({
  points,
  direction,
}: {
  /** Cũ → mới. */
  points: Point[];
  direction: MetricDirection;
}) {
  if (points.length === 0) return null;

  // Một điểm thì không có đường — vẽ một chấm giữa khung.
  if (points.length === 1) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-16 w-full" role="img"
        aria-label={`Một lần đo: ${points[0].value}`}>
        <circle cx={W / 2} cy={H / 2} r={3} className="fill-ink" />
      </svg>
    );
  }

  const xs = points.map((p) => Date.parse(p.iso));
  const ys = points.map((p) => p.value);

  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);

  // Mọi giá trị bằng nhau → đường ngang giữa khung, tránh chia cho 0.
  const spanX = x1 - x0 || 1;
  const spanY = y1 - y0 || 1;
  const flat = y1 === y0;

  const px = (t: number) => PAD + ((t - x0) / spanX) * (W - PAD * 2);
  const py = (v: number) =>
    flat ? H / 2 : H - PAD - ((v - y0) / spanY) * (H - PAD * 2);

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${px(xs[i]).toFixed(1)},${py(p.value).toFixed(1)}`)
    .join(" ");

  const first = points[0].value;
  const last = points[points.length - 1].value;
  const better =
    direction === MetricDirection.UP ? last > first : last < first;
  const same = last === first;

  const stroke = same
    ? "stroke-ink-3"
    : better
      ? "stroke-[var(--color-up)]"
      : "stroke-[var(--color-down)]";
  const dot = same ? "fill-ink-3" : better ? "fill-up" : "fill-down";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-16 w-full"
      role="img"
      aria-label={`${points.length} lần đo, từ ${first} tới ${last}`}
    >
      <path
        d={d}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={stroke}
      />
      {/* Chỉ chấm điểm cuối — chấm hết mọi điểm làm đường kẻ rối khi có
          vài chục lần đo, mà thứ cần nhìn là "giờ đang ở đâu". */}
      <circle
        cx={px(xs[xs.length - 1])}
        cy={py(last)}
        r={2.5}
        className={dot}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
