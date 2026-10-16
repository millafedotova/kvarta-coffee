"use client";

import { RecoveryContent } from "@/components/recovery";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <RecoveryContent retry={reset} />;
}
