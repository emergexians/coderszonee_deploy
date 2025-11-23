// app/admin/layout.tsx
import Sidebar from "../../../components/admin/sidebar/Sidebar";

export const metadata = {
  title: "Admin — EDTECH",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
