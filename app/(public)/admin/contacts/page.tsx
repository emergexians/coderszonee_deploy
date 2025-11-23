// app/(public)/admin/contacts/page.tsx
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
type StatusParam = Status | "all";

const DEFAULT_PAGE_SIZE: PageSize = 10;

// Reason type inferred from ContactDTO
type Reason = Exclude<ContactDTO["reason"], undefined>;

type ContactLean = {
  _id: unknown;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  status?: Status;
  createdAt?: Date | string;
  phone?: string;
  company?: string;
  reason?: string | null;
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeReason(reason: ContactLean["reason"]): ContactDTO["reason"] {
  const allowed: Reason[] = [
    "support",
    "partnership",
    "hiring",
    "feedback",
    "other",
  ];
  if (typeof reason === "string" && allowed.includes(reason as Reason)) {
    return reason as Reason;
  }
  return undefined;
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

  // Next.js 15: searchParams is a Promise
  const sp = await searchParams;

  // ---------- Parse & validate params
  const rawQ = (sp?.q ?? "").trim();
  const q = rawQ.slice(0, 200); // cap to avoid expensive regex

  const rawStatus = (sp?.status ?? "all").toLowerCase();
  const statusParam: StatusParam = ["new", "read", "archived", "all"].includes(
    rawStatus as StatusParam,
  )
    ? (rawStatus as StatusParam)
    : "all";

  const statusFilter: Status | undefined =
    statusParam === "all" ? undefined : statusParam;

  const pageRaw = Number.parseInt(sp?.page || "1", 10);
  const limitRaw = Number.parseInt(sp?.limit || String(DEFAULT_PAGE_SIZE), 10);

  const perPage: PageSize = PAGE_SIZES.includes(limitRaw as PageSize)
    ? (limitRaw as PageSize)
    : DEFAULT_PAGE_SIZE;

  // ---------- Build Mongo filter
  const filter: Record<string, unknown> = {};
  if (statusFilter) {
    filter.status = statusFilter;
  }

  if (q) {
    const re = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { name: re },
      { email: re },
      { subject: re },
      { message: re },
    ];
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
      .lean<ContactLean[]>();

    items = docs.map((d): ContactDTO => ({
      _id: String(d._id),
      name: d.name || "",
      email: d.email || "",
      subject: d.subject || "",
      message: d.message || "",
      status: (d.status || "new") as Status,
      createdAt: d.createdAt ? String(d.createdAt) : undefined,
      phone: d.phone || "",
      company: d.company || "",
      reason: normalizeReason(d.reason),
    }));
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "message" in err &&
      typeof (err as { message: unknown }).message === "string"
    ) {
      queryError = (err as { message: string }).message;
    } else {
      queryError = "Failed to load contacts. Please try again.";
    }

    total = 0;
    items = [];
    page = 1;
  }

  const initialStatus: Status | "all" = statusFilter ?? "all";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
        <p className="text-sm text-gray-600">
          Manage messages submitted via your Contact page
          {total ? ` — ${total} total` : ""}.
        </p>
        <ContactsToolbar initialQ={q} initialStatus={initialStatus} />
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
