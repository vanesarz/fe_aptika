"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function ManajemenTugasDigitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      title="Manajemen Tugas Digital"
      subtitle="Kelola proyek, pelacakan tugas, dan kolaborasi tim Aptika"
    >
      {children}
    </MainLayout>
  );
}
