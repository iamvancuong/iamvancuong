import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ProjectsView } from "@/components/projects/ProjectsView";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Dự án",
  description: "Những thứ tôi đã làm. Mã nguồn và bản chạy thử nếu có.",
};

export default function ProjectsPage() {
  return (
    <Container width="prose">
      <ProjectsView projects={projects} />
    </Container>
  );
}
