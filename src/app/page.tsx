export const runtime = "edge";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import { createClient } from "@/lib/supabase/server";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Reveal from "@/components/landing/Reveal";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection user={user} />
      <Reveal>
        <FeaturesSection />
      </Reveal>
      <Reveal>
        <ArchitectureSection />
      </Reveal>
      <Reveal>
        <PricingSection />
      </Reveal>
      <Reveal>
        <TestimonialsSection />
      </Reveal>
      <Reveal>
        <CTASection user={user} />
      </Reveal>
    </div>
  );
}
