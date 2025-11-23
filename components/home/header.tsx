"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import CourseNavbar from "@/components/CourseNavbar";
import SkillPathNavbar from "@/components/SkillPathNavbar";
import CareerPathNavbar from "@/components/CareerPathNavbar";

// For mobile accordion only
const courseCategories = [
  { title: "Web Development", sub: ["HTML & CSS", "JavaScript", "React / Next.js", "Node.js", "Full-Stack"] },
  { title: "Data Science", sub: ["Python", "Pandas", "Machine Learning", "Deep Learning", "Statistics"] },
  { title: "AI & ML", sub: ["NLP", "Computer Vision", "Generative AI", "Reinforcement Learning"] },
  { title: "Business", sub: ["Marketing", "Finance", "Entrepreneurship", "Product Management"] },
  { title: "Design", sub: ["UI/UX", "Graphic Design", "Figma", "3D & Motion"] },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // mega menu toggles
  const [showCourses, setShowCourses] = useState(false);
  const [showSkillPath, setShowSkillPath] = useState(false);
  const [showCareerPath, setShowCareerPath] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setOpenCategory(null);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    if (typeof window !== "undefined") {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, []);

  const links = [
    { name: "Home", href: "/" },
    { name: "Hackathon", href: "/hackathon" },
    { name: "Courses", href: "/courses" },
    { name: "Skill Path", href: "/skillpath" },
    { name: "Career Path", href: "/careerpath" },
    { name: "Contact", href: "/contact" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Info Bar */}
      <div className="hidden md:block bg-gray-900 text-gray-200 text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Mail size={16} className="text-orange-400" />
              support@coderszonee.com
            </span>
            <span className="flex items-center gap-2">
              <Phone size={16} className="text-orange-400" />
              +91 9599130993
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-orange-400" />
              Dwarka Sec-14, Delhi - 110078
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="https://facebook.com" className="hover:text-orange-400" aria-label="Facebook">
              <Facebook size={18} />
            </Link>
            <Link href="https://instagram.com/coderszonee" className="hover:text-orange-400" aria-label="Instagram">
              <Instagram size={18} />
            </Link>
            <Link href="https://youtube.com/@coderszonee" className="hover:text-orange-400" aria-label="YouTube">
              <Youtube size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={[
          "relative", // ⬅️ makes dropdowns anchor to the whole nav
          "transition-colors duration-200",
          scrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 shadow-sm"
            : "bg-white dark:bg-gray-900",
        ].join(" ")}
        // keep menus open when hovering the blank area under the links
        onMouseLeave={() => {
          setShowCourses(false);
          setShowSkillPath(false);
          setShowCareerPath(false);
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2" aria-label="Coderszonee Home">
              <Image src="/logo.png" alt="Coderszonee Logo" width={140} height={40} priority />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8 font-medium">
              {links.map((link) => {
                const isActive = pathname === link.href;
                const base = "inline-flex items-center px-1 py-2 transition-colors hover:text-orange-500";
                const active = isActive ? "text-orange-500" : "text-gray-700 dark:text-gray-200";

                if (link.name === "Courses") {
                  return (
                    <div
                      key={link.name}
                      className="pt-1"
                      onMouseEnter={() => {
                        setShowCourses(true);
                        setShowSkillPath(false);
                        setShowCareerPath(false);
                      }}
                    >
                      <Link href={link.href} className={`${base} ${active}`}>{link.name}</Link>
                    </div>
                  );
                }

                if (link.name === "Skill Path") {
                  return (
                    <div
                      key={link.name}
                      className="pt-1"
                      onMouseEnter={() => {
                        setShowCourses(false);
                        setShowSkillPath(true);
                        setShowCareerPath(false);
                      }}
                    >
                      <Link href={link.href} className={`${base} ${active}`}>{link.name}</Link>
                    </div>
                  );
                }

                if (link.name === "Career Path") {
                  return (
                    <div
                      key={link.name}
                      className="pt-1"
                      onMouseEnter={() => {
                        setShowCourses(false);
                        setShowSkillPath(false);
                        setShowCareerPath(true);
                      }}
                    >
                      <Link href={link.href} className={`${base} ${active}`}>{link.name}</Link>
                    </div>
                  );
                }

                return (
                  <Link key={link.name} href={link.href} className={`${base} ${active}`}>
                    {link.name}
                  </Link>
                );
              })}

              <span className="hidden lg:block h-6 w-px bg-gray-200 dark:bg-gray-700" aria-hidden />

              <div className="flex items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="rounded-lg border border-orange-500/90 text-orange-600 px-4 py-2.5 font-semibold shadow-sm hover:bg-orange-50 dark:hover:bg-orange-500/10 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-lg bg-orange-500 px-4 py-2.5 text-white font-semibold shadow-sm hover:bg-orange-600 transition"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden text-gray-700 dark:text-gray-200 p-2 -mr-2"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Desktop mega-menus (rendered relative to nav) */}
        <AnimatePresence>
          {showCourses && (
            <div
              onMouseEnter={() => setShowCourses(true)}
              onMouseLeave={() => setShowCourses(false)}
              className="z-40"
            >
              <CourseNavbar />
            </div>
          )}
          {showSkillPath && (
            <div
              onMouseEnter={() => setShowSkillPath(true)}
              onMouseLeave={() => setShowSkillPath(false)}
              className="z-40"
            >
              <SkillPathNavbar />
            </div>
          )}
          {showCareerPath && (
            <div
              onMouseEnter={() => setShowCareerPath(true)}
              onMouseLeave={() => setShowCareerPath(false)}
              className="z-40"
            >
              <CareerPathNavbar />
            </div>
          )}
        </AnimatePresence>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-800"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 space-y-3 font-medium bg-white dark:bg-gray-900">
                {links.map((link) => {
                  if (["Courses", "Skill Path", "Career Path"].includes(link.name)) {
                    const expanded = openCategory === link.name;
                    return (
                      <div key={link.name} className="space-y-2">
                        <button
                          onClick={() => setOpenCategory(expanded ? null : link.name)}
                          className="w-full flex justify-between items-center text-left py-2 hover:text-orange-500"
                          aria-expanded={expanded}
                          aria-controls={`panel-${link.name.replace(" ", "-")}`}
                        >
                          <span>{link.name}</span>
                          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        <AnimatePresence>
                          {expanded && (
                            <motion.div
                              id={`panel-${link.name.replace(" ", "-")}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="pl-3 space-y-3"
                            >
                              {link.name === "Courses" &&
                                courseCategories.map((cat) => (
                                  <div key={cat.title} className="space-y-1">
                                    <p className="font-semibold text-gray-700 dark:text-gray-200">{cat.title}</p>
                                    <ul className="ml-2 space-y-1 text-sm">
                                      {cat.sub.map((s) => (
                                        <li key={s}>
                                          <Link
                                            href={`/courses?category=${encodeURIComponent(s)}`}
                                            className="block py-1 text-gray-600 dark:text-gray-300 hover:text-orange-500"
                                          >
                                            {s}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}

                              {link.name === "Skill Path" && (
                                <ul className="space-y-1 text-sm">
                                  <li>
                                    <Link href="skillpath/frontend-developer-essentials-2025" className="block py-1 text-gray-600 dark:text-gray-300 hover:text-orange-500">
                                      Frontend Developer Essentials (2025)
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href="/skillpath/data-science-foundations-2025" className="block py-1 text-gray-600 dark:text-gray-300 hover:text-orange-500">
                                      Data Science Foundations (2025)
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href="/skillpath/mobile-app-dev-with-flutter-2025" className="block py-1 text-gray-600 dark:text-gray-300 hover:text-orange-500">
                                      Mobile App Dev with Flutter (2025)
                                    </Link>
                                  </li>
                                </ul>
                              )}

                              {link.name === "Career Path" && (
                                <ul className="space-y-1 text-sm">
                                  <li>
                                    <Link href="/careerpath/full-stack-developer-modern-web-dev-2025" className="block py-1 text-gray-600 dark:text-gray-300 hover:text-orange-500">
                                      Full Stack Developer
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href="/career/datascientist" className="block py-1 text-gray-600 dark:text-gray-300 hover:text-orange-500">
                                      Data Scientist
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href="/career/ai" className="block py-1 text-gray-600 dark:text-gray-300 hover:text-orange-500">
                                      AI Engineer
                                    </Link>
                                  </li>
                                </ul>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`block py-2 transition-colors hover:text-orange-500 ${isActive ? "text-orange-500" : ""}`}
                    >
                      {link.name}
                    </Link>
                  );
                })}

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href="/auth/signin"
                    className="flex-1 rounded-lg border border-orange-500/90 text-orange-600 px-4 py-2.5 font-semibold text-center shadow-sm hover:bg-orange-50 dark:hover:bg-orange-500/10 transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-white font-semibold text-center shadow-sm hover:bg-orange-600 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
