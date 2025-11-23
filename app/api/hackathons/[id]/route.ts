import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Hackathon, HackathonDoc } from "@/models/Hackathon";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ GET one hackathon by ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid hackathon ID" }, { status: 400 });
    }

    const hackathon = await Hackathon.findById(params.id).lean<HackathonDoc | null>();
    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    return NextResponse.json(hackathon, { status: 200 });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to fetch hackathon" }, { status: 500 });
  }
}

// ✅ Update hackathon
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid hackathon ID" }, { status: 400 });
    }

    const body = (await req.json()) as Partial<HackathonDoc>;

    const updated = await Hackathon.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).lean<HackathonDoc | null>();

    if (!updated) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
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
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid hackathon ID" }, { status: 400 });
    }

    const deleted = await Hackathon.findByIdAndDelete(params.id).lean<HackathonDoc | null>();
    if (!deleted) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Hackathon deleted successfully" }, { status: 200 });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
