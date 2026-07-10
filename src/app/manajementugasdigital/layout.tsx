"use client";

import { usePathname } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

export default function ManajemenTugasDigitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBoardRoute = pathname.includes("/board/");

  return (
    <MainLayout
      title="Manajemen Tugas Digital"
      subtitle="Kelola proyek, pelacakan tugas, dan kolaborasi tim Aptika"
      hideHeader={isBoardRoute}
    >
      {children}
    </MainLayout>
  );
}
