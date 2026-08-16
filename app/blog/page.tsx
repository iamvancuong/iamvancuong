import type { Metadata } from "next";
import { Visibility } from "@prisma/client";
import { Container } from "@/components/layout/Container";
import { BlogListView } from "@/components/blog/BlogListView";
import { hasJa, listPosts, listTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Viết",
  description:
    "Bài viết về học tiếng Nhật, lập trình và cuộc sống ở Nhật. Một số bài có bản tiếng Nhật.",
};

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const params = await searchParams;
  const active =
    (Array.isArray(params.tag) ? params.tag[0] : params.tag) ?? "all";

  const [all, tags] = await Promise.all([listPosts(), listTags()]);

  const posts =
    active === "all"
      ? all
      : active === "ja"
        ? all.filter(hasJa)
        : all.filter((p) => p.tags.some((t) => t.slug === active));

  const privateCount = all.filter(
    (p) => p.visibility !== Visibility.PUBLIC || !p.publishedAt,
  ).length;

  // Khung RỘNG như /journey và /projects. Trước đây trang này dùng khung đọc
  // 720px nên lề trái của tiêu đề lệch hẳn so với các trang kia — cùng một
  // thanh nav mà nội dung bên dưới bắt đầu ở hai vị trí khác nhau, và mắt bắt
  // được ngay khi chuyển tab dù không chỉ ra được là lệch chỗ nào.
  // Trang BÀI VIẾT (/blog/[slug]) vẫn giữ 720px: đó là bề rộng ĐỌC.
  return (
    <Container>
      <BlogListView
        posts={posts}
        tags={tags}
        active={active}
        privateCount={privateCount}
      />
    </Container>
  );
}
