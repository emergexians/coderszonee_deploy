// lib/auth.ts
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import User, { UserDoc } from "@/models/User";
import { dbConnect } from "@/lib/db";

export type SessionUser = {
  id: string;
  name?: string;
  email?: string;
  urn?: string | null;
};

// Define the shape you expect in the JWT.
// Add/remove fields based on what your token actually contains.
type TokenPayload = {
  sub?: string | { toString(): string };
  id?: string;
  userId?: string;
  [key: string]: unknown;
};

function extractIdFromPayload(payload: TokenPayload | null | undefined): string | null {
  if (!payload) return null;

  if (typeof payload.sub === "string" && payload.sub) return payload.sub;
  if (typeof payload.id === "string" && payload.id) return payload.id;
  if (typeof payload.userId === "string" && payload.userId) return payload.userId;

  if (
    payload.sub &&
    typeof payload.sub === "object" &&
    "toString" in payload.sub &&
    typeof payload.sub.toString === "function"
  ) {
    return String(payload.sub.toString());
  }

  return null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    // verifyToken should throw if invalid/expired
    const payload = verifyToken<TokenPayload>(token);
    const id = extractIdFromPayload(payload);
    if (!id) return null;

    await dbConnect();

    // Make sure urn is part of UserDoc typing OR use a local type extension:
    type LeanUser = Pick<UserDoc, "_id" | "name" | "email"> & { urn?: string | null };

    const user = await User.findById(id, { name: 1, email: 1, urn: 1 })
      .lean<LeanUser | null>()
      .exec();

    if (!user) return null;

    return {
      id: user._id.toString(),
      name: user.name ?? "",
      email: user.email ?? "",
      urn: user.urn ?? null,
    };
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}
