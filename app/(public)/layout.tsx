// app/(public)/layout.tsx
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import AssistantWidget from "@/components/AssistantWidget";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <AssistantWidget />
    </>
  );
}
