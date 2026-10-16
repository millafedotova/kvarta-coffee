"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { Container } from "./container";

type Recovery = { locale: Locale; copy: Dictionary["recovery"] };
const RecoveryContext = createContext<Recovery | null>(null);

export function RecoveryProvider({
  children,
  ...value
}: Recovery & { children: ReactNode }) {
  return <RecoveryContext value={value}>{children}</RecoveryContext>;
}

export function RecoveryContent({ retry }: { retry?: () => void }) {
  const context = useContext(RecoveryContext);
  if (!context)
    throw new Error("Recovery content requires its locale provider.");
  const { locale, copy } = context;
  return (
    <main className="sectionSpace">
      <Container>
        <h1>{retry ? copy.error : copy.notFound}</h1>
        <p className="recoveryCopy">
          {retry ? copy.errorDescription : copy.notFoundDescription}
        </p>
        {retry ? (
          <button type="button" className="recoveryAction" onClick={retry}>
            {copy.retry}
          </button>
        ) : null}
        <a className="recoveryAction" href={`/${locale}`}>
          {copy.home}
        </a>
      </Container>
    </main>
  );
}
