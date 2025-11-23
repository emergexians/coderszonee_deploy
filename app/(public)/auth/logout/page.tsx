"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } finally {
        router.replace("/auth/signin");
      }
    })();
  }, [router]);

  return (
    <div className="min-h-[60vh] grid place-items-center text-sm text-gray-600">
      Logging you out…
    </div>
  );
}
