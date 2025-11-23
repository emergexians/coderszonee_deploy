"use client";

import { useState } from "react";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <footer className="relative bg-gradient-to-b from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border-t border-orange-200/40 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <svg
                width="44"
                height="44"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <rect width="64" height="64" rx="12" fill="url(#g)" />
                <path
                  d="M18 40 L30 22 L46 42"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#FFD7A8" />
                    <stop offset="1" stopColor="#FF8A4C" />
                  </linearGradient>
                </defs>
              </svg>
              <h3 className="text-2xl font-extrabold text-orange-700 dark:text-orange-400">
                Coderszonee
              </h3>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              Empowering learners with future-ready skills in tech and beyond.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {["Home", "Courses", "Career Paths", "Contact"].map((item, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="relative group hover:text-orange-600 dark:hover:text-orange-400 transition"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-4">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              {["Blog", "Tutorials", "FAQ", "Support"].map((item, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="relative group hover:text-orange-600 dark:hover:text-orange-400 transition"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Social */}
          <div>
            <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-4">
              Stay Updated
            </h4>
            <form
              onSubmit={handleSubmit}
              className={`flex bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${
                status === "error"
                  ? "border-red-500"
                  : "border-orange-200 dark:border-gray-700"
              } overflow-hidden`}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 text-sm bg-transparent outline-none placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="submit"
                className="px-1 py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition rounded-l-none"
              >
                Subscribe
              </button>
            </form>
            {status === "success" && (
              <p className="text-xs mt-2 text-green-600">Subscribed!</p>
            )}
            {status === "error" && (
              <p className="text-xs mt-2 text-red-600">
                Please enter a valid email.
              </p>
            )}

            <h4 className="font-semibold text-orange-600 dark:text-orange-400 mt-6 mb-3">
              Follow Us
            </h4>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="relative group p-2.5 rounded-full bg-white dark:bg-gray-800 shadow hover:shadow-lg transition transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      boxShadow: "0 0 12px rgba(255,130,54,0.5)",
                    }}
                  />
                  <Icon className="w-5 h-5 text-orange-600 dark:text-orange-400 relative z-10" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-orange-200/40 dark:border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400 gap-3">
          <p>© {new Date().getFullYear()} Coderszonee. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-orange-600 dark:hover:text-orange-400 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-orange-600 dark:hover:text-orange-400 transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-orange-600 dark:hover:text-orange-400 transition">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
