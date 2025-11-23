// app/contact/page.tsx
"use client";

import ContactForm from "@/components/public/ContactForm";
import { Mail, MapPin, Phone, Github, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <div className="relative">
      {/* gradient background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute top-40 -right-20 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center space-y-3"
        >
          <span className="inline-block rounded-full bg-gradient-to-r from-orange-600 to-fuchsia-600 px-3 py-1 text-xs font-semibold text-white/90">
            We’re here to help
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Get in touch with{" "}
            <span className="bg-gradient-to-r from-orange-600 to-cyan-600 bg-clip-text text-transparent">
              CodersZonee
            </span>
          </h1>
          <p className="text-sm text-gray-600">
            Questions, partnerships, feedback—send a message and we’ll get back within 1 business day.
          </p>
        </motion.header>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Form card */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
            className="md:col-span-2 rounded-2xl border bg-white/70 backdrop-blur p-5 shadow-sm ring-1 ring-black/5"
            aria-labelledby="contact-form-title"
          >
            <h2 id="contact-form-title" className="sr-only">Contact form</h2>
            <ContactForm />
          </motion.section>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="space-y-4"
          >
            <GlassCard title="Reach us">
              {/* FIX: wrap <li> items in a <ul> */}
              <ul className="mt-2 space-y-2">
                <ListItem icon={<Mail className="h-4 w-4" />}>
                  <a
                    href="mailto:hello@coderszonee.com"
                    className="text-orange-600 hover:underline focus-visible:ring-2 focus-visible:ring-orange-300 rounded"
                  >
                    hello@coderszonee.com
                  </a>
                </ListItem>

                <ListItem icon={<Phone className="h-4 w-4" />}>
                  <a
                    href="tel:+910000000000"
                    className="hover:underline focus-visible:ring-2 focus-visible:ring-orange-300 rounded"
                  >
                    +91 00000 00000
                  </a>
                </ListItem>

                <ListItem icon={<MapPin className="h-4 w-4" />}>
                  <a
                    href="https://maps.google.com/?q=Dwarka,+New+Delhi,+India"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline focus-visible:ring-2 focus-visible:ring-orange-300 rounded"
                  >
                    Dwarka, New Delhi, India
                  </a>
                </ListItem>
              </ul>
            </GlassCard>

            <GlassCard title="Social">
              <ul className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <Social href="https://github.com" Icon={Github} label="GitHub" />
                <Social href="https://twitter.com" Icon={Twitter} label="Twitter" />
                <Social href="https://linkedin.com" Icon={Linkedin} label="LinkedIn" />
              </ul>
            </GlassCard>

            <GlassCard title="Support hours">
              <p className="mt-2 text-sm text-gray-700">
                Mon–Fri, 9:00–18:00 IST.<br />We usually reply within 1 business day.
              </p>
            </GlassCard>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

function GlassCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white/70 backdrop-blur p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition">
      <h3 className="font-semibold">{title}</h3>
      <div>{children}</div>
    </section>
  );
}

function ListItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm text-gray-700">
      <span className="text-gray-400">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

function Social({
  href,
  Icon,
  label,
}: {
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="group flex items-center justify-center gap-1 rounded-xl border px-3 py-2 hover:bg-gray-50 transition focus-visible:ring-2 focus-visible:ring-orange-300"
      >
        <Icon className="h-4 w-4 text-gray-700 group-hover:scale-110 transition-transform" />
        <span className="text-gray-700">{label}</span>
      </a>
    </li>
  );
}
