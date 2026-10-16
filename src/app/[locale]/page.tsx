import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizeProducts } from "@/i18n/products";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { CoffeeSection } from "@/components/coffee-section";
import { SubscriptionSection } from "@/components/subscription-section";
import { RoasterySection } from "@/components/roastery-section";
import { DeliverySection } from "@/components/delivery-section";
import { LeadFlow } from "@/components/lead-flow";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter } from "@/components/site-footer";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = await getDictionary(locale);
  const products = localizeProducts(dictionary, locale);
  return (
    <LeadFlow
      locale={locale}
      errorsCopy={dictionary.errors}
      feedbackCopy={dictionary.feedback}
    >
      <a className="skipLink" href="#main">
        {dictionary.skipLink}
      </a>
      <SiteHeader
        brand={dictionary.brand}
        locale={locale}
        copy={dictionary.header}
        languageCopy={dictionary.language}
      />
      <main id="main">
        <Hero copy={dictionary.hero} />
        <RoasterySection
          copy={dictionary.roastery}
          galleryCopy={dictionary.gallery}
        />
        <CoffeeSection
          locale={locale}
          products={products}
          copy={dictionary.catalog}
          coffeeCopy={dictionary.coffee}
        />
        <SubscriptionSection locale={locale} copy={dictionary.subscription} />
        <DeliverySection locale={locale} copy={dictionary.delivery} />
        <LeadForm
          copy={dictionary.form}
          products={products.map(({ id, name, size, price, accent }) => ({
            id,
            name,
            size,
            price,
            accent,
          }))}
        />
      </main>
      <SiteFooter
        brand={dictionary.brand}
        locale={locale}
        copy={dictionary.footer}
        address={dictionary.delivery.address}
        languageCopy={dictionary.language}
      />
    </LeadFlow>
  );
}
