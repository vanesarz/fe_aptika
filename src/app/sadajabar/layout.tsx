"use client";
import Sidebar from "@/components/layout/Sidebar";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: "auto", backgroundColor: "#f1f5f9" }}>
        {children}
      </main>
    </div>
  );
}