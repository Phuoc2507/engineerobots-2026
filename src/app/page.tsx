import Navbar from "@/components/landing/Navbar";
import { getContent } from "@/lib/content-server";
import Hero from "@/components/landing/Hero";
import RulesTabs from "@/components/landing/RulesTabs";
import MobileCta from "@/components/landing/MobileCta";
import { ArenaShowcase, Prizes, Footer, Intro, Leaderboard, RegisterCta, Timeline } from "@/components/landing/Sections";

export default async function Home() {
  const c = await getContent();
  return (
    <>
      <Navbar />
      <main>
        <Hero c={c} />
        <Intro c={c} />
        <RulesTabs specs={c.rules.robotSpecs} />
        <Leaderboard />
        <ArenaShowcase c={c} />
        <Prizes c={c} />
        <Timeline c={c} />
        <RegisterCta c={c} />
      </main>
      <Footer c={c} />
      <MobileCta />
    </>
  );
}
