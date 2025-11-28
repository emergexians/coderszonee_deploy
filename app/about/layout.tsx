// app/about/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | EdTech",
  description: "Learn more about our mission, values, and team.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
