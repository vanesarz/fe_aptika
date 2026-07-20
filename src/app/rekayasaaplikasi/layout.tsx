"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function RekayasaAplikasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      title="Rekayasa Aplikasi"
      subtitle="Layanan perancangan, pengembangan, dan rekayasa perangkat lunak"
    >
      {children}
    </MainLayout>
  );
}