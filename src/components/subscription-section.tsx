import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { formatMessage, formatNumber } from "@/i18n/format";
import type { Dictionary } from "@/i18n/types";
import { site } from "@/content/site";
import { Container } from "./container";
import { SelectionButton } from "./selection-button";
import styles from "./subscription-section.module.css";

export function SubscriptionSection({
  copy,
  locale,
}: {
  copy: Dictionary["subscription"];
  locale: Locale;
}) {
  return (
    <section id="subscription" aria-labelledby="subscription-heading">
      <Container>
        <div className={styles.panel}>
          <div className={styles.copy}>
            <span className="eyebrow">{copy.eyebrow}</span>
            <h2 id="subscription-heading">{copy.title.join(" ")}</h2>
            <div className={styles.offer}>
              <strong>
                {formatNumber(site.subscription.price, locale)}
                <span>{copy.monthly}</span>
              </strong>
              <p>
                {formatMessage(copy.quantity, {
                  count: site.subscription.count,
                  weight: site.subscription.weight,
                })}
                <br />
                {copy.included}
              </p>
            </div>
            <SelectionButton
              selection={{ interest: "subscription", productId: null }}
              light
            >
              {copy.action}
            </SelectionButton>
            <ul className={styles.steps}>
              {copy.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
          <div className={styles.photo}>
            <Image
              src="/images/coffee-foam.jpg"
              alt={copy.imageAlt}
              fill
              sizes="(max-width: 767px) 100vw, 45vw"
              className={styles.image}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
