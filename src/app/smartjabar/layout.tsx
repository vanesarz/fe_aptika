"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function SmartJabarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      title="Smart Jabar"
      subtitle="Dashboard monitoring platform Smart Jabar"
    >
      {children}
    </MainLayout>
  );
}