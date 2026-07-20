"use client";

import { usePathname } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

export default function SpdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPrint = pathname.includes("/print");

  return (
    <MainLayout
      title="Surat Perjalanan Dinas (SPD)"
      subtitle="Kelola usulan, visum, dan pertanggungjawaban dinas Aptika"
      isPrintPage={isPrint}
    >
      {children}
    </MainLayout>
  );
}
