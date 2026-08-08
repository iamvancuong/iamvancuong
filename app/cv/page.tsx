import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { CvView } from "@/components/cv/CvView";

export const metadata: Metadata = {
  title: "CV",
  description: "Hồ sơ ứng tuyển — Trương Văn Cường, Lập trình viên Fullstack.",
};

export default function CvPage() {
  return (
    <Container width="prose">
      <CvView />
    </Container>
  );
}
