import { site } from "@/content/site";
import type { Locale } from "@/i18n/config";
import { formatMessage } from "@/i18n/format";
import type { Dictionary } from "@/i18n/types";
import { LanguageSwitcher } from "./language-switcher";
import { Container } from "./container";
import styles from "./site-footer.module.css";

export function SiteFooter({
  copy,
  address,
  languageCopy,
  locale,
  brand,
}: {
  copy: Dictionary["footer"];
  address: string;
  languageCopy: Dictionary["language"];
  locale: Locale;
  brand: string;
}) {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <a className={styles.logo} href="#top">
            {brand.toUpperCase()}
            <span aria-hidden="true">✳</span>
          </a>
          <p>{copy.description}</p>
          <a className={styles.back} href="#top">
            {copy.back} <span aria-hidden="true">↑</span>
          </a>
        </div>
        <div className={styles.languageRow}>
          <LanguageSwitcher locale={locale} copy={languageCopy} />
        </div>
        <div className={styles.bottom}>
          <span>{address}</span>
          <span>
            {formatMessage(copy.copyright, { year: site.copyrightYear })}
          </span>
        </div>
      </Container>
    </footer>
  );
}
