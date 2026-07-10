"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function PengelolaanAplikasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      title="Pengelolaan Aplikasi"
      subtitle="Pengawasan, standarisasi, dan audit keandalan sistem aplikasi"
    >
      {children}
    </MainLayout>
  );
}