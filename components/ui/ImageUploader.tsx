"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageUploader({
  onUploaded,
}: { onUploaded?: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErr(null);

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();

    setUploading(false);

    if (!res.ok) {
      setErr(data?.error || "Upload failed");
      return;
    }

    setUrl(data.url);
    onUploaded?.(data.url);
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="block w-full"
      />
      {uploading && <p className="text-sm text-gray-500">Uploading…</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      {url && (
        <div className="relative h-40 w-full overflow-hidden rounded-xl border">
          <Image src={url} alt="Uploaded preview" fill className="object-cover" />
        </div>
      )}
    </div>
  );
}
