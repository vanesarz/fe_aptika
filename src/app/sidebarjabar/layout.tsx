"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function SidebarJabarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      title="Sidebar Jabar"
      subtitle="Kelola konfigurasi widget & menu Sidebar Jawa Barat"
    >
      {children}
    </MainLayout>
  );
}