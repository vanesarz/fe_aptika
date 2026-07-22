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
    <div className="flex min-h-screen bg-[#f8fafc]">
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
  );
}
export { MainLayout };
