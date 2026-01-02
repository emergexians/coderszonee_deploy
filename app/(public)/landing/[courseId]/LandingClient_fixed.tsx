// app\(public)\landing\[courseId]\LandingClient.tsx

"use client";

import Image from "next/image";
import { useEffect } from "react";

type Offering = {
  text: string;
};

type TechStack = {
  name: string;
  description: string;
  projects: string[];
};

type Audience = {
  title: string;
  description: string;
};

type Tool = {
  image: string;
  alt?: string;
};

type LandingData = {
  title: string;
  subtitle: string;
  offerings?: Offering[];
  techStacks?: TechStack[];
  audience?: Audience[];
  tools?: Tool[];
};

export default function LandingClient({ data }: { data: LandingData }) {
  return (
    <main className="font-sans">

      {/* ================= HERO ================= */}
      <section
        id="hero"
        className="min-h-screen flex items-center text-center text-white px-6"
        style={{
          background: "linear-gradient(135deg,#0d6efd,#6610f2)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold">
            {data.title}
          </h1>

          <p className="mt-4 text-xl opacity-90">
            {data.subtitle}
          </p>

          {data.offerings && data.offerings.length > 0 && (
            <p className="mt-6 font-semibold">
              {data.offerings.map((o, i) => (
                <span key={i}>
                  {o.text}
                  {i !== data.offerings!.length - 1 && " | "}
                </span>
              ))}
            </p>
          )}

          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <a href="#register" className="btn-warning">
              Get Started
            </a>
            <a href="#stack" className="btn-outline">
              View Curriculum
            </a>
          </div>
        </div>
      </section>

      {/* ================= STACK ================= */}
      <section id="stack" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-3xl font-bold">
            Technology Stack You Will Master
          </h2>

          {data.techStacks && data.techStacks.length > 0 ? (
            <div className="grid md:grid-cols-4 gap-6 mt-12">
              {data.techStacks.map((stack, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow hover:scale-105 transition"
                >
                  <h4 className="font-semibold text-lg">
                    {stack.name}
                  </h4>

                  <p className="text-sm text-gray-600 mt-2">
                    {stack.description}
                  </p>

                  {stack.projects && stack.projects.length > 0 && (
                    <>
                      <hr className="my-4" />

                      <p className="text-sm font-medium">
                        Projects you'll build
                      </p>

                      <p className="text-sm text-gray-500">
                        {stack.projects.join(", ")}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-8">
              Tech stack information will be added soon.
            </p>
          )}
        </div>
      </section>

      {/* ================= AUDIENCE ================= */}
      <section id="who" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-3xl font-bold">
            Who Is This Course For?
          </h2>

          {data.audience && data.audience.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {data.audience.map((a, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 shadow hover:scale-105 transition text-center"
                >
                  <h5 className="font-semibold text-lg">
                    {a.title}
                  </h5>
                  <p className="text-sm text-gray-600 mt-2">
                    {a.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-8">
              Audience information will be added soon.
            </p>
          )}
        </div>
      </section>

      {/* ================= TOOLS / MARQUEE ================= */}
      <section id="tools" className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">
            Tools & Platforms You'll Work With
          </h2>

          {data.tools && data.tools.length > 0 ? (
            <div className="flex gap-8 mt-12 animate-marquee">
              {[...data.tools, ...data.tools].map((tool, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 shadow min-w-[180px] flex justify-center"
                >
                  {/* <img
                    src={tool.image}
                    alt={tool.alt || "tool"}
                    className="h-10 object-contain grayscale hover:grayscale-0 transition"
                  /> */}
                  <Image src={tool.image} alt={tool.alt || "tool"} width={100} height={100} className="h-10 object-contain grayscale hover:grayscale-0 transition" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-8">
              Tool information will be added soon.
            </p>
          )}
        </div>
      </section>

      {/* ================= REGISTER CTA ================= */}
      <section id="register" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">
            Start Your Journey Today
          </h2>

          <p className="mt-4 text-gray-600">
            Limited seats. Industry mentors. Real projects.
          </p>

          <a
            href="https://api.whatsapp.com/send/?phone=918601530993"
            target="_blank"
            className="inline-block mt-6 btn-warning"
            rel="noreferrer"
          >
            Talk to Our Experts
          </a>
        </div>
      </section>
    </main>
  );
}
