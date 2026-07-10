import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/ui/Toast";

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
    <html lang="id">
      <body className="antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}