import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { LeadFlow, useLeadFlow } from "../src/components/lead-flow";
import { LeadForm } from "../src/components/lead-form";
import { LanguageSwitcher } from "../src/components/language-switcher";
import { localizeProducts } from "../src/i18n/products";
import type { Locale } from "../src/i18n/config";
import { ru } from "../src/i18n/dictionaries/ru";
import { en } from "../src/i18n/dictionaries/en";
import { be } from "../src/i18n/dictionaries/be";

const dictionaries = { ru, en, be };

function SwitchProbe() {
  const flow = useLeadFlow();
  return (
    <button type="button" onClick={() => flow.prepareLanguageSwitch("en")}>
      Prepare English navigation
    </button>
  );
}

function FormPage({ locale }: { locale: Locale }) {
  const copy = dictionaries[locale];
  return (
    <LeadFlow
      locale={locale}
      errorsCopy={copy.errors}
      feedbackCopy={copy.feedback}
    >
      <LanguageSwitcher locale={locale} copy={copy.language} />
      <LeadForm copy={copy.form} products={localizeProducts(copy, locale)} />
      <SwitchProbe />
    </LeadFlow>
  );
}

it("does not carry a request anchor into language links", async () => {
  const original = window.location.href;
  try {
    window.history.replaceState(
      null,
      "",
      "/en?utm_source=language-check#request",
    );
    render(<FormPage locale="en" />);
    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "Беларуская" }).getAttribute("href"),
      ).toBe("/be?utm_source=language-check"),
    );
  } finally {
    window.history.replaceState(null, "", original);
  }
});

it("restores silent autofill, several products and quantities after a locale root remount", async () => {
  const user = userEvent.setup();
  const fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", fetchMock);
  const russian = render(<FormPage locale="ru" />);
  await user.type(
    screen.getByLabelText(/Как вас зовут/),
    "Synthetic locale check",
  );
  await user.type(screen.getByLabelText(/Комментарий/), "Без помола");
  await user.click(screen.getByLabelText("Разовый заказ"));
  await user.click(screen.getByRole("checkbox", { name: /Бразилия Серрадо/ }));
  await user.click(screen.getByRole("checkbox", { name: /Колумбия Уила/ }));
  await user.click(
    screen.getByRole("button", {
      name: "Увеличить количество: Бразилия Серрадо",
    }),
  );
  screen.getByLabelText<HTMLInputElement>(/Телефон/).value = "+12025550123";
  await user.click(
    screen.getByRole("button", { name: "Prepare English navigation" }),
  );
  russian.unmount();
  render(<FormPage locale="en" />);
  await waitFor(() =>
    expect(screen.getByLabelText<HTMLInputElement>(/Your name/).value).toBe(
      "Synthetic locale check",
    ),
  );
  expect(screen.getByLabelText<HTMLInputElement>(/Phone/).value).toBe(
    "+12025550123",
  );
  expect(screen.getByLabelText<HTMLTextAreaElement>(/Comment/).value).toBe(
    "Без помола",
  );
  expect(
    screen.getByRole<HTMLInputElement>("checkbox", { name: /Brazil Cerrado/ })
      .checked,
  ).toBe(true);
  expect(
    screen.getByRole<HTMLInputElement>("checkbox", { name: /Colombia Huila/ })
      .checked,
  ).toBe(true);
  expect(
    screen.getByRole("group", { name: "Quantity: Brazil Cerrado" }).textContent,
  ).toContain("× 2");
  expect(fetchMock).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: /Send an inquiry/ }));
  expect(screen.getByRole("alert").textContent).toBe(en.errors.phoneInvalid);
  expect(fetchMock).not.toHaveBeenCalled();
});

it("localizes server field codes and retains the same error after a remount", async () => {
  const user = userEvent.setup();
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>().mockResolvedValue(
      Response.json(
        {
          status: "invalid",
          errors: { phone: ru.errors.phoneTooLong },
          errorCodes: { phone: "phoneTooLong" },
        },
        { status: 400 },
      ),
    ),
  );
  const russian = render(<FormPage locale="ru" />);
  await user.type(
    screen.getByLabelText(/Как вас зовут/),
    "Synthetic server error",
  );
  await user.type(screen.getByLabelText(/Телефон/), "+375291234567");
  await user.click(screen.getByLabelText("Есть вопрос"));
  await user.click(screen.getByRole("button", { name: /Оставить заявку/ }));
  await screen.findByText(ru.errors.phoneTooLong);
  await user.click(
    screen.getByRole("button", { name: "Prepare English navigation" }),
  );
  russian.unmount();
  render(<FormPage locale="en" />);
  await screen.findByText(en.errors.phoneTooLong);
  expect(screen.getByRole("status").textContent).toContain(
    en.feedback.invalidFields,
  );
  expect(screen.queryByText(ru.errors.phoneTooLong)).toBeNull();
});

it.each(["en", "be"] as const)(
  "renders complete form feedback in %s",
  async (locale) => {
    const user = userEvent.setup();
    const copy = dictionaries[locale];
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json({ status: "unavailable" }, { status: 503 }),
        ),
    );
    render(<FormPage locale={locale} />);
    await user.type(
      screen.getByLabelText(new RegExp(copy.form.name)),
      "Synthetic request",
    );
    await user.type(
      screen.getByLabelText(new RegExp(copy.form.phone)),
      "+375291234567",
    );
    await user.click(screen.getByLabelText(copy.form.interests.question));
    await user.click(screen.getByRole("button", { name: copy.form.submit }));
    await screen.findByText(copy.feedback.unavailable);
    expect(screen.getByRole("button", { name: copy.form.retry })).toBeTruthy();
  },
);

it("defers switching while a request is pending without losing visible form data", async () => {
  const user = userEvent.setup();
  let complete: (response: Response) => void = () => {};
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(
    () =>
      new Promise<Response>((resolve) => {
        complete = resolve;
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  render(<FormPage locale="en" />);
  await user.type(
    screen.getByLabelText(/Your name/),
    "Synthetic pending check",
  );
  await user.type(screen.getByLabelText(/Phone/), "+375291234567");
  await user.click(screen.getByLabelText(en.form.interests.question));
  await user.click(screen.getByRole("button", { name: en.form.submit }));
  const link = screen.getByRole("link", { name: "Беларуская" });
  fireEvent.click(link);
  expect(screen.getByText(en.language.pending)).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(sessionStorage.getItem("kvarta.locale-handoff.v1")).toBeNull();
  complete(Response.json({ status: "created" }, { status: 201 }));
  await screen.findByText(en.form.success);
});

it("keeps the current draft when storage is blocked and explains recovery", async () => {
  const user = userEvent.setup();
  render(<FormPage locale="en" />);
  await user.type(
    screen.getByLabelText(/Your name/),
    "Synthetic blocked storage",
  );
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Synthetic blocked storage");
  });
  fireEvent.click(screen.getByRole("link", { name: "Беларуская" }));
  expect(screen.getByText(en.language.storageError)).toBeTruthy();
  expect(screen.getByLabelText<HTMLInputElement>(/Your name/).value).toBe(
    "Synthetic blocked storage",
  );
  expect(screen.getByRole("button", { name: en.language.stay })).toBeTruthy();
});

it.each(["created", "duplicate"] as const)(
  "keeps a %s acknowledgement after changing language without resubmitting",
  async (status) => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ status }, { status: status === "created" ? 201 : 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const russian = render(<FormPage locale="ru" />);
    await user.type(
      screen.getByLabelText(/Как вас зовут/),
      "Synthetic acknowledgement check",
    );
    await user.type(screen.getByLabelText(/Телефон/), "+375291234567");
    await user.click(screen.getByLabelText("Есть вопрос"));
    await user.click(screen.getByRole("button", { name: ru.form.submit }));
    await screen.findByText(
      status === "created" ? ru.form.success : ru.form.duplicate,
    );
    await user.click(
      screen.getByRole("button", { name: "Prepare English navigation" }),
    );
    russian.unmount();
    render(<FormPage locale="en" />);
    await screen.findByText(
      status === "created" ? en.form.success : en.form.duplicate,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  },
);
