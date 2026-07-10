"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function SadaJabarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      title="Sada Jabar"
      subtitle="Satu Data Jawa Barat - Layanan metadata & statistik sektoral"
    >
      {children}
    </MainLayout>
  );
}