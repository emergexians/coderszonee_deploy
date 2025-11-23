// app/instructor/dashboard/layout.tsx
import React from "react";

export const metadata = {
  title: "Instructor Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Put dashboard shells here (sidebar/topbar), but keep it regular JSX
  return (
    <section className="min-h-screen bg-gray-50">
      {children}
    </section>
  );
}
