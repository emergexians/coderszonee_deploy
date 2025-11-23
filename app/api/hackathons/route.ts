import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Hackathon, HackathonDoc } from "@/models/Hackathon";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function statusFilterToQuery(status?: string) {
  const now = new Date();
  if (status === "upcoming") return { startAt: { $gt: now } };
  if (status === "ongoing") return { startAt: { $lte: now }, endAt: { $gte: now } };
  if (status === "past") return { endAt: { $lt: now } };
  return {};
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const status = url.searchParams.get("status") || undefined;
    const publishedOnly = url.searchParams.get("published") === "true";

    const filter: Record<string, unknown> = {};
    Object.assign(filter, statusFilterToQuery(status));
    if (publishedOnly) filter.published = true;

    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: re }, { tagline: re }, { desc: re }];
    }

    const items = await Hackathon.find(filter).sort({ startAt: 1 }).lean<HackathonDoc[]>();
    return NextResponse.json(items, { status: 200 });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch hackathons" }, { status: 500 });
  }
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = (await req.json()) as Partial<HackathonDoc>;

    if (!body.title || !body.startAt || !body.endAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = body.slug?.trim() || slugify(body.title);
    const created = await Hackathon.create({ ...body, slug });
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Create failed" }, { status: 400 });
  }
}

// ✅ Update hackathon
export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = (await req.json()) as Partial<HackathonDoc> & { id: string };

    if (!body.id || !mongoose.Types.ObjectId.isValid(body.id)) {
      return NextResponse.json({ error: "Invalid or missing hackathon ID" }, { status: 400 });
    }

    const slug = body.slug?.trim() || (body.title ? slugify(body.title) : undefined);

    const updated = await Hackathon.findByIdAndUpdate(
      body.id,
      { ...body, ...(slug ? { slug } : {}) },
      { new: true }
    ).lean<HackathonDoc | null>();

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
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid or missing hackathon ID" }, { status: 400 });
    }

    const deleted = await Hackathon.findByIdAndDelete(id).lean<HackathonDoc | null>();

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
