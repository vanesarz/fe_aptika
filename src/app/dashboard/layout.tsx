"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      title="Beranda APTIKA Tools"
      subtitle="Selamat datang di Portal Layanan & Rekap Data Aptika Diskominfo Provinsi Jawa Barat."
      hideSidebar={true}
    >
      {children}
    </MainLayout>
  );
}
