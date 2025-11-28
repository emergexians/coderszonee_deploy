// app/api/hackathons/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Hackathon, HackathonDoc } from "@/models/Hackathon";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ Next 15+ expects async params
type Ctx = {
  params: Promise<{ id: string }>;
};

// ✅ GET one hackathon by ID
export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    await dbConnect();

    const { id } = await params; // ✅ await async params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid hackathon ID" },
        { status: 400 }
      );
    }

    const hackathon = await Hackathon.findById(id).lean<HackathonDoc | null>();
    if (!hackathon) {
      return NextResponse.json(
        { error: "Hackathon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(hackathon, { status: 200 });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to fetch hackathon" },
      { status: 500 }
    );
  }
}

// ✅ Update hackathon
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await dbConnect();

    const { id } = await params; // ✅ await async params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid hackathon ID" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as Partial<HackathonDoc>;

    const updated = await Hackathon.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean<HackathonDoc | null>();

    if (!updated) {
      return NextResponse.json(
        { error: "Hackathon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

// ✅ Delete hackathon
export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    await dbConnect();

    const { id } = await params; // ✅ await async params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid hackathon ID" },
        { status: 400 }
      );
    }

    const deleted = await Hackathon.findByIdAndDelete(id).lean<HackathonDoc | null>();
    if (!deleted) {
      return NextResponse.json(
        { error: "Hackathon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Hackathon deleted successfully" },
      { status: 200 }
    );
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
