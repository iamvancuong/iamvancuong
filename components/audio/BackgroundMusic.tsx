"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Music, VolumeX } from "lucide-react";
import type { Track } from "@/lib/audio";

/**
 * Nhạc nền của trang CÔNG KHAI — một bài, lặp mãi, âm lượng rất nhỏ.
 *
 * ## Vì sao không chỉ là `<audio autoplay loop>`
 *
 * Mọi trình duyệt hiện nay đều CHẶN tự phát tiếng khi trang chưa được người
 * dùng chạm vào (Chrome/Safari/Firefox đều thế, từ 2018). Viết `autoplay` thì
 * `play()` bị từ chối im lặng và trang không có nhạc — không có lỗi nào hiện ra
 * để mà biết, nên rất dễ tưởng là code sai.
 *
 * Cách làm ở đây: thử phát ngay khi tải trang; bị từ chối thì **đợi cử chỉ đầu
 * tiên** của khách (chạm, bấm, cuộn, gõ phím) rồi phát. Nghe có vẻ vòng vo,
 * nhưng đây là cách duy nhất còn hợp lệ, và trên thực tế khách nào cũng chạm
 * vào trang trong vài giây đầu.
 *
 * ## Tắt là nhớ
 *
 * Ai bấm tắt thì lần sau vào không bị phát lại nữa (`localStorage`). Nhạc nền
 * tự bật lại sau khi khách đã chủ động tắt là kiểu làm phiền tệ nhất trên web.
 *
 * ## Không phát trong /os
 *
 * `/os` có trình phát riêng (`OsPlayer`), hai bài, âm lượng bình thường. Root
 * layout bọc cả `/os` nên phải tự loại ra ở đây, nếu không hai thứ chồng tiếng.
 */

/** «Nhỏ nhất có thể mà vẫn nghe thấy». Dưới mức này thì gần như là tắt. */
const VOLUME = 0.05;

const KEY = "bg-music";

export function BackgroundMusic({ track }: { track: Track | null }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(false);
  const pathname = usePathname();

  // Vùng riêng tư có trình phát riêng. Tính TRƯỚC các effect bên dưới nhưng
  // return sau chúng — hook không được đặt sau câu lệnh return có điều kiện.
  const hidden = pathname.startsWith("/os") || pathname === "/login";

  /**
   * Phụ thuộc theo CHUỖI `src`, không theo object `track`.
   *
   * Props từ server component được dựng lại mỗi lần chuyển trang, nên `track`
   * là một object mới dù nội dung y hệt. Để nó trong mảng phụ thuộc thì effect
   * chạy lại ở MỌI lần chuyển trang, mà dọn dẹp của effect có `a.pause()` —
   * nghĩa là nhạc đứt rồi phát lại từ đầu mỗi lần khách bấm sang trang khác.
   */
  const src = track?.src ?? null;

  useEffect(() => {
    if (hidden || !src) return;

    let off = false;
    try {
      off = localStorage.getItem(KEY) === "off";
    } catch {
      // localStorage bị chặn (ẩn danh) — coi như chưa từng tắt.
    }
    if (off) return;

    const a = ref.current;
    if (!a) return;
    a.volume = VOLUME;

    /** Trả về true nếu trình duyệt cho phát. */
    const tryPlay = () =>
      a
        .play()
        .then(() => {
          setOn(true);
          return true;
        })
        .catch(() => false);

    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    const onGesture = () => {
      void tryPlay();
      // Gỡ ngay sau lần đầu — dù phát được hay không. Bấm được một lần là
      // trình duyệt đã mở khóa; còn nếu không phải chuyện tự phát thì thử lại
      // ở mỗi cú cuộn chỉ tổ đốt CPU.
      events.forEach((e) => window.removeEventListener(e, onGesture));
    };

    void tryPlay().then((ok) => {
      if (!ok) {
        events.forEach((e) =>
          window.addEventListener(e, onGesture, { passive: true, once: true }),
        );
      }
    });

    return () => {
      events.forEach((e) => window.removeEventListener(e, onGesture));
      a.pause();
    };
  }, [hidden, src]);

  if (hidden || !track) return null;

  const toggle = async () => {
    const a = ref.current;
    if (!a) return;

    if (on) {
      a.pause();
      setOn(false);
      try {
        localStorage.setItem(KEY, "off");
      } catch {
        // Không nhớ được lựa chọn thì thôi — trong phiên này vẫn tắt.
      }
      return;
    }

    a.volume = VOLUME;
    try {
      await a.play();
    } catch {
      setOn(false);
      return;
    }
    setOn(true);
    try {
      localStorage.setItem(KEY, "on");
    } catch {
      // Không nhớ được lựa chọn — nhạc vẫn đang chạy, chỉ là lần sau phải bật lại.
    }
  };

  return (
    <>
      {/* preload="none": file nhạc nặng, đừng tải về máy của người đã tắt nó. */}
      <audio ref={ref} src={track.src} loop preload="none" />

      <button
        type="button"
        onClick={toggle}
        aria-label={on ? "Tắt nhạc nền" : "Bật nhạc nền"}
        title={on ? "Tắt nhạc nền" : "Bật nhạc nền"}
        /**
         * Góc dưới BÊN PHẢI, không phải bên trái.
         *
         * Bên trái thì nó đè lên hàng icon mạng xã hội: cả hai đều bám mép
         * trái, mà container dùng `px-6` nên icon đầu tiên (GitHub) bắt đầu ở
         * x=24 còn nút này ở x=16 — chồng nhau 28px trên màn 375px. Lỗi chỉ
         * hiện ra khi cuộn tới đúng đoạn hàng icon chạm đáy màn hình, nên rất
         * dễ lọt qua lúc thử trên máy tính.
         *
         * Bên phải trống hẳn: cả trang công khai không có gì bám mép phải, và
         * mọi thứ trong trang đều căn trái. Trùng góc với trình phát của `/os`
         * (`OsPlayer` cũng `right`) là có chủ ý — hai thứ không bao giờ cùng
         * xuất hiện, nhưng cùng một góc thì thành cùng một thói quen.
         */
        className="fixed bottom-4 right-4 z-30 flex size-9 items-center justify-center rounded-full border border-line bg-bg/80 text-ink-3 backdrop-blur transition-colors hover:text-ink md:bottom-6 md:right-6"
      >
        {on ? (
          <Music size={15} strokeWidth={1.75} />
        ) : (
          <VolumeX size={15} strokeWidth={1.75} />
        )}
      </button>
    </>
  );
}
