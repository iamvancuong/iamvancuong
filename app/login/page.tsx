import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Container width="prose">
      <div className="mx-auto max-w-[320px] pt-10">
        <h1 className="text-[20px] font-semibold tracking-[-0.01em]">Life OS</h1>
        <p className="mt-1.5 text-[14px] text-ink-2">Khu vực riêng tư.</p>

        {/* useSearchParams cần Suspense thì trang mới prerender tĩnh được */}
        <Suspense fallback={<div className="mt-8 h-28" />}>
          <LoginForm />
        </Suspense>
      </div>
    </Container>
  );
}
