// app/student/dashboard/page.tsx
import React from "react";
import StudentDashboard from "@/components/student/dashboard/page";
import { getCurrentUser } from "@/lib/auth";

export default async function Page() {
  // server side: get current user (uses cookies() and DB)
  const user = await getCurrentUser(null);

  // user may be null if not authenticated — you can choose to redirect, here we pass null
  return <StudentDashboard user={user} />;
}
