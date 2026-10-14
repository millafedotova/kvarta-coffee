import { site } from "@/content/site";
import { Container } from "./container";
import styles from "./delivery-section.module.css";

export function DeliverySection() {
  return (
    <section
      id="delivery"
      className={styles.section}
      aria-labelledby="delivery-heading"
    >
      <Container>
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">04 / ДОСТАВКА И САМОВЫВОЗ</span>
            <h2 id="delivery-heading">
              Увидимся в пятницу.
              <br />
              Или у нас.
            </h2>
          </div>
        </div>
        <div className={styles.grid}>
          <article className={styles.card}>
            <div className={styles.cardTop}>
              <span className="eyebrow">КОФЕ ПРИЕДЕТ К ВАМ</span>
              <span aria-hidden="true" className={styles.symbol}>
                ↗
              </span>
            </div>
            <h3>
              По Минску
              <br />
              каждую пятницу.
            </h3>
            <div className={styles.bottom}>
              <strong>От 50 BYN — бесплатно</strong>
              <p>
                Время и детали доставки согласуем по телефону.
                <br />
                Доставка подписки уже включена.
              </p>
            </div>
          </article>
          <article className={`${styles.card} ${styles.pickup}`}>
            <div className={styles.cardTop}>
              <span className="eyebrow">ЗАГЛЯДЫВАЙТЕ В МАСТЕРСКУЮ</span>
              <span aria-hidden="true" className={styles.symbol}>
                ＋
              </span>
            </div>
            <h3>
              Короля, 9.
              <br />
              Минск.
            </h3>
            <div className={styles.bottom}>
              <strong>Самовывоз из мастерской</strong>
              <p>
                {site.weekdayHours}
                <br />
                {site.weekendHours}
              </p>
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}
