"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function MagangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      title="Magang"
      subtitle="Dashboard monitoring dan pendataan Magang"
    >
      {children}
    </MainLayout>
  );
}
