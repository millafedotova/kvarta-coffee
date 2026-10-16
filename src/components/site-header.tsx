import { site } from "@/content/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { LanguageSwitcher } from "./language-switcher";
import { Container } from "./container";
import styles from "./site-header.module.css";

export function SiteHeader({
  copy,
  languageCopy,
  locale,
  brand,
}: {
  copy: Dictionary["header"];
  languageCopy: Dictionary["language"];
  locale: Locale;
  brand: string;
}) {
  return (
    <>
      <header className={styles.masthead} id="top">
        <Container>
          <div className={styles.topline}>
            <span className={styles.workshop}>{copy.workshop}</span>
            <div className={styles.languageRow}>
              <LanguageSwitcher locale={locale} copy={languageCopy} />
            </div>
          </div>
          <div className={styles.location}>{copy.location}</div>
          <a href="#top" aria-label={copy.home} className={styles.wordmark}>
            {brand.toUpperCase()}
            <span className={styles.wordmarkDot}>✳</span>
          </a>
        </Container>
      </header>
      <nav className={styles.nav} aria-label={copy.navigationLabel}>
        <Container className={styles.navInner}>
          <div className={styles.links}>
            {site.navigation.map((link) => (
              <a key={link.href} href={link.href}>
                {copy[link.key]}
              </a>
            ))}
          </div>
          <a href="#request" className={styles.requestLink}>
            {copy.request}
          </a>
        </Container>
      </nav>
    </>
  );
}
