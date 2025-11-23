"use client";

import StudentSidebar from "@/components/student/sidebar/sidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <StudentSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
