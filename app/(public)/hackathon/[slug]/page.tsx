import { dbConnect } from "@/lib/db";
import { Hackathon, HackathonDoc } from "@/models/Hackathon";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Calendar,
  MapPin,
  IndianRupee,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function HackathonDetail({
  params,
}: {
  params: { slug: string };
}) {
  await dbConnect();
  const h = await Hackathon.findOne({
    slug: params.slug,
    published: true,
  }).lean<HackathonDoc | null>();

  if (!h) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative h-64 w-full overflow-hidden rounded-2xl md:h-80">
          <Image
            src={h.cover || "/assets/hackathons/default.png"}
            alt={h.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold">{h.title}</h1>
            <p className="mt-2 text-gray-600">{h.tagline || h.desc}</p>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {new Date(h.startAt).toLocaleString()} —{" "}
                {new Date(h.endAt).toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {h.locationType || "online"}
                {h.locationName ? ` · ${h.locationName}` : ""}
              </div>
              {h.prizePool && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  {h.prizePool}
                </div>
              )}
            </div>

            {h.registrationUrl && (
              <a
                href={h.registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-white font-medium hover:bg-orange-700"
              >
                Register <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {h.desc && (
            <section className="rounded-2xl bg-white p-4">
              <h2 className="text-lg font-semibold">About</h2>
              <p className="mt-2 text-gray-700">{h.desc}</p>
            </section>
          )}

          {Array.isArray(h.schedule) && h.schedule.length > 0 && (
            <section className="rounded-2xl bg-white p-4">
              <h2 className="text-lg font-semibold">Schedule</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {h.schedule.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    <span className="font-medium">{s.time}</span>
                    <span>— {s.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {Array.isArray(h.rules) && h.rules.length > 0 && (
            <section className="rounded-2xl bg-white p-4">
              <h2 className="text-lg font-semibold">Rules</h2>
              <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-1">
                {h.rules.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="md:col-span-1 space-y-6">
          {Array.isArray(h.tracks) && h.tracks.length > 0 && (
            <div className="rounded-2xl bg-white p-4">
              <h3 className="font-semibold">Tracks</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                {h.tracks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(h.organizers) && h.organizers.length > 0 && (
            <div className="rounded-2xl bg-white p-4">
              <h3 className="font-semibold">Organizers</h3>
              <div className="mt-2 text-sm text-gray-700">
                {h.organizers.join(", ")}
              </div>
            </div>
          )}
          {Array.isArray(h.sponsors) && h.sponsors.length > 0 && (
            <div className="rounded-2xl bg-white p-4">
              <h3 className="font-semibold">Sponsors</h3>
              <div className="mt-2 text-sm text-gray-700">
                {h.sponsors.join(", ")}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
