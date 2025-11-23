import { dbConnect } from "@/lib/db";
import { Hackathon, HackathonDoc } from "@/models/Hackathon";
import Link from "next/link";
import Image from "next/image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function section(items: HackathonDoc[], title: string) {
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((h) => (
          <Link
            key={h._id.toString()}
            href={`/hackathons/${h.slug}`}
            className="rounded-2xl bg-white overflow-hidden hover:shadow-sm"
          >
            <Image
              src={h.cover || "/assets/hackathons/default.png"}
              alt={h.title}
              width={400}
              height={160}
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <div className="font-semibold line-clamp-1">{h.title}</div>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {h.tagline || h.desc}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                {new Date(h.startAt).toLocaleDateString()} –{" "}
                {new Date(h.endAt).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function HackathonsIndex() {
  await dbConnect();
  const all = await Hackathon.find({ published: true })
    .sort({ startAt: 1 })
    .lean<HackathonDoc[]>();

  const now = Date.now();
  const upcoming = all.filter(
    (h) => new Date(h.startAt).getTime() > now
  );
  const ongoing = all.filter(
    (h) =>
      new Date(h.startAt).getTime() <= now &&
      new Date(h.endAt).getTime() >= now
  );
  const past = all
    .filter((h) => new Date(h.endAt).getTime() < now)
    .slice(0, 12); // trim

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-bold">Hackathons</h1>
      {section(ongoing, "Ongoing")}
      {section(upcoming, "Upcoming")}
      {section(past, "Past")}
    </div>
  );
}
