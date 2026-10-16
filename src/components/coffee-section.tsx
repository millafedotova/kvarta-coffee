import type { Locale } from "@/i18n/config";
import type { LocalizedCoffee } from "@/i18n/products";
import type { Dictionary } from "@/i18n/types";
import { Container } from "./container";
import { CoffeeCard } from "./coffee-card";
import styles from "./coffee-section.module.css";

export function CoffeeSection({
  copy,
  coffeeCopy,
  products,
  locale,
}: {
  copy: Dictionary["catalog"];
  coffeeCopy: Dictionary["coffee"];
  products: LocalizedCoffee[];
  locale: Locale;
}) {
  return (
    <section
      id="coffee"
      className="sectionSpace"
      aria-labelledby="coffee-heading"
    >
      <Container>
        <div className="sectionHeading">
          <div>
            <h2 id="coffee-heading">{copy.title}</h2>
          </div>
          <p>{copy.description}</p>
        </div>
        <div className={styles.grid}>
          {products.map((product) => (
            <CoffeeCard
              key={product.id}
              product={product}
              copy={coffeeCopy}
              locale={locale}
            />
          ))}
        </div>
        <div className={styles.note}>
          <span>{copy.help}</span>
          <a href="#request">{copy.helpAction}</a>
        </div>
      </Container>
    </section>
  );
}
