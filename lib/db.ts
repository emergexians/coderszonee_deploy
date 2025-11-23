// lib/mongoose.ts
import mongoose from "mongoose";

const URI = process.env.MONGODB_URI;
if (!URI) {
  throw new Error("❌ Missing MONGODB_URI in environment variables");
}

// If your URI doesn't already include /dbname, force it here
const DB_NAME: string = process.env.MONGODB_DB ?? "coderszonee";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { __mongoose?: Cache };
if (!g.__mongoose) g.__mongoose = { conn: null, promise: null };

export async function dbConnect() {
  if (g.__mongoose!.conn) return g.__mongoose!.conn;

  if (!g.__mongoose!.promise) {
    mongoose.set("strictQuery", true);

    g.__mongoose!.promise = mongoose
      .connect(URI as string, {
        dbName: DB_NAME,          // ✅ safe string (never undefined)
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
        heartbeatFrequencyMS: 2000,
        retryWrites: true,
      })
      .catch((err) => {
        g.__mongoose!.promise = null;
        throw err;
      });
  }

  g.__mongoose!.conn = await g.__mongoose!.promise;
  return g.__mongoose!.conn;
}
