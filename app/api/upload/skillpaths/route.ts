// app/api/upload/skillpaths/route.ts
import { NextResponse } from "next/server";
import {
  v2 as cloudinary,
  type UploadApiResponse,
  type UploadApiErrorResponse,
} from "cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as unknown as File | null;
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If Cloudinary is set, use it.
    if (process.env.CLOUDINARY_URL) {
      const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "skillpaths" },
          (err: UploadApiErrorResponse | undefined, res: UploadApiResponse | undefined) => {
            if (err || !res) {
              return reject(err ?? new Error("Cloudinary upload failed"));
            }
            return resolve(res);
          }
        );
        stream.end(buffer);
      });

      return NextResponse.json({ url: uploaded.secure_url });
    }

    // Local/dev fallback: write into /public/uploads/skillpaths and return a web URL.
    const pathMod = await import("path");
    const fs = await import("fs/promises");

    const safeName = `skill-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const dir = pathMod.join(process.cwd(), "public", "uploads", "skillpaths");
    const filePath = pathMod.join(dir, safeName);

    await fs.mkdir(dir, { recursive: true }); // ensure folder exists
    await fs.writeFile(filePath, buffer);

    // Return a URL that Next can serve from /public
    const url = `/uploads/skillpaths/${safeName}`;
    return NextResponse.json({ url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[upload][skillpaths]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
