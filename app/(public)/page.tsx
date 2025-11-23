import HeroPage from "@/components/home/hero";
import About from "@/components/home/About";
import TechStack from "@/components/home/TechStack";
import SkillPaths from "@/components/home/SkillPaths";
import CareerPaths from "@/components/home/CareerPaths";
import Courses from "@/components/home/Courses";
import Course from "@/components/home/Course";
import TeamSection from "@/components/home/team";
import FAQSection from "@/components/home/faqs";

export default function HomePage() {
  return (
    <main>
      <HeroPage />
      <About />
      <TechStack />
      <Courses />
      <SkillPaths />
      <CareerPaths />
      <Course />
      <TeamSection />
      <FAQSection />
    </main>
  );
}
