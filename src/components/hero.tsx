import Image from "next/image";
import type { Dictionary } from "@/i18n/types";
import { Container } from "./container";
import actions from "./action.module.css";
import styles from "./hero.module.css";

export function Hero({ copy }: { copy: Dictionary["hero"] }) {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <Container className={styles.grid}>
        <div className={styles.copy}>
          <h1 id="hero-heading">
            {copy.roast[0]}
            <br />
            {copy.roast[1]}
            <br />
            <span>
              {copy.deliver[0]}
              <br />
              {copy.deliver[1]}
            </span>
          </h1>
          <p>{copy.description}</p>
          <div className={styles.actions}>
            <a className={actions.button} href="#coffee">
              {copy.choose}
            </a>
            <a className={actions.textLink} href="#subscription">
              {copy.subscribe}
            </a>
          </div>
        </div>
        <div className={styles.photo}>
          <Image
            src="/images/coffee-beans-macro.jpg"
            alt={copy.imageAlt}
            fill
            sizes="(max-width: 767px) 100vw, 45vw"
            preload
            className={styles.image}
          />
        </div>
      </Container>
    </section>
  );
}
