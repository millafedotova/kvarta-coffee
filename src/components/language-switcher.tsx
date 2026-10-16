"use client";

import { useEffect, useId, useState, type MouseEvent } from "react";
import {
  localeCookie,
  localeNames,
  locales,
  localizedUrl,
  type Locale,
} from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useLeadFlow } from "./lead-flow";
import styles from "./language-switcher.module.css";

function rememberLocale(locale: Locale) {
  try {
    document.cookie = `${localeCookie}=${locale}; Path=/; Max-Age=15552000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  } catch {
    // The explicit URL remains usable if preference cookies are blocked.
  }
}

export function LanguageSwitcher({
  locale,
  copy,
}: {
  locale: Locale;
  copy: Dictionary["language"];
}) {
  const flow = useLeadFlow();
  const warningId = useId();
  const [suffix, setSuffix] = useState("");
  const [warning, setWarning] = useState<"pending" | "storageError" | null>(
    null,
  );
  const [destination, setDestination] = useState<{
    href: string;
    locale: Locale;
  } | null>(null);

  useEffect(() => {
    const update = () => setSuffix(window.location.search);
    const frame = requestAnimationFrame(update);
    window.addEventListener("popstate", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("popstate", update);
    };
  }, []);

  function switchLanguage(
    event: MouseEvent<HTMLAnchorElement>,
    target: Locale,
  ) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;
    if (target === locale) {
      event.preventDefault();
      return;
    }
    const url = localizedUrl(window.location.href, target);
    event.currentTarget.href = url.toString();
    const result = flow.prepareLanguageSwitch(target);
    if (result !== "ready") {
      event.preventDefault();
      setWarning(result);
      setDestination({
        href: url.pathname + url.search + url.hash,
        locale: target,
      });
      return;
    }
    rememberLocale(target);
  }

  const visibleWarning =
    warning === "pending" && flow.state.type !== "submitting" ? null : warning;

  return (
    <div className={styles.wrapper}>
      <div role="group" aria-label={copy.label} className={styles.links}>
        {locales.map((target) => (
          <a
            key={target}
            href={`/${target}${suffix}`}
            lang={target}
            hrefLang={target}
            aria-current={target === locale ? "true" : undefined}
            aria-disabled={
              target !== locale && flow.state.type === "submitting"
                ? true
                : undefined
            }
            aria-describedby={visibleWarning ? warningId : undefined}
            onClick={(event) => switchLanguage(event, target)}
          >
            {localeNames[target]}
          </a>
        ))}
      </div>
      {visibleWarning ? (
        <div className={styles.warning} id={warningId} role="status">
          <p>{copy[visibleWarning]}</p>
          <div className={styles.actions}>
            <button type="button" onClick={() => setWarning(null)}>
              {copy.stay}
            </button>
            {visibleWarning === "storageError" && destination ? (
              <a
                href={destination.href}
                onClick={() => rememberLocale(destination.locale)}
              >
                {copy.continue}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
