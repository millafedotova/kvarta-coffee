import { site } from "@/content/site";
import type { Locale } from "@/i18n/config";
import { formatMessage, formatPrice } from "@/i18n/format";
import type { Dictionary } from "@/i18n/types";
import { Container } from "./container";
import styles from "./delivery-section.module.css";

export function DeliverySection({
  copy,
  locale,
}: {
  copy: Dictionary["delivery"];
  locale: Locale;
}) {
  return (
    <section
      id="delivery"
      className={styles.section}
      aria-labelledby="delivery-heading"
    >
      <Container>
        <div className="sectionHeading">
          <div>
            <h2 id="delivery-heading">{copy.title.join(" ")}</h2>
          </div>
        </div>
        <div className={styles.grid}>
          <article className={styles.card}>
            <div className={styles.cardTop}>
              <span className="eyebrow">{copy.delivery}</span>
            </div>
            <h3>
              {copy.schedule[0]}
              <br />
              {copy.schedule[1]}
            </h3>
            <div className={styles.bottom}>
              <strong>
                {formatMessage(copy.free, {
                  price: formatPrice(site.freeDeliveryFrom, locale),
                })}
              </strong>
              <p>
                {formatMessage(copy.details, {
                  price: formatPrice(site.freeDeliveryFrom, locale),
                })}
              </p>
            </div>
          </article>
          <article className={`${styles.card} ${styles.pickup}`}>
            <div className={styles.cardTop}>
              <span className="eyebrow">{copy.pickup}</span>
            </div>
            <h3>
              {copy.street}
              <br />
              {copy.city}
            </h3>
            <div className={styles.bottom}>
              <strong>{copy.hours}</strong>
              <p>
                {copy.weekdays} {site.weekdayHours}
                <br />
                {copy.weekends} {site.weekendHours}
              </p>
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}
