"use client";

import type { ReactNode } from "react";
import type { Selection } from "@/lib/lead-contract";
import { useLeadFlow } from "./lead-flow";
import styles from "./action.module.css";

export function SelectionButton({
  selection,
  children,
  light = false,
  className = "",
}: {
  selection: Selection;
  children: ReactNode;
  light?: boolean;
  className?: string;
}) {
  const flow = useLeadFlow();
  return (
    <button
      type="button"
      className={`${styles.button} ${light ? styles.light : ""} ${className}`}
      disabled={flow.state.type === "submitting"}
      onClick={() => flow.choose(selection, true)}
    >
      {children}
    </button>
  );
}
