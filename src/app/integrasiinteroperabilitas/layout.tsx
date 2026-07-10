"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function IntegrasiInteroperabilitasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      title="Integrasi Interoperabilitas"
      subtitle="Pusat tata kelola integrasi data dan interkoneksi sistem"
    >
      {children}
    </MainLayout>
  );
}