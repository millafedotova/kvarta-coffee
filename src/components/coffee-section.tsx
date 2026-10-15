import { products } from "@/content/coffee";
import { Container } from "./container";
import { CoffeeCard } from "./coffee-card";
import styles from "./coffee-section.module.css";

export function CoffeeSection() {
  return (
    <section
      id="coffee"
      className="sectionSpace"
      aria-labelledby="coffee-heading"
    >
      <Container>
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">01 / НАШ КОФЕ</span>
            <h2 id="coffee-heading">Зерно и дрипы.</h2>
          </div>
          <p>
            Цветы и бергамот, карамель или шоколад —
            <br />
            выбирайте, что вам ближе.
          </p>
        </div>
        <div className={styles.grid}>
          {products.map((product) => (
            <CoffeeCard key={product.id} product={product} />
          ))}
        </div>
        <div className={styles.note}>
          <span>Не знаете, с чего начать?</span>
          <a href="#request">
            Поможем выбрать <span aria-hidden="true">↗</span>
          </a>
        </div>
      </Container>
    </section>
  );
}
