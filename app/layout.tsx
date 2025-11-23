// app/layout.tsx (Server Component – no "use client")
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coderszonee",
  description: "EdTech platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}
