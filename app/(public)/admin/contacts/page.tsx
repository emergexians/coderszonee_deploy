// app/admin/contacts/page.tsx
import { dbConnect } from "@/lib/db";
import { Contact } from "@/models/Contact";
import ContactsToolbar from "@/components/admin/contact/ContactsToolbar";
import ContactsPagination from "@/components/admin/contact/ContactsPagination";
import ContactRow, { ContactDTO } from "@/components/admin/contact/ContactRow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZES = [10, 25, 50] as const;
type PageSize = (typeof PAGE_SIZES)[number];
type Status = "new" | "read" | "archived";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    limit?: string;
  }>;
}) {
  await dbConnect();

  // ✅ Await searchParams in Next.js 15+
  const sp = await searchParams;

  // -------- Parse & validate params
  const rawQ = (sp?.q ?? "").trim();
  const q = rawQ.slice(0, 200); // cap to avoid expensive regex
  const statusParam = (sp?.status ?? "all").toLowerCase();
  const statusFilter: Status | undefined =
    (["new", "read", "archived"] as const).includes(statusParam as any)
      ? (statusParam as Status)
      : undefined;

  const pageRaw = Number.parseInt(sp?.page || "1", 10);
  const limitRaw = Number.parseInt(sp?.limit || "10", 10);
  const perPage: PageSize = (PAGE_SIZES as readonly number[]).includes(limitRaw)
    ? (limitRaw as PageSize)
    : 10;

  // -------- Build Mongo filter
  const filter: Record<string, any> = {};
  if (statusFilter) filter.status = statusFilter;
  if (q) {
    const re = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: re }, { email: re }, { subject: re }, { message: re }];
  }

  let total = 0;
  let items: ContactDTO[] = [];
  let page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  let queryError: string | null = null;

  try {
    total = await Contact.countDocuments(filter).maxTimeMS(10_000);

    const totalPages = Math.max(1, Math.ceil(total / perPage));
    page = Math.min(Math.max(1, page), totalPages);

    const docs = await Contact.find(filter)
      .collation({ locale: "en", strength: 2 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .maxTimeMS(10_000)
      .lean();

    items = docs.map((d: any) => ({
      _id: String(d._id),
      name: d.name || "",
      email: d.email || "",
      subject: d.subject || "",
      message: d.message || "",
      status: (d.status || "new") as Status,
      createdAt: d.createdAt ? String(d.createdAt) : undefined,
      phone: d.phone || "",
      company: d.company || "",
      reason: d.reason || "",
    }));
  } catch (err: any) {
    queryError =
      typeof err?.message === "string"
        ? err.message
        : "Failed to load contacts. Please try again.";
    total = 0;
    items = [];
    page = 1;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
        <p className="text-sm text-gray-600">
          Manage messages submitted via your Contact page
          {total ? ` — ${total} total` : ""}.
        </p>
        <ContactsToolbar
          initialQ={q}
          initialStatus={
            (statusParam as any) === "all" || !statusFilter
              ? "all"
              : (statusFilter as any)
          }
        />
      </header>

      {queryError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {queryError}
        </div>
      )}

      <div className="rounded-2xl border bg-white overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">From</th>
              <th className="px-4 py-3 text-left font-semibold">Subject</th>
              <th className="px-4 py-3 text-left font-semibold">Message</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {items.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-8 text-center text-gray-500"
                  colSpan={5}
                >
                  {queryError
                    ? "Unable to load messages."
                    : "No messages found."}
                </td>
              </tr>
            ) : (
              items.map((c) => <ContactRow key={c._id} c={c} />)
            )}
          </tbody>
        </table>

        <ContactsPagination total={total} page={page} perPage={perPage} />
      </div>
    </div>
  );
}
