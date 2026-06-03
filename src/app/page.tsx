import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <FeaturesSection />
      <ArchitectureSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
