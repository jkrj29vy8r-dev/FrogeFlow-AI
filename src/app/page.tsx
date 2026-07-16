import { MarketingNav } from "@/features/marketing/components/marketing-nav";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { FeaturesSection } from "@/features/marketing/components/features-section";
import { ProductTypesSection } from "@/features/marketing/components/product-types-section";
import { CtaSection } from "@/features/marketing/components/cta-section";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ProductTypesSection />
        <CtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
