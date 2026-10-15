"use client";

import {
  createContext,
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
import { draftSchema, getFieldErrors } from "@/lib/lead-validation";
import { submitLead } from "@/lib/submit-lead";

interface LeadContextValue {
  draft: LeadDraft;
  selection: Selection;
  state: RequestState;
  errors: FieldErrors;
  choose: (selection: Selection, navigate?: boolean) => void;
  edit: (field: keyof LeadDraft, value: string) => void;
  validateField: (field: keyof LeadDraft) => void;
  submit: () => Promise<void>;
}

const LeadContext = createContext<LeadContextValue | null>(null);

export function LeadFlow({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<LeadDraft>({
    name: "",
    phone: "",
    comment: "",
  });
  const [selection, setSelection] = useState<Selection>({
    interest: null,
    productId: null,
  });
  const [state, setState] = useState<RequestState>({ type: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const inFlight = useRef(false);
  const attribution = useRef<Attribution | null>(null);
  const rejectedField = useRef<string | null>(null);

  useEffect(() => {
    attribution.current = captureAttribution();
  }, []);

  useEffect(() => {
    // Wait until the response render re-enables the form controls.
    if (state.type !== "submitting" && rejectedField.current) {
      const field = rejectedField.current;
      rejectedField.current = null;
      document
        .getElementById(
          field === "interest" ? "interest-subscription" : `lead-${field}`,
        )
        ?.focus();
    }
  }, [state]);

  function choose(value: Selection, navigate = false) {
    if (inFlight.current) return;
    setSelection(value);
    setState({ type: "idle" });
    setErrors((current) => ({
      ...current,
      interest: undefined,
      productId: undefined,
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

  function edit(field: keyof LeadDraft, value: string) {
    if (inFlight.current) return;
    setDraft((current) => ({ ...current, [field]: value }));
    setState({ type: "idle" });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateField(field: keyof LeadDraft) {
    const result = draftSchema.safeParse({ ...draft, ...selection });
    const message = result.success
      ? undefined
      : getFieldErrors(result.error)[field];
    setErrors((current) => ({ ...current, [field]: message }));
  }

  async function submit() {
    if (inFlight.current) return;
    const parsed = draftSchema.safeParse({ ...draft, ...selection });
    if (!parsed.success) {
      const fields = getFieldErrors(parsed.error);
      setErrors(fields);
      const first = Object.keys(fields)[0];
      document
        .getElementById(
          first === "interest" ? "interest-subscription" : `lead-${first}`,
        )
        ?.focus();
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
          setErrors(result.errors);
          rejectedField.current = Object.keys(result.errors)[0] ?? null;
          setState({
            type: "error",
            message: Object.keys(result.errors).length
              ? "Проверьте отмеченные поля и попробуйте ещё раз."
              : "Не удалось отправить заявку. Обновите страницу и попробуйте ещё раз.",
          });
          break;
        }
        case "too_large":
          setState({
            type: "error",
            message: "Сократите комментарий и попробуйте ещё раз.",
          });
          break;
        case "unavailable":
          setState({
            type: "error",
            message:
              "Не получилось отправить заявку. Попробуйте позже. Введённые данные остались в форме.",
          });
          break;
        default:
          setState({
            type: "error",
            message:
              "Не удалось подтвердить отправку. Проверьте интернет и попробуйте ещё раз. Введённые данные остались в форме.",
          });
      }
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <LeadContext
      value={{
        draft,
        selection,
        state,
        errors,
        choose,
        edit,
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
