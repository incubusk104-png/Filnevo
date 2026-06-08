import { Button } from "@/components/shared/Button";
import {
  TestimonialsRow,
  type Testimonial,
} from "@/components/ui/testimonials-columns-1";

const testimonials: Testimonial[] = [
  {
    text: "As a freelance consultant juggling multiple clients, I used to spend 8 hours every quarter on BIR forms. Now I complete everything in under 30 minutes with zero entry errors.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
    name: "Maria Santos",
    role: "Independent Business Consultant",
    accent: "insight-cyan",
    metric: "96%",
    metricLabel: "time saved",
  },
  {
    text: "Running a small boutique with daily sales, I used to dread BIR deadlines. With WhatsApp forwarding and auto-fill, my monthly filings take 15 minutes instead of 3 hours.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    name: "Juan dela Cruz",
    role: "Owner, Dagupan Boutique Store",
    accent: "velocity-blue",
    metric: "92%",
    metricLabel: "time reduction",
  },
  {
    text: "Managing tax compliance for 15+ client businesses was a nightmare. With multi-workspace routing and team approvals, we've cut processing time by 70% and eliminated filing errors.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    name: "Atty. Rafael Lim",
    role: "Managing Director, TaxPro Agency",
    accent: "efficiency-green",
    metric: "70%",
    metricLabel: "efficiency gain",
  },
  {
    text: "With 12 restaurant locations processing thousands of receipts monthly, duplicate detection saved us from costly BIR penalties and pushed our tax accuracy to 99.8%.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    name: "Gladys Reyes",
    role: "Finance Director, Manila Restaurant Group",
    accent: "warning-amber",
    metric: "99.8%",
    metricLabel: "accuracy rate",
  },
  {
    text: "The dashboard finally gives our team one source of truth for every form and deadline. Our accountants stopped chasing receipts and started actually advising clients.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    name: "Camille Tan",
    role: "Partner, Tan & Associates CPAs",
    accent: "insight-cyan",
    metric: "3x",
    metricLabel: "faster reviews",
  },
  {
    text: "Onboarding was effortless. We forwarded our invoices and the platform mapped everything to the right BIR forms automatically — no manual setup, no spreadsheets.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    name: "Marco Villanueva",
    role: "Founder, Cebu Logistics Co.",
    accent: "velocity-blue",
    metric: "0",
    metricLabel: "setup hours",
  },
  {
    text: "Audit season used to mean sleepless weeks. Now every filing is timestamped and traceable, so producing supporting documents takes minutes instead of days.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    name: "Isabel Cruz",
    role: "Comptroller, Davao Retail Group",
    accent: "efficiency-green",
    metric: "100%",
    metricLabel: "audit-ready",
  },
  {
    text: "We expanded to four branches without adding a single accounting hire. The automation simply scaled with us — same accuracy, a fraction of the effort.",
    image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&q=80",
    name: "Paolo Mercado",
    role: "COO, Northgate Pharmacies",
    accent: "warning-amber",
    metric: "4x",
    metricLabel: "branches scaled",
  },
  {
    text: "The peace of mind is the real win. I get a clear reminder before every deadline and the forms are already filled — I just review and file.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
    name: "Lianne Garcia",
    role: "Freelance Graphic Designer",
    accent: "insight-cyan",
    metric: "0",
    metricLabel: "missed deadlines",
  },
];

const firstRow = testimonials.slice(0, 5);
const secondRow = testimonials.slice(4, 9);

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative scroll-mt-20 py-20 lg:py-24 overflow-hidden">
      {/* Background - subtle metric trend pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><rect width=%2260%22 height=%2260%22 fill=%22none%22/><path d=%22M10 50 Q20 10 30 50 T50 50%22 stroke=%22%231e293b%22 stroke-width=%220.5%22 opacity=%220.06%22 fill=%22none%22/></svg>')]"/>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="eyebrow">Customer stories</span>
          <h2 className="mt-5 font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            See how we transform <span className="gradient-text">BIR compliance</span>
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Real businesses achieving measurable time savings and accuracy improvements with our BIR tax automation platform
          </p>
        </div>

        {/* Horizontally scrolling testimonial marquee */}
        <div className="flex flex-col gap-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <TestimonialsRow testimonials={firstRow} duration={50} />
          <TestimonialsRow testimonials={secondRow} duration={60} reverse />
        </div>

        {/* Call to Action */}
        <div className="mt-16 lg:mt-20 text-center">
          <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-6">
            Ready to transform your BIR tax compliance?
          </h3>
          <p className="text-text-muted max-w-2xl mx-auto mb-8">
            Join thousands of Filipino businesses already saving hours on tax preparation every month
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-4 sm:gap-6">
            <Button variant="outline" href="#features">
              Explore Features
            </Button>
            <Button variant="primary" href="/login?mode=signup">
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
