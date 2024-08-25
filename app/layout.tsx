import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Birthday Heatmap for Friends",
  description: "Import your friends' birthdays and see them in a heatmap!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="p-12">{children}</body>
    </html>
  );
}
