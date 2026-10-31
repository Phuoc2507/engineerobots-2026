import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import RulesTabs from "@/components/landing/RulesTabs";
import MobileCta from "@/components/landing/MobileCta";
import { ArenaShowcase, Prizes, Footer, Intro, Leaderboard, RegisterCta, Timeline } from "@/components/landing/Sections";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Intro />
        <RulesTabs />
        <Leaderboard />
        <ArenaShowcase />
        <Prizes />
        <Timeline />
        <RegisterCta />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
