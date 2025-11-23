// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Contact } from "@/models/Contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const real = req.headers.get("x-real-ip") || "";
  const ip = (fwd.split(",")[0] || real || "").trim();
  return ip || undefined;
}

const ALLOWED_REASONS = new Set(["support", "partnership", "hiring", "feedback", "other"]);

function normalizeReason(v: unknown): "support" | "partnership" | "hiring" | "feedback" | "other" {
  const s = String(v || "other").toLowerCase().trim();
  return (ALLOWED_REASONS.has(s) ? s : "other") as any;
}

function isPlausibleEmail(email: string) {
  // very light check (not perfect, just to filter obvious invalids)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json().catch(() => ({} as any));

    // Raw values
    let name = String(body.name || "").trim();
    let email = String(body.email || "").trim().toLowerCase();
    let phone = String(body.phone || "").trim();
    let company = String(body.company || "").trim();
    const reason = normalizeReason(body.reason);
    let subject = String(body.subject || "").trim();
    let message = String(body.message || "").trim();
    const newsletter = Boolean(body.newsletter);
    const consent = Boolean(body.consent);
    const honeypot = String(body.website || "").trim(); // hidden field for bots

    // Honeypot: act successful, do nothing
    if (honeypot) return NextResponse.json({ ok: true }, { status: 200 });

    // Requireds
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 }
      );
    }
    if (!consent) {
      return NextResponse.json(
        { error: "Please accept the privacy consent to submit the form." },
        { status: 400 }
      );
    }
    if (!isPlausibleEmail(email)) {
      return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: "Message is too short." }, { status: 400 });
    }

    // Soft caps (server-side safety). Your schema already caps message @ 2000.
    if (name.length > 120) name = name.slice(0, 120);
    if (email.length > 200) email = email.slice(0, 200);
    if (phone.length > 40) phone = phone.slice(0, 40);
    if (company.length > 160) company = company.slice(0, 160);
    if (subject.length > 200) subject = subject.slice(0, 200);
    if (message.length > 2000) message = message.slice(0, 2000);

    const doc = await Contact.create({
      name,
      email,
      phone,
      company,
      reason,
      subject,
      message,
      newsletter,
      consent,
      status: "new",
      meta: {
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") || undefined,
        referer: req.headers.get("referer") || undefined,
      },
    });

    return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/contacts", e);
    return NextResponse.json({ error: "Failed to submit contact message." }, { status: 500 });
  }
}
