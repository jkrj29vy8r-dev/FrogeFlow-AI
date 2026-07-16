import { MarketingNav } from "@/features/marketing/components/marketing-nav";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { SocialProofSection } from "@/features/marketing/components/social-proof-section";
import { HowItWorksSection } from "@/features/marketing/components/how-it-works-section";
import { FeaturesSection } from "@/features/marketing/components/features-section";
import { ProductTypesSection } from "@/features/marketing/components/product-types-section";
import { TestimonialsSection } from "@/features/marketing/components/testimonials-section";
import { PricingSection } from "@/features/marketing/components/pricing-section";
import { CtaSection } from "@/features/marketing/components/cta-section";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <HeroSection />
        <SocialProofSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ProductTypesSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
