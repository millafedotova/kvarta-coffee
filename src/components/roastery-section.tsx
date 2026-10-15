import Image from "next/image";
import { Container } from "./container";
import styles from "./roastery-section.module.css";

export function RoasterySection() {
  return (
    <section
      id="roastery"
      className="sectionSpace"
      aria-labelledby="roastery-heading"
    >
      <Container>
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">03 / МАСТЕРСКАЯ</span>
            <h2 id="roastery-heading">
              Обжариваем кофе
              <br />с 2019 года.
            </h2>
          </div>
          <p>
            Небольшая мастерская
            <br />
            на улице Короля, 9.
          </p>
        </div>
        <div className={styles.grid}>
          <figure className={styles.figure}>
            <div className={styles.photo}>
              <Image
                src="/images/roastery.png"
                alt="Руки обжарщика с пробником кофе у небольшого ростера"
                fill
                sizes="(max-width: 767px) 100vw, 55vw"
                className={styles.image}
              />
            </div>
            <figcaption>
              Обжариваем на небольшом ростере, по 5 кг за раз.
            </figcaption>
          </figure>
          <div className={styles.story}>
            <span className={styles.year}>С 2019</span>
            <h3>
              Мы — Аня
              <br />и Дима.
            </h3>
            <p>
              Раньше мы работали бариста, теперь обжариваем кофе сами в
              небольшой мастерской в Минске.
            </p>
            <p>
              Обжариваем партиями по 5 кг каждый четверг, в пятницу развозим
              заказы по Минску.
            </p>
            <div className={styles.fact}>
              <strong>1–3 дня</strong>
              <span>
                от обжарки
                <br />
                до получения кофе.
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
