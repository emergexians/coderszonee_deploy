// app/(public)/admin/users/page.tsx
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UserLean = {
  _id: unknown;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  createdAt?: Date | string;
};

type UserRow = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAtLabel: string;
};

function formatDate(value?: Date | string): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function roleBadgeClasses(role: string): string {
  const r = role.toLowerCase();
  if (r === "admin")
    return "bg-purple-50 text-purple-700 border border-purple-200";
  if (r === "instructor")
    return "bg-blue-50 text-blue-700 border border-blue-200";
  // default: student / others
  return "bg-emerald-50 text-emerald-700 border border-emerald-200";
}

export default async function AdminUsersPage() {
  await dbConnect();

  const docs = await User.find({})
    .sort({ createdAt: -1 })
    .lean<UserLean[]>();

  const users: UserRow[] = docs.map((u) => ({
    _id: String(u._id),
    name: u.name || "Unnamed",
    email: u.email || "—",
    phone: u.phone || "—",
    role: (u.role || "student").toLowerCase(),
    createdAtLabel: formatDate(u.createdAt),
  }));

  const total = users.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            Admin · Users
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-gray-600">
            All users who have signed up for your platform.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 text-sm sm:items-end">
          <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50 px-3 py-2 text-orange-700">
            <span className="font-semibold">{total}</span>{" "}
            <span className="text-xs uppercase tracking-wide">Total users</span>
          </div>
          <span className="text-xs text-gray-500">
            Data updates automatically from your database.
          </span>
        </div>
      </header>

      {/* Card container */}
      <div className="rounded-2xl border bg-white shadow-sm">
        {/* Table header controls (future filters/search) */}
        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Signed-up users
            </h2>
            <p className="text-xs text-gray-500">
              Showing the most recent signups first.
            </p>
          </div>
          {/* Reserved space for filters/search later */}
          <div className="text-xs text-gray-400">
            Tip: Use browser search{" "}
            <span className="rounded bg-gray-100 px-1 font-mono">Ctrl+F</span>{" "}
            to quickly find a user.
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Phone</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Signed up
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-gray-500"
                  >
                    No users have signed up yet.
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr
                    key={u._id}
                    className={`transition hover:bg-orange-50/40 ${
                      idx % 2 === 1 ? "bg-gray-50/40" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                          {u.name
                            .split(" ")
                            .filter(Boolean)
                            .map((part) => part[0]?.toUpperCase())
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-gray-900">
                            {u.name}
                          </div>
                          <div className="truncate text-xs text-gray-500 sm:hidden">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-gray-700 max-w-xs truncate sm:max-w-none">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 align-middle text-gray-700 max-w-xs truncate sm:max-w-none">
                      {u.phone}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${roleBadgeClasses(
                          u.role,
                        )}`}
                      >
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-gray-600">
                      <div className="text-xs sm:text-sm">
                        {u.createdAtLabel}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
