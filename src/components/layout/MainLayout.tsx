"use client";

import * as React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  isPrintPage?: boolean;
  hideHeader?: boolean;
  hideSidebar?: boolean;
}

export default function MainLayout({
  children,
  title,
  subtitle,
  isPrintPage = false,
  hideHeader = false,
  hideSidebar = false,
}: MainLayoutProps) {
  if (isPrintPage) {
    return (
      <>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-area {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              overflow: visible !important;
            }
          }
        `}</style>
        <main className="print-area min-h-screen bg-white">
          {children}
        </main>
      </>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] overflow-x-hidden">
      {/* Diskominfo Jabar Logo Background Layer */}
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-center bg-no-repeat transition-all opacity-[0.35]"
        style={{
          backgroundImage: `url('/bg-logo-diskominfo.png')`,
          backgroundSize: "min(750px, 85vw)",
        }}
      />
      {/* Soft Background Tint Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-slate-100/50 via-blue-50/30 to-slate-100/50" />

      {/* Main Content Layout Container */}
      <div className="relative z-10 flex min-h-screen w-full">
        {/* Sidebar - only rendered if hideSidebar is false */}
        {!hideSidebar && <Sidebar />}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
          {/* Header container */}
          {!hideHeader && (
            <div className="px-6 pt-6 pb-2 flex-shrink-0">
              <Header title={title} subtitle={subtitle} showBrand={hideSidebar} />
            </div>
          )}

          {/* Scrollable content box */}
          <main className="flex-grow overflow-y-auto px-6 pb-6 pt-2 scrollbar-hide">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
export { MainLayout };
