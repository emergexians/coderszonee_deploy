import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Contact } from "@/models/Contact"; // make sure this named export exists

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PATCH /api/admin/contacts/:id  → update status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { status } = (await req.json().catch(() => ({}))) as {
      status?: "new" | "read" | "archived";
    };

    if (!status || !["new", "read", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await Contact.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, contact: updated }, { status: 200 });
  } catch (e: any) {
    console.error("PATCH /api/admin/contacts/[id]", e);
    return NextResponse.json(
      { error: e?.message || "Update failed" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contacts/:id  → remove contact
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const deleted = await Contact.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 204 must have no body
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    console.error("DELETE /api/admin/contacts/[id]", e);
    return NextResponse.json(
      { error: e?.message || "Delete failed" },
      { status: 500 }
    );
  }
}
