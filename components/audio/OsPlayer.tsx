"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Pause, Play, Square, X } from "lucide-react";
import type { Track } from "@/lib/audio";

/**
 * Trình phát nhạc của `/os`.
 *
 * Đặt trong `layout.tsx` chứ không phải trong một trang: layout của App Router
 * KHÔNG bị tháo ra khi chuyển trang phía client, nên nhạc chạy liên tục lúc đi
 * từ Hôm nay sang Nhật ký sang Lịch. Để trong `page.tsx` thì mỗi lần bấm sang
 * trang khác là thẻ <audio> bị tháo và nhạc đứt giữa chừng.
 *
 * **Một thẻ <audio> duy nhất, `loop` luôn bật** — đổi bài là đổi `src` chứ
 * không tạo thẻ mới, nên không bao giờ có hai bài chồng lên nhau. Bài lặp mãi
 * cho tới khi bấm dừng; không có "hết bài" nào để mà tự tắt.
 *
 * Không dùng `<audio controls>` mặc định của trình duyệt: nó kèm thanh tua và
 * nút tải về, hiển thị mỗi trình duyệt một kiểu, và cao gấp đôi chỗ cần dùng.
 */

const VOL_KEY = "os-music-volume";
/**
 * 15%, không phải 50%.
 *
 * Đây là nhạc NỀN để làm việc, không phải để nghe. Mở lần đầu mà nó bật ở 50%
 * trên một cái máy đang để loa to thì giật mình — và phản xạ ngay sau cú giật
 * mình đó là tắt hẳn, không bao giờ mở lại nữa. Muốn to hơn thì kéo thanh
 * trượt mất một giây và mức đó được nhớ lại; còn cú giật mình thì không lấy
 * lại được.
 */
const DEFAULT_VOL = 0.15;

export function OsPlayer({ tracks }: { tracks: Track[] }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [open, setOpen] = useState(false);
  /** `src` của bài đang phát — null là đang im. Tạm dừng vẫn giữ nguyên bài. */
  const [current, setCurrent] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [vol, setVol] = useState(DEFAULT_VOL);

  // Âm lượng nhớ qua từng lần mở, nhưng bài đang phát thì KHÔNG nhớ: mở /os
  // lên mà tự dưng có nhạc là hành vi không ai muốn.
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(VOL_KEY));
      if (Number.isFinite(v) && v > 0 && v <= 1) setVol(v);
    } catch {
      // localStorage bị chặn — dùng mức mặc định, không sao.
    }
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.volume = vol;
  }, [vol, current]);

  if (tracks.length === 0) return null;

  const stop = () => {
    const a = ref.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    setCurrent(null);
    setPaused(false);
  };

  const toggle = async (src: string) => {
    const a = ref.current;
    if (!a) return;

    // Bấm lại đúng bài đang phát = tạm dừng / phát tiếp, giữ nguyên chỗ đang nghe.
    if (current === src) {
      if (a.paused) {
        await a.play().catch(() => {});
        setPaused(false);
      } else {
        a.pause();
        setPaused(true);
      }
      return;
    }

    a.src = src;
    a.volume = vol;
    try {
      await a.play();
      setCurrent(src);
      setPaused(false);
    } catch {
      // Trình duyệt từ chối phát (rất hiếm, vì đây là do bấm chuột) — trả về
      // trạng thái im lặng thay vì để nút sáng mà không có tiếng.
      setCurrent(null);
    }
  };

  const changeVol = (v: number) => {
    setVol(v);
    try {
      localStorage.setItem(VOL_KEY, String(v));
    } catch {
      // Không lưu được thì thôi, âm lượng vẫn đổi trong phiên này.
    }
  };

  const playingName =
    tracks.find((t) => t.src === current)?.name ?? null;

  return (
    <>
      {/* loop: hết bài quay lại đầu, mãi mãi. Đây là cả yêu cầu của tính năng. */}
      <audio ref={ref} loop preload="none" />

      {/* bottom-[76px] trên điện thoại để không nằm đè lên thanh nav dưới cùng
          (thanh đó cao ~56px + vùng an toàn của iPhone). */}
      <div className="fixed bottom-[76px] right-4 z-10 md:bottom-6 md:right-6">
        {open ? (
          <div className="w-[min(17rem,84vw)] rounded-[var(--radius-lg)] border border-line bg-bg p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">
                Nhạc
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="rounded-[var(--radius-md)] p-1 text-ink-3 transition-colors hover:bg-surface hover:text-ink"
              >
                <X size={15} strokeWidth={1.75} />
              </button>
            </div>

            <ul className="space-y-0.5">
              {tracks.map((t) => {
                const on = current === t.src;
                return (
                  <li key={t.file}>
                    <button
                      type="button"
                      onClick={() => toggle(t.src)}
                      className={`flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-[14px] transition-colors ${
                        on
                          ? "bg-surface-2 font-medium text-ink"
                          : "text-ink-2 hover:bg-surface hover:text-ink"
                      }`}
                    >
                      {on && !paused ? (
                        <Pause size={15} strokeWidth={1.75} />
                      ) : (
                        <Play size={15} strokeWidth={1.75} />
                      )}
                      <span className="min-w-0 flex-1 truncate">{t.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 flex items-center gap-2.5 border-t border-line-soft pt-3">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={vol}
                onChange={(e) => changeVol(Number(e.target.value))}
                aria-label="Âm lượng"
                className="h-1 flex-1 accent-accent"
              />
              <button
                type="button"
                onClick={stop}
                disabled={!current}
                aria-label="Dừng hẳn"
                title="Dừng hẳn"
                className="rounded-[var(--radius-md)] p-1.5 text-ink-3 transition-colors hover:bg-surface hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <Square size={14} strokeWidth={2} />
              </button>
            </div>

            {playingName && (
              <p className="mt-2 truncate text-[12px] text-ink-3">
                {paused ? "Tạm dừng" : "Đang phát"} · {playingName}
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Nhạc"
            title={playingName ? `Đang phát: ${playingName}` : "Nhạc"}
            className={`flex size-11 items-center justify-center rounded-full border border-line shadow-lg transition-colors ${
              current && !paused
                ? "bg-accent text-bg"
                : "bg-bg text-ink-2 hover:text-ink"
            }`}
          >
            <Music size={18} strokeWidth={1.75} />
          </button>
        )}
      </div>
    </>
  );
}
