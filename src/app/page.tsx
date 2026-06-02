<<<<<<< HEAD
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
=======
"use client"

import { AgentChat, createAgentChat } from "@21st-sdk/nextjs"
import { useChat } from "@ai-sdk/react"

const chat = createAgentChat({
  agent: "my-agent",
  tokenUrl: "/api/an-token",
})

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, status, stop, error } =
    useChat({ chat })

  return (
    <AgentChat
      messages={messages}
      onSend={handleSubmit}
      status={status}
      onStop={stop}
      error={error ?? undefined}
      input={input}
      onInputChange={handleInputChange}
    />
  )
}
>>>>>>> auto-pr-1780213108
