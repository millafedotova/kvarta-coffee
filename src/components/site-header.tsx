import { site } from "@/content/site";
import { Container } from "./container";
import styles from "./site-header.module.css";

export function SiteHeader() {
  return (
    <>
      <header className={styles.masthead} id="top">
        <Container>
          <div className={styles.topline}>
            <span>МАСТЕРСКАЯ ОБЖАРКИ КОФЕ</span>
            <span>МИНСК · С 2019 ГОДА</span>
          </div>
          <a
            href="#top"
            aria-label="Кварта — в начало страницы"
            className={styles.wordmark}
          >
            КВАРТА<span className={styles.wordmarkDot}>✳</span>
          </a>
          <div className={styles.baseline}>
            <span>У хорошего кофе есть свой ритм.</span>
            <span className={styles.smallNote}>
              МАЛЕНЬКИЕ ПАРТИИ. БОЛЬШИЕ УТРА.
            </span>
          </div>
        </Container>
      </header>
      <nav className={styles.nav} aria-label="Разделы сайта">
        <Container className={styles.navInner}>
          <div className={styles.links}>
            {site.navigation.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <a href="#request" className={styles.requestLink}>
            Оставить заявку <span aria-hidden="true">↗</span>
          </a>
        </Container>
      </nav>
    </>
  );
}
