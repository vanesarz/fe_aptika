import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/ui/Toast";
import { QueryProvider } from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "APTIKA Tools",
  description: "Rekap Data Aptika - Diskominfo Provinsi Jawa Barat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          {children}
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  );
}