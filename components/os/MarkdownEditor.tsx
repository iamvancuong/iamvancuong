"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Code,
  Columns2,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  PencilLine,
  Quote,
  Strikethrough,
  Type,
} from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";

/**
 * Soạn thảo Markdown kiểu Obsidian: thanh công cụ + xem trước.
 *
 * Bản xem trước dùng CHÍNH hàm renderMarkdown mà trang blog thật dùng —
 * remark chạy được cả trên trình duyệt. Nhờ vậy thứ bạn thấy ở đây đúng
 * bằng thứ sẽ hiện trên trang, không có chuyện lệch nhau vì hai bộ render.
 */

type Mode = "write" | "split" | "preview";

export function MarkdownEditor({
  name,
  defaultValue,
  postId,
  rows = 22,
  lang,
  placeholder,
}: {
  name: string;
  defaultValue: string;
  postId: string;
  rows?: number;
  lang?: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<Mode>("write");
  const [html, setHtml] = useState("");
  const [uploading, setUploading] = useState(false);

  // Chỉ render lại khi thật sự đang xem — soạn bài không tốn công vô ích.
  useEffect(() => {
    if (mode === "write") return;
    let alive = true;
    const id = setTimeout(() => {
      renderMarkdown(value).then((out) => {
        if (alive) setHtml(out);
      });
    }, 150);
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, [value, mode]);

  /** Bọc phần đang bôi đen bằng cặp ký tự, hoặc chèn mẫu nếu chưa chọn gì. */
  const wrap = (before: string, after = before, sample = "chữ") => {
    const el = ref.current;
    if (!el) return;

    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e) || sample;
    const next = value.slice(0, s) + before + selected + after + value.slice(e);

    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + selected.length);
    });
  };

  /** Thêm tiền tố vào đầu mỗi dòng đang chọn (tiêu đề, danh sách, trích dẫn). */
  const prefixLines = (prefix: string) => {
    const el = ref.current;
    if (!el) return;

    const { selectionStart: s, selectionEnd: e } = el;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const lineEnd = value.indexOf("\n", e) === -1 ? value.length : value.indexOf("\n", e);

    const block = value.slice(lineStart, lineEnd);
    const already = block.split("\n").every((l) => l.startsWith(prefix));

    const changed = block
      .split("\n")
      .map((l) => (already ? l.slice(prefix.length) : prefix + l))
      .join("\n");

    setValue(value.slice(0, lineStart) + changed + value.slice(lineEnd));
    requestAnimationFrame(() => el.focus());
  };

  const insert = (text: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const next = value.slice(0, s) + text + value.slice(e);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + text.length, s + text.length);
    });
  };

  /** Tải ảnh lên rồi chèn cú pháp Markdown tại vị trí con trỏ. */
  const upload = async (files: FileList | File[]) => {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;

    setUploading(true);
    try {
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("postId", postId);

        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: "" }));
          alert(error || "Tải ảnh thất bại.");
          continue;
        }

        const { url } = (await res.json()) as { url: string };
        insert(`\n![](${url})\n`);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const shortcuts = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === "b") {
      e.preventDefault();
      wrap("**");
    } else if (k === "i") {
      e.preventDefault();
      wrap("*");
    } else if (k === "k") {
      e.preventDefault();
      wrap("[", "](https://)", "chữ liên kết");
    }
  };

  const showEditor = mode !== "preview";
  const showPreview = mode !== "write";

  return (
    <div className="rounded-[var(--radius-lg)] border border-line">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line px-1.5 py-1.5">
        <Tool onClick={() => wrap("**")} title="Đậm  (Ctrl+B)">
          <Bold size={15} />
        </Tool>
        <Tool onClick={() => wrap("*")} title="Nghiêng  (Ctrl+I)">
          <Italic size={15} />
        </Tool>
        <Tool onClick={() => wrap("~~")} title="Gạch ngang">
          <Strikethrough size={15} />
        </Tool>
        <Tool onClick={() => wrap("<small>", "</small>")} title="Chữ nhỏ">
          <Type size={15} />
        </Tool>

        <Sep />

        <Tool onClick={() => prefixLines("## ")} title="Tiêu đề lớn">
          <Heading2 size={15} />
        </Tool>
        <Tool onClick={() => prefixLines("### ")} title="Tiêu đề nhỏ">
          <Heading3 size={15} />
        </Tool>

        <Sep />

        <Tool onClick={() => prefixLines("- ")} title="Danh sách">
          <List size={15} />
        </Tool>
        <Tool onClick={() => prefixLines("1. ")} title="Danh sách đánh số">
          <ListOrdered size={15} />
        </Tool>
        <Tool onClick={() => prefixLines("> ")} title="Trích dẫn">
          <Quote size={15} />
        </Tool>
        <Tool onClick={() => insert("\n---\n")} title="Đường kẻ ngang">
          <Minus size={15} />
        </Tool>

        <Sep />

        <Tool onClick={() => wrap("`", "`", "mã")} title="Mã trong dòng">
          <Code size={15} />
        </Tool>
        <Tool
          onClick={() => wrap("\n```\n", "\n```\n", "khối mã")}
          title="Khối mã"
        >
          <span className="font-mono text-[11px] leading-none">{"{ }"}</span>
        </Tool>
        <Tool
          onClick={() => wrap("[", "](https://)", "chữ liên kết")}
          title="Liên kết  (Ctrl+K)"
        >
          <Link2 size={15} />
        </Tool>
        <Tool
          onClick={() => fileRef.current?.click()}
          title="Chèn ảnh — hoặc dán/kéo thẳng vào ô soạn"
          disabled={uploading}
        >
          <ImagePlus size={15} />
        </Tool>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && void upload(e.target.files)}
        />

        <div className="ml-auto flex items-center gap-1">
          {uploading && (
            <span className="mr-1 text-[12px] text-ink-3">đang tải ảnh…</span>
          )}
          <ModeBtn on={mode === "write"} onClick={() => setMode("write")} title="Soạn">
            <PencilLine size={14} />
          </ModeBtn>
          <ModeBtn
            on={mode === "split"}
            onClick={() => setMode("split")}
            title="Chia đôi"
          >
            <Columns2 size={14} />
          </ModeBtn>
          <ModeBtn
            on={mode === "preview"}
            onClick={() => setMode("preview")}
            title="Xem trước"
          >
            <Eye size={14} />
          </ModeBtn>
        </div>
      </div>

      <div className={showPreview && showEditor ? "grid md:grid-cols-2" : ""}>
        {showEditor && (
          <textarea
            ref={ref}
            name={name}
            lang={lang}
            rows={rows}
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={shortcuts}
            onPaste={(e) => {
              const files = [...e.clipboardData.files];
              if (files.length) {
                e.preventDefault();
                void upload(files);
              }
            }}
            onDrop={(e) => {
              if (e.dataTransfer.files.length) {
                e.preventDefault();
                void upload(e.dataTransfer.files);
              }
            }}
            className="w-full resize-y border-0 bg-bg px-4 py-3 font-mono text-[14px] leading-relaxed outline-none"
          />
        )}

        {showPreview && (
          <div
            className={`overflow-x-auto px-4 py-3 ${
              showEditor ? "border-t border-line md:border-l md:border-t-0" : ""
            } bg-surface`}
          >
            {value.trim() === "" ? (
              <p className="text-[14px] text-ink-3">Chưa có gì để xem.</p>
            ) : (
              <div
                lang={lang}
                className="prose text-[15px]"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}
          </div>
        )}
      </div>

      <p className="border-t border-line-soft px-4 py-2 text-[12px] text-ink-3">
        Dán ảnh thẳng từ clipboard hoặc kéo file vào ô soạn cũng được. Bản xem
        trước dùng đúng bộ render của trang thật.
      </p>
    </div>
  );
}

function Tool({
  onClick,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function ModeBtn({
  on,
  onClick,
  title,
  children,
}: {
  on: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={on}
      className={`flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors ${
        on ? "bg-ink text-bg" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-line" aria-hidden />;
}
