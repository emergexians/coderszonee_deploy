"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CheckCircle2, Sparkles } from "lucide-react";

type Props = {
  perks: string[];
};

function PerkCard({ text }: { text: string }) {
  return (
    <div
      className="
        group relative min-w-[260px] max-w-[260px]
        rounded-2xl border bg-white p-5 shadow-sm
        transition-all duration-300
        hover:-translate-y-2 hover:shadow-xl
      "
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
        <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
          {text}
        </p>
      </div>

      {/* subtle glow */}
      <div
        className="
          pointer-events-none absolute inset-0 rounded-2xl
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10
        "
      />
    </div>
  );
}

export default function CoursePerks({ perks }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, {
        xPercent: -50,
        repeat: -1,
        duration: 40,
        ease: "linear",
      });
    });

    return () => ctx.revert();
  }, []);

  if (!Array.isArray(perks) || perks.length === 0) {
    return null;
  }

  // Duplicate items for seamless infinite scroll
  const items = [...perks, ...perks];

  return (
    <section className="w-full pt-12">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold">What you’ll get</h2>
      </div>

      {/* Infinite track */}
      <div className="relative overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-6 w-max"
          onMouseEnter={() => gsap.globalTimeline.pause()}
          onMouseLeave={() => gsap.globalTimeline.resume()}
        >
          {items.map((perk, i) => (
            <PerkCard key={`${perk}-${i}`} text={perk} />
          ))}
        </div>
      </div>
    </section>
  );
}
