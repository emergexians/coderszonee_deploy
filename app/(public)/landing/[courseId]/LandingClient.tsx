// app\(public)\landing\[courseId]\LandingClient.tsx

"use client";

import Link from "next/link";
import { FileText, BookOpen } from "lucide-react";
import Image from "next/image";

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

export default function LandingClient({
  data,
  courseSlug,
}: {
  data: LandingData;
  courseSlug: string;
}) {
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
            <a
              href="#register"
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition inline-flex items-center gap-2"
            >
              Get Started
            </a>
            <a
              href="#stack"
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition inline-flex items-center gap-2"
            >
              <FileText size={20} />
              Download Curriculum
            </a>
            {courseSlug && (
              <Link
                href={`/courses/${courseSlug}`}
                className="px-6 py-3 bg-white/10 backdrop-blur text-white font-semibold rounded-lg hover:bg-white/20 transition inline-flex items-center gap-2 border border-white/30"
              >
                <BookOpen size={20} />
                View More Details
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ================= STACK ================= */}
      <section 
        id="stack" 
        className="py-24 relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600"
        // style={{
          // background: "linear-gradient(135deg, violet-300 0%, indigo-300 50%, blue-300 100%)",
        // }}
      >
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h2 className="text-center text-4xl font-bold text-white-900 mb-3">
            Technology Stack You Will Master
          </h2>
          <p className="text-center text-white-700 mb-12">
            Hands-on tools used in real-world AI applications
          </p>

          {data.techStacks && data.techStacks.length > 0 ? (
            <div className="grid md:grid-cols-4 gap-6">
              {data.techStacks.map((stack, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <h4 className="font-bold text-lg text-gray-900">
                    {stack.name}
                  </h4>

                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                    {stack.description}
                  </p>

                  {stack.projects && stack.projects.length > 0 && (
                    <>
                      <hr className="my-4 border-gray-300" />

                      <p className="text-sm font-semibold text-gray-900">
                        Projects you will build
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        {stack.projects.join(", ")}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 mt-8">
              Tech stack information will be added soon.
            </p>
          )}
        </div>
      </section>

      {/* ================= AUDIENCE ================= */}
      <section 
        id="who" 
        className="py-24 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 50%, #fdba74 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h2 className="text-center text-4xl font-bold text-gray-900 mb-3">
            Who Is This Course For?
          </h2>
          <p className="text-center text-gray-700 mb-12">
            Built for ambitious learners ready to work on real-world AI systems
          </p>

          {data.audience && data.audience.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {data.audience.map((a, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 text-center"
                >
                  <h5 className="font-bold text-lg text-gray-900">
                    {a.title}
                  </h5>
                  <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                    {a.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 mt-8">
              Audience information will be added soon.
            </p>
          )}

          <div className="text-center mt-10">
            <p className="font-semibold text-gray-900 mb-4">
              Not sure if this course is right for you?
            </p>
            <a
              href="https://api.whatsapp.com/send/?phone=918601530993"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition shadow-md"
            >
              💬 Talk to Our Experts
            </a>
          </div>
        </div>
      </section>

      {/* ================= TOOLS / MARQUEE ================= */}
      <section id="tools" className="py-24 bg-gradient-to-r from-purple-400 to-orange-600 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">
            Tools & Platforms You Will Work With
          </h2>

          {data.tools && data.tools.length > 0 ? (
            <div className="flex gap-8 mt-12 animate-marquee">
              {[...data.tools, ...data.tools].map((tool, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 shadow min-w-[180px] flex justify-center"
                >
                  <Image 
                    src={tool.image} 
                    alt={tool.alt || "tool"} 
                    width={100} 
                    height={100} 
                    className="h-10 object-contain grayscale hover:grayscale-0 transition" 
                  />
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

      {/* ================= REGISTRATION FORM ================= */}
      <section id="register" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div>
              <span className="inline-block px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full mb-4">
                🚀 Admissions Open
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Become a <span className="text-orange-500">Certified Full Stack AI Engineer</span>
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Learn by building real-world AI systems with expert mentorship and career guidance.
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold text-lg">✅</span>
                  <span className="text-gray-700">Industry-ready AI projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold text-lg">✅</span>
                  <span className="text-gray-700">Resume & interview preparation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold text-lg">✅</span>
                  <span className="text-gray-700">Limited seats for focused mentoring</span>
                </li>
              </ul>
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                Register Now
              </h4>
              <p className="text-gray-600 text-sm mb-6">
                Secure your spot — our team will contact you shortly
              </p>

              <form method="POST" action="/api/register" className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Submit Application
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  🔒 We respect your privacy. No spam, ever.
                </p>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ================= REGISTER CTA ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center text-black">
          <h2 className="text-3xl font-bold">
            Start Your Journey Today
          </h2>

          <p className="mt-4 text-gray-600">
            Limited seats. Industry mentors. Real projects.
          </p>

          <a
            href="https://api.whatsapp.com/send/?phone=918601530993"
            target="_blank"
            className="inline-block mt-6 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition shadow-lg"
          >
            Talk to Our Experts
          </a>
        </div>
      </section>
    </main>
  );
}
