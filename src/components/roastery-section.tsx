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
              Маленькая обжарка.
              <br />
              Личное отношение.
            </h2>
          </div>
          <p>
            За каждой пачкой — люди,
            <br />
            которым не всё равно.
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
              Внимание к каждой партии — от обжарки до вашей чашки.
            </figcaption>
          </figure>
          <div className={styles.story}>
            <span className={styles.year}>С 2019</span>
            <h3>
              Привет.
              <br />
              Мы — Аня и Дмитрий.
            </h3>
            <p>
              Раньше мы работали бариста. Теперь обжариваем кофе сами — в
              небольшой мастерской в Минске.
            </p>
            <p>
              Наш масштаб — партии по 5 кг. Так мы можем уделить внимание каждой
              обжарке и отправить вам свежее зерно, а не держать его на полке.
            </p>
            <div className={styles.fact}>
              <strong>1–3 дня</strong>
              <span>
                от обжарки до вас.
                <br />
                Свежесть — наш главный ингредиент.
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
