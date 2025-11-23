// app/admin/hackathons/page.tsx
import HackathonsAdmin from "@/components/admin/hackathon/HackathonsAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // note: not "dynamicSetting"

export default function AdminHackathonsPage() {
  return (
    <div className="space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Hackathons</h1>
        <p className="text-sm text-gray-600">Create, list, and manage hackathons.</p>
      </header>
      <HackathonsAdmin />
    </div>
  );
}
