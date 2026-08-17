import "server-only";

/**
 * Dịch bài viết sang tiếng Nhật bằng OpenAI.
 *
 * ## Vì sao gọi thẳng bằng `fetch`, không cài SDK `openai`
 *
 * Cả dự án đang dùng đúng một endpoint, một lần một bài. SDK mang theo hàng
 * chục nghìn dòng cho streaming, retry, phân trang, tool-call — không dùng đến
 * dòng nào. Cùng lý do đã dùng để KHÔNG cài thư viện biểu đồ (PLAN §3) và
 * KHÔNG cài thư viện kéo–thả (PLAN §14.3): một phụ thuộc là một thứ phải nâng
 * cấp, phải vá bảo mật, và phải đọc lại changelog mỗi năm.
 *
 * ## Khóa API
 *
 * `OPENAI_API_KEY` nằm trong `.env` (đã gitignore). File này có `server-only`
 * ở dòng đầu: nếu có ai lỡ import nó từ một component client thì **build hỏng
 * ngay** thay vì âm thầm nhét khóa vào gói JavaScript gửi xuống trình duyệt.
 * Đó là cả lý do dòng import đó tồn tại.
 */

/** Đọc lúc GỌI, không đọc lúc nạp module — xem chú thích trong `translate()`. */
const MODEL = () => process.env.OPENAI_MODEL || "gpt-4o";

const ENDPOINT = "https://api.openai.com/v1/chat/completions";

/**
 * Trần độ dài. Một bài blog cá nhân dài nhất cũng chỉ vài nghìn ký tự; con số
 * này là để một lần dán nhầm cả cuốn sách vào ô nội dung không biến thành một
 * hóa đơn bất ngờ.
 */
const MAX_CHARS = 24_000;

/** Bài dài thì mô hình cần thời gian thật — 30s mặc định của fetch là quá ngắn. */
const TIMEOUT_MS = 120_000;

const SYSTEM = `Bạn là người dịch chuyên nghiệp Việt → Nhật, chuyên blog cá nhân.

QUY TẮC:
1. Dịch sang tiếng Nhật TỰ NHIÊN, không dịch từng chữ. Giữ giọng của người viết:
   đời thường, thành thật, không văn vẻ, không quảng cáo.
2. Dùng thể です・ます — đây là blog cá nhân, không phải tài liệu kỹ thuật.
3. GIỮ NGUYÊN cấu trúc Markdown: cùng số lượng và cùng cấp tiêu đề (#, ##),
   danh sách, trích dẫn, in đậm, link, xuống dòng. Không thêm, không bớt mục.
4. KHÔNG dịch nội dung bên trong khối mã (\`\`\`) và mã inline (\`...\`).
   Chú thích trong mã cũng giữ nguyên.
5. Giữ nguyên tên riêng, tên công nghệ, tên địa danh viết bằng chữ Latin.
   Địa danh Nhật thì viết bằng chữ Nhật (Tokyo → 東京, Nagoya → 名古屋).
6. Số liệu, ngày tháng, đơn vị giữ nguyên giá trị.
7. KHÔNG thêm lời mở đầu, lời kết, hay ghi chú của người dịch.

Trả về JSON đúng dạng: {"title": "tiêu đề tiếng Nhật", "body": "nội dung Markdown tiếng Nhật"}`;

export type Translation = { title: string; body: string };

/** Lỗi có thông điệp ĐỌC ĐƯỢC, để hiện thẳng lên giao diện soạn bài. */
export class TranslateError extends Error {}

export async function translateToJa(
  title: string,
  body: string,
): Promise<Translation> {
  /**
   * Đọc khóa ở đây chứ KHÔNG ở cấp module.
   *
   * Đọc lúc nạp module thì giá trị bị đóng băng ở thời điểm tiến trình khởi
   * động — mà đó chính là cái bẫy đã ghi ở STATE.md §8: sửa `.env` xong thấy
   * "đổi rồi mà vẫn sai" vì tiến trình vẫn giữ giá trị cũ. Ở đây thì ít nhất
   * lỗi thiếu khóa hiện ra đúng lúc bấm nút, không phải lúc khởi động.
   */
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new TranslateError(
      "Thiếu OPENAI_API_KEY trong .env. Thêm vào rồi KHỞI ĐỘNG LẠI server — Next chỉ đọc .env lúc tiến trình khởi động.",
    );
  }

  if (!body.trim()) {
    throw new TranslateError("Bài chưa có nội dung để dịch.");
  }

  if (body.length > MAX_CHARS) {
    throw new TranslateError(
      `Bài dài ${body.length.toLocaleString("vi-VN")} ký tự, vượt trần ${MAX_CHARS.toLocaleString("vi-VN")}. Cắt bớt hoặc tách thành hai bài.`,
    );
  }

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL(),
        // `json_object` để không phải dò tìm chuỗi JSON trong một câu trả lời
        // có kèm lời dẫn. Prompt vẫn phải nhắc chữ "JSON" — đó là điều kiện
        // OpenAI đòi khi bật chế độ này.
        response_format: { type: "json_object" },
        // Thấp, không phải 0: dịch cần một chút linh hoạt để câu ra tự nhiên,
        // nhưng không cần sáng tạo.
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            /**
             * ⚠️ KHÔNG dùng `---` để ngăn tiêu đề với nội dung.
             *
             * Bản đầu tiên viết `Tiêu đề: X\n\n---\n\n${body}`, và mô hình
             * dịch luôn cái `---` đó vào kết quả — vì trong Markdown `---` là
             * một đường kẻ ngang, tức là NỘI DUNG chứ không phải dấu ngăn.
             * Mọi bài dịch ra đều mở đầu bằng một đường kẻ ngang vô cớ.
             *
             * Nhãn chữ hoa không phải cú pháp Markdown nên không bị hiểu nhầm
             * thành thứ cần giữ lại.
             */
            content: `TIÊU ĐỀ:\n${title}\n\nNỘI DUNG:\n${body}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    // `TimeoutError` khi quá hạn, `TypeError` khi mất mạng — cả hai đều không
    // nói được gì cho người bấm nút, nên dịch sang tiếng người ở đây.
    const timeout = err instanceof Error && err.name === "TimeoutError";
    throw new TranslateError(
      timeout
        ? `Quá ${TIMEOUT_MS / 1000}s chưa có phản hồi. Thử lại, hoặc cắt bài ngắn lại.`
        : "Không gọi được OpenAI — kiểm tra mạng rồi thử lại.",
    );
  }

  if (!res.ok) {
    // Thông điệp lỗi của OpenAI nằm ở `error.message` và nó nói khá rõ
    // (hết hạn mức, khóa sai, model không tồn tại) — chuyển thẳng ra ngoài.
    const detail = await res
      .json()
      .then((j) => (j as { error?: { message?: string } })?.error?.message)
      .catch(() => null);

    if (res.status === 401)
      throw new TranslateError("OPENAI_API_KEY không hợp lệ hoặc đã bị thu hồi.");
    if (res.status === 429)
      throw new TranslateError("Hết hạn mức OpenAI hoặc gọi quá nhanh. Đợi một lát rồi thử lại.");

    throw new TranslateError(`OpenAI trả lỗi ${res.status}${detail ? `: ${detail}` : ""}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new TranslateError("OpenAI trả về câu trả lời rỗng.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new TranslateError("OpenAI trả về thứ không phải JSON. Thử lại.");
  }

  const out = parsed as Partial<Translation>;
  if (typeof out.body !== "string" || !out.body.trim()) {
    throw new TranslateError("Bản dịch trả về rỗng. Thử lại.");
  }

  return {
    // Tiêu đề thiếu thì để rỗng chứ không rơi về tiêu đề tiếng Việt: một tiêu
    // đề tiếng Việt nằm trên trang /ja trông như lỗi dữ liệu, còn ô trống thì
    // nhìn ra ngay là còn thiếu và điền được.
    title: typeof out.title === "string" ? out.title.trim() : "",
    body: out.body.trim(),
  };
}
