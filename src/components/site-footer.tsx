import { site } from "@/content/site";
import { Container } from "./container";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <a className={styles.logo} href="#top">
            КВАРТА<span aria-hidden="true">✳</span>
          </a>
          <p>
            Кофе в зерне и дрипах.
            <br />
            Обжарка в Минске с 2019 года.
          </p>
          <a className={styles.back} href="#top">
            В начало <span aria-hidden="true">↑</span>
          </a>
        </div>
        <div className={styles.bottom}>
          <span>{site.address}</span>
          <span>ЧТ — ОБЖАРКА / ПТ — ДОСТАВКА</span>
          <span>© Кварта, 2026</span>
        </div>
      </Container>
    </footer>
  );
}
