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
            Обжариваем кофе небольшими партиями по 5 кг. Вы получаете зерно
            через 1–3 дня после обжарки.
          </p>
          <div className={styles.actions}>
            <a className={actions.button} href="#coffee">
              Выбрать кофе{" "}
              <span className={actions.arrow} aria-hidden="true">
                ↗
              </span>
            </a>
            <a className={actions.textLink} href="#subscription">
              Оформить подписку
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
            <span className="eyebrow">ОДНА ПАРТИЯ</span>
            <strong>5 кг</strong>
            <span>
              обжариваем
              <br />
              за один раз.
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
