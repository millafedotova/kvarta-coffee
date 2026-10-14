import Image from "next/image";
import { Container } from "./container";
import actions from "./action.module.css";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <Container className={styles.grid}>
        <div className={styles.copy}>
          <span className="eyebrow">КОФЕ СВЕЖЕЙ ОБЖАРКИ · МИНСК</span>
          <h1 id="hero-heading">
            В четверг
            <br />
            обжариваем.
            <br />
            <span>
              В пятницу —<br />к вам.
            </span>
          </h1>
          <p>
            Свежий кофе для ваших обычных и особенных дней. Обжариваем по 5 кг —
            зерно приезжает к вам на 1–3 день после обжарки.
          </p>
          <div className={styles.actions}>
            <a className={actions.button} href="#coffee">
              Выбрать свой кофе{" "}
              <span className={actions.arrow} aria-hidden="true">
                ↗
              </span>
            </a>
            <a className={actions.textLink} href="#subscription">
              Или оформить подписку
            </a>
          </div>
        </div>
        <div className={styles.photo}>
          <Image
            src="/images/coffee-beans-macro.jpg"
            alt="Крупный план обжаренных кофейных зёрен"
            fill
            sizes="(max-width: 767px) 100vw, 45vw"
            preload
            className={styles.image}
          />
          <div className={styles.photoLabel}>
            <span className="eyebrow">НАШ МАСШТАБ</span>
            <strong>5 кг</strong>
            <span>
              в каждой партии.
              <br />
              Каждой — своё внимание.
            </span>
          </div>
          <span className={styles.photoSide}>
            НЕБОЛЬШАЯ МАСТЕРСКАЯ. СВЕЖИЙ КОФЕ.
          </span>
        </div>
      </Container>
    </section>
  );
}
