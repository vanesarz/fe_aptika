"use client";

import Sidebar from "@/components/layout/Sidebar";

export default function SpdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        @media print {
          .sidebar-layout-wrapper { display: none !important; }
          .main-layout-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
          }
          .layout-root { display: block !important; }
        }
      `}</style>
      <div className="layout-root" style={{ display: "flex", minHeight: "100vh" }}>
        <div className="sidebar-layout-wrapper">
          <Sidebar />
        </div>
        <main className="main-layout-wrapper" style={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: "#f1f5f9",
        }}>
          {children}
        </main>
      </div>
    </>
  );
}
