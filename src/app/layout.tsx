import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}