import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { RoastSchedule } from "@/components/roast-schedule";
import { CoffeeSection } from "@/components/coffee-section";
import { SubscriptionSection } from "@/components/subscription-section";
import { RoasterySection } from "@/components/roastery-section";
import { DeliverySection } from "@/components/delivery-section";
import { LeadFlow } from "@/components/lead-flow";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <LeadFlow>
      <a className="skipLink" href="#main">
        Перейти к содержимому
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <RoastSchedule />
        <CoffeeSection />
        <SubscriptionSection />
        <RoasterySection />
        <DeliverySection />
        <LeadForm />
      </main>
      <SiteFooter />
    </LeadFlow>
  );
}
