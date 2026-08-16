import { readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Danh sách nhạc — ĐỌC TỪ THƯ MỤC, không khai trong code.
 *
 * Thả thêm một file vào `public/audio/` là nó tự hiện trong trình phát; xóa đi
 * là tự biến mất. Nếu khai tay từng bài thì mỗi lần đổi nhạc lại phải sửa code
 * rồi build lại — mà đổi nhạc là việc của người dùng, không phải của lập trình.
 *
 * Chỉ chạy ở SERVER (`/os` đã `force-dynamic`, trang công khai đọc lúc render).
 * Đọc đĩa mỗi lượt truy cập nghe phí, nhưng đây là một thư mục vài file trên
 * cùng một máy — rẻ hơn nhiều so với việc quên cập nhật một danh sách cứng.
 */

const DIR = "public/audio";

/** Định dạng trình duyệt phát được. Thứ khác nằm trong thư mục thì bỏ qua. */
const EXT = [".mp3", ".m4a", ".ogg", ".wav", ".aac"];

export type Track = {
  /** Tên file, cũng là khóa duy nhất: `audio1.mp3` */
  file: string;
  /** Đường dẫn phát được từ trình duyệt: `/audio/audio1.mp3` */
  src: string;
  /** Tên hiện trên nút — lấy từ `TITLES`, không có thì suy từ tên file. */
  name: string;
};

/**
 * Bài phát ở trang CÔNG KHAI (nhạc nền, âm lượng rất nhỏ).
 *
 * Không có file này thì rơi về bài đầu tiên tìm thấy — nên lúc trong thư mục
 * mới có đúng một bài thì ngoài trang vẫn có nhạc, không im lặng khó hiểu.
 */
const PUBLIC_TRACK = "audio1.mp3";

/**
 * Tên hiện trên nút, theo tên file.
 *
 * Đặt ở đây chứ KHÔNG đổi tên file thật, vì hai lý do. Tên file đang được
 * `PUBLIC_TRACK` ở trên trỏ tới, đổi file là phải nhớ đổi cả chỗ đó. Và hai
 * file này nặng ~72MB nằm trong git — đổi tên là git ghi lại chúng như file
 * mới, repo phình thêm chừng ấy lần nữa cho một việc chỉ là hiển thị.
 *
 * File không có trong bảng này thì vẫn hiện bằng tên file, không vỡ gì.
 */
const TITLES: Record<string, string> = {
  "audio1.mp3": "Ngồi vào bàn đã",
  "audio2.mp3": "Đừng đứng dậy",
};

export function listTracks(): Track[] {
  let files: string[];
  try {
    files = readdirSync(join(process.cwd(), DIR));
  } catch {
    // Chưa có thư mục (máy mới clone về, hoặc chưa thả nhạc vào) — không có
    // nhạc thì trình phát tự ẩn, KHÔNG được để cả trang đổ vì chuyện này.
    return [];
  }

  return files
    .filter((f) => EXT.some((e) => f.toLowerCase().endsWith(e)))
    // `numeric` để audio2 đứng trước audio10 — so chuỗi thuần thì ngược lại.
    .sort((a, b) => a.localeCompare(b, "vi", { numeric: true }))
    .map((file) => ({
      file,
      src: `/audio/${encodeURIComponent(file)}`,
      name: TITLES[file] ?? file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
    }));
}

export function backgroundTrack(tracks: Track[]): Track | null {
  return tracks.find((t) => t.file === PUBLIC_TRACK) ?? tracks[0] ?? null;
}
