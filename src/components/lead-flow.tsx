"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Attribution,
  FieldErrors,
  LeadDraft,
  RequestState,
  Selection,
} from "@/lib/lead-contract";
import { captureAttribution, sanitizePageUrl } from "@/lib/attribution";
import {
  draftSchema,
  getFieldErrorCodes,
  resolveServerErrors,
} from "@/lib/lead-validation";
import { isLeadErrorCode, type FieldErrorCodes } from "@/lib/lead-errors";
import {
  consumeDraftHandoff,
  readHistoryDraft,
  readVisibleDraft,
  saveDraftHandoff,
  updateHistoryDraft,
} from "@/lib/lead-draft-handoff";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { submitLead } from "@/lib/submit-lead";

interface LeadContextValue {
  locale: Locale;
  draftVersion: number;
  message: string;
  prepareLanguageSwitch: (
    target: Locale,
  ) => "ready" | "pending" | "storageError";
  draft: LeadDraft;
  selection: Selection;
  state: RequestState;
  errors: FieldErrors;
  choose: (selection: Selection, navigate?: boolean) => void;
  edit: (field: keyof LeadDraft, value: string) => void;
  syncDraft: (draft: LeadDraft) => void;
  validateField: (field: keyof LeadDraft, value?: string) => void;
  submit: (draft?: LeadDraft) => Promise<void>;
}

const LeadContext = createContext<LeadContextValue | null>(null);

function focusLeadField(field: string) {
  const id =
    field === "interest"
      ? "interest-subscription"
      : field.startsWith("product")
        ? "lead-products"
        : `lead-${field}`;
  document.getElementById(id)?.focus();
}

export function LeadFlow({
  children,
  locale,
  errorsCopy,
  feedbackCopy,
}: {
  children: ReactNode;
  locale: Locale;
  errorsCopy: Dictionary["errors"];
  feedbackCopy: Dictionary["feedback"];
}) {
  const [draft, setDraft] = useState<LeadDraft>({
    name: "",
    phone: "",
    comment: "",
  });
  const latestDraft = useRef(draft);
  const [selection, setSelection] = useState<Selection>({
    interest: null,
    productId: null,
  });
  const [state, setState] = useState<RequestState>({ type: "idle" });
  const [errors, setErrors] = useState<FieldErrorCodes>({});
  const [draftVersion, setDraftVersion] = useState(0);
  const inFlight = useRef(false);
  const attribution = useRef<Attribution | null>(null);
  const rejectedField = useRef<string | null>(null);

  useEffect(() => {
    attribution.current = captureAttribution();
    function restore(fromCache = false) {
      const navigation = performance.getEntriesByType?.("navigation")?.[0];
      const fromHistory =
        fromCache ||
        (navigation &&
          "type" in navigation &&
          navigation.type === "back_forward");
      const handoff =
        consumeDraftHandoff(locale) ??
        (fromHistory ? readHistoryDraft() : null);
      if (!handoff) return;
      latestDraft.current = handoff.draft;
      setDraft(handoff.draft);
      setSelection(handoff.selection);
      setState(handoff.state);
      setErrors(handoff.errors);
      // Remount uncontrolled fields once, using the restored visible values.
      setDraftVersion((version) => version + 1);
    }
    let frame = requestAnimationFrame(() => restore());
    function restoredPage(event: PageTransitionEvent) {
      if (event.persisted) frame = requestAnimationFrame(() => restore(true));
    }
    window.addEventListener("pageshow", restoredPage);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pageshow", restoredPage);
    };
  }, [locale]);

  useEffect(() => {
    function leavingPage() {
      const form = document.getElementById("lead-form");
      const visible =
        form instanceof HTMLFormElement
          ? readVisibleDraft(form)
          : latestDraft.current;
      updateHistoryDraft(locale, visible, selection, errors, state);
    }
    window.addEventListener("pagehide", leavingPage);
    return () => window.removeEventListener("pagehide", leavingPage);
  }, [locale, selection, errors, state]);

  useEffect(() => {
    // Wait until the response render re-enables the form controls.
    if (state.type !== "submitting" && rejectedField.current) {
      const field = rejectedField.current;
      rejectedField.current = null;
      focusLeadField(field);
    }
  }, [state]);

  function choose(value: Selection, navigate = false) {
    if (inFlight.current) return;
    if (value.interest === "one_time") {
      const currentProducts =
        selection.interest === "one_time"
          ? (selection.productIds ??
            (selection.productId ? [selection.productId] : []))
          : [];
      const chosenProducts =
        value.productIds ??
        (value.productId
          ? navigate
            ? [...new Set([...currentProducts, value.productId])]
            : [value.productId]
          : []);
      setSelection({
        interest: "one_time",
        productId: chosenProducts[0] ?? null,
        productIds: chosenProducts,
        productQuantities: Object.fromEntries(
          chosenProducts.map((id) => [
            id,
            value.productQuantities?.[id] ??
              selection.productQuantities?.[id] ??
              1,
          ]),
        ),
      });
    } else {
      setSelection({ ...value, productIds: [], productQuantities: {} });
    }
    setState({ type: "idle" });
    setErrors((current) => ({
      ...current,
      interest: undefined,
      productId: undefined,
      productIds: undefined,
      productQuantities: undefined,
    }));
    if (navigate) {
      const heading = document.getElementById("request-heading");
      heading?.focus({ preventScroll: true });
      document.getElementById("request")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    }
  }

  const edit = useCallback((field: keyof LeadDraft, value: string) => {
    if (inFlight.current || latestDraft.current[field] === value) return;
    const next = { ...latestDraft.current, [field]: value };
    latestDraft.current = next;
    setDraft(next);
    setState({ type: "idle" });
    let message: FieldErrorCodes["phone"];
    if (field === "phone" && value.trim()) {
      const result = draftSchema.shape.phone.safeParse(value);
      if (!result.success) {
        const code = result.error.issues[0]?.message;
        message = isLeadErrorCode(code) ? code : "phoneInvalid";
      }
    }
    setErrors((current) => ({ ...current, [field]: message }));
  }, []);

  const syncDraft = useCallback(
    (values: LeadDraft) => {
      for (const field of ["name", "phone", "comment"] as const) {
        edit(field, values[field]);
      }
    },
    [edit],
  );

  function validateField(field: keyof LeadDraft, value?: string) {
    if (value !== undefined) edit(field, value);
    const result = draftSchema.safeParse({
      ...latestDraft.current,
      ...selection,
    });
    const message = result.success
      ? undefined
      : getFieldErrorCodes(result.error)[field];
    // Keep a server rejection until the value changes; an unchanged blur is not a correction.
    if (message) setErrors((current) => ({ ...current, [field]: message }));
  }

  async function submit(visibleDraft?: LeadDraft) {
    if (inFlight.current) return;
    if (visibleDraft) syncDraft(visibleDraft);
    const parsed = draftSchema.safeParse({
      ...latestDraft.current,
      ...selection,
    });
    if (!parsed.success) {
      const fields = getFieldErrorCodes(parsed.error);
      setErrors(fields);
      const first = Object.keys(fields)[0];
      if (first) focusLeadField(first);
      return;
    }
    inFlight.current = true;
    setErrors({});
    setState({ type: "submitting" });
    try {
      attribution.current ??= captureAttribution();
      const result = await submitLead({
        ...parsed.data,
        attribution: attribution.current,
        submissionUrl: sanitizePageUrl(window.location.href),
      });
      switch (result.status) {
        case "created":
          setState({ type: "success" });
          break;
        case "duplicate":
          setState({ type: "duplicate" });
          break;
        case "invalid": {
          const fieldErrors = resolveServerErrors(
            result.errors,
            result.errorCodes,
          );
          setErrors(fieldErrors);
          rejectedField.current = Object.keys(fieldErrors)[0] ?? null;
          setState({
            type: "error",
            code: Object.keys(fieldErrors).length
              ? "invalidFields"
              : "invalidRequest",
          });
          break;
        }
        case "too_large":
          setState({
            type: "error",
            code: "tooLarge",
          });
          break;
        case "unavailable":
          setState({
            type: "error",
            code: "unavailable",
          });
          break;
        default:
          setState({
            type: "error",
            code: "networkError",
          });
      }
    } finally {
      inFlight.current = false;
    }
  }

  function prepareLanguageSwitch(
    target: Locale,
  ): "ready" | "pending" | "storageError" {
    if (inFlight.current) return "pending";
    const form = document.getElementById("lead-form");
    const visible =
      form instanceof HTMLFormElement
        ? readVisibleDraft(form)
        : latestDraft.current;
    const changedFields = (["name", "phone", "comment"] as const).filter(
      (key) => visible[key] !== latestDraft.current[key],
    );
    const changed = changedFields.length > 0;
    const nextErrors = { ...errors };
    for (const field of changedFields) delete nextErrors[field];
    if (changedFields.includes("phone") && visible.phone.trim()) {
      const phone = draftSchema.shape.phone.safeParse(visible.phone);
      if (!phone.success) nextErrors.phone = "phoneInvalid";
    }
    const hasContext =
      Object.values(visible).some(Boolean) ||
      selection.interest !== null ||
      state.type !== "idle";
    if (!hasContext) return "ready";
    syncDraft(visible);
    const saved = saveDraftHandoff(
      locale,
      target,
      visible,
      selection,
      nextErrors,
      changed ? { type: "idle" } : state,
    );
    return saved ? "ready" : "storageError";
  }

  const renderedErrors: FieldErrors = {};
  for (const [field, code] of Object.entries(errors)) {
    if (code) Object.assign(renderedErrors, { [field]: errorsCopy[code] });
  }

  return (
    <LeadContext
      value={{
        locale,
        draftVersion,
        message: state.type === "error" ? feedbackCopy[state.code] : "",
        prepareLanguageSwitch,
        draft,
        selection,
        state,
        errors: renderedErrors,
        choose,
        edit,
        syncDraft,
        validateField,
        submit,
      }}
    >
      {children}
    </LeadContext>
  );
}

export function useLeadFlow() {
  const context = useContext(LeadContext);
  if (!context) throw new Error("Lead components require a LeadFlow provider.");
  return context;
}
