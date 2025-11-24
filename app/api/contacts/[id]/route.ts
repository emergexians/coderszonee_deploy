// app/api/admin/contacts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Contact } from "@/models/Contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContactStatus = "new" | "read" | "archived";

type Ctx = {
  params: Promise<{ id: string }>;
};

// PATCH /api/admin/contacts/:id  → update status
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await dbConnect();

    const body = (await req.json().catch(() => ({}))) as {
      status?: ContactStatus;
    };

    const { status } = body;

    if (!status || !["new", "read", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { id } = await params; // ✅ await async params

    const updated = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, contact: updated }, { status: 200 });
  } catch (e: unknown) {
    console.error("PATCH /api/admin/contacts/[id]", e);
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/contacts/:id  → remove contact
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await dbConnect();

    const { id } = await params; // ✅ await async params

    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    console.error("DELETE /api/admin/contacts/[id]", e);
    const message = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
