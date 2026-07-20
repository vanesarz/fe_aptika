"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function AdministrasiSuratLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      title="Administrasi Surat"
      subtitle="Silakan pilih kategori surat yang ingin Anda kelola untuk memulai proses administrasi."
    >
      {children}
    </MainLayout>
  );
}
