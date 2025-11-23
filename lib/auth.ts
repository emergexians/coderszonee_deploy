// lib/auth.ts
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import User, { UserDoc } from "@/models/User";
import { dbConnect } from "@/lib/db";
import { ObjectId } from "mongoose";

export type SessionUser = {
  id: string;
  name?: string;
  email?: string;
  urn?: string | null;
};

function extractIdFromPayload(payload: any): string | null {
  // common claim names: sub, id, userId
  if (!payload) return null;
  if (typeof payload.sub === "string" && payload.sub) return payload.sub;
  if (typeof payload.id === "string" && payload.id) return payload.id;
  if (typeof payload.userId === "string" && payload.userId) return payload.userId;
  // sometimes payload.sub is numeric / object — convert
  if (payload.sub && typeof payload.sub === "object" && payload.sub.toString) return String(payload.sub);
  return null;
}

export async function getCurrentUser(_req: unknown): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    // verifyToken should throw if invalid/expired
    const payload = verifyToken<any>(token);
    const id = extractIdFromPayload(payload);
    if (!id) return null;

    await dbConnect();

    // fetch minimal fields including urn
    const user = await User.findById(id, { name: 1, email: 1, urn: 1 }).lean<UserDoc | null>().exec();
    if (!user) return null;

    return {
      id: user._id.toString(),
      name: user.name ?? "",
      email: user.email ?? "",
      urn: (user as any).urn ?? null,
    };
  } catch (err) {
    // Do NOT leak token content, but log for dev
    console.error("getCurrentUser error:", err);
    return null;
  }
}
