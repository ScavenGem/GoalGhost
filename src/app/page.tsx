import { HeroSection } from "@/components/home/hero-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { HomeLiveMatches } from "@/components/home/home-live-matches";
import { HomeWorldCupNews } from "@/components/home/home-world-cup-news";

export default function HomePage() {
  return (
    <div className="relative">
      <HeroSection />

      <div className="relative mx-auto max-w-4xl pb-12">
        <div
          id="how-it-works"
          className="scroll-mt-8 border-t border-white/[0.06] pt-8 pb-12 md:scroll-mt-6 md:pt-10 md:pb-14"
        >
          <HowItWorks />
        </div>
        <div className="space-y-16">
          <HomeLiveMatches />
          <HomeWorldCupNews />
        </div>
      </div>
    </div>
  );
}