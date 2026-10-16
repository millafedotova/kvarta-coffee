import { expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeadFlow } from "../src/components/lead-flow";
import { LeadForm } from "../src/components/lead-form";
import { SelectionButton } from "../src/components/selection-button";
import { ru } from "../src/i18n/dictionaries/ru";
import { localizeProducts } from "../src/i18n/products";

function renderFlow() {
  return render(
    <LeadFlow locale="ru" errorsCopy={ru.errors} feedbackCopy={ru.feedback}>
      <SelectionButton
        selection={{ interest: "one_time", productId: "ethiopia-yirgacheffe" }}
      >
        Select Ethiopia
      </SelectionButton>
      <SelectionButton
        selection={{ interest: "subscription", productId: null }}
      >
        Select subscription
      </SelectionButton>
      <LeadForm copy={ru.form} products={localizeProducts(ru, "ru")} />
    </LeadFlow>,
  );
}

it.each(["+12025550123", "+375 29 12"])(
  "explains an invalid phone %s without waiting for blur and clears feedback after correction",
  (number) => {
    renderFlow();
    const phone = screen.getByLabelText(/Телефон/);
    fireEvent.input(phone, {
      target: { value: number },
      inputType: "insertReplacementText",
    });
    expect(screen.getByRole("alert").textContent).toContain("+375 и 9 цифр");
    expect(screen.getByRole("alert").textContent).toContain(
      "+375 29 123-45-67",
    );
    expect(phone.getAttribute("aria-invalid")).toBe("true");
    fireEvent.input(phone, { target: { value: "+375291234567" } });
    expect(phone.getAttribute("aria-invalid")).toBe("false");
    expect(screen.queryByRole("alert")).toBeNull();
  },
);

it("detects silent browser autofill and retains its value when interest changes", async () => {
  const user = userEvent.setup();
  renderFlow();
  const phone = screen.getByLabelText<HTMLInputElement>(/Телефон/);
  phone.value = "+12025550123";
  fireEvent.animationStart(phone, { animationName: "autofillDetected" });
  expect(screen.getByRole("alert").textContent).toContain("+375 29 123-45-67");
  await user.click(screen.getByLabelText("Разовый заказ"));
  expect(phone.value).toBe("+12025550123");
  expect(phone.getAttribute("aria-invalid")).toBe("true");
});

it("rejects the visible autofilled phone instead of submitting a stale valid phone", async () => {
  const user = userEvent.setup();
  const fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", fetchMock);
  renderFlow();
  await user.type(screen.getByLabelText(/Как вас зовут/), "Autofill check");
  await user.click(screen.getByLabelText("Есть вопрос"));
  const phone = screen.getByLabelText<HTMLInputElement>(/Телефон/);
  fireEvent.change(phone, { target: { value: "+375291234567" } });
  phone.value = "+12025550123";
  const form = phone.form;
  if (!form) throw new Error("Expected lead form");
  fireEvent.submit(form);
  expect(fetchMock).not.toHaveBeenCalled();
  expect(phone.getAttribute("aria-invalid")).toBe("true");
  expect(document.activeElement).toBe(phone);
});

it.each([
  ["+375 29 123-45-67", "+375291234567"],
  ["+375 29 123 45 67", "+375291234567"],
  ["375291234567", "+375291234567"],
  ["+375 12 345-67-89", "+375123456789"],
  ["+375341236346", "+375341236346"],
])(
  "submits the form with %s without requiring a specific phone format",
  async (phone, normalizedPhone) => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ status: "created" }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    renderFlow();
    await user.type(
      screen.getByLabelText(/Как вас зовут/),
      "Phone format check",
    );
    fireEvent.change(screen.getByLabelText(/Телефон/), {
      target: { value: phone },
    });
    await user.click(screen.getByLabelText("Есть вопрос"));
    await user.click(screen.getByRole("button", { name: /Оставить заявку/ }));
    await screen.findByText(/Заявка получена/);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/lead",
      expect.objectContaining({
        body: expect.stringContaining(`"phone":"${normalizedPhone}"`),
      }),
    );
  },
);

it("preserves an edited comment and contacts while switching product to subscription", async () => {
  const user = userEvent.setup();
  renderFlow();
  const name = screen.getByLabelText(/Как вас зовут/) as HTMLInputElement;
  const comment = screen.getByLabelText(/Комментарий/) as HTMLTextAreaElement;
  await user.type(name, "Тест");
  await user.type(comment, "Без помола");
  await user.click(screen.getByRole("button", { name: /Select Ethiopia/ }));
  expect(screen.getByText("Эфиопия Иргачеффе")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: /Select subscription/ }));
  expect(screen.queryByText("Эфиопия Иргачеффе")).toBeNull();
  expect((screen.getByLabelText("Подписка") as HTMLInputElement).checked).toBe(
    true,
  );
  expect(name.value).toBe("Тест");
  expect(comment.value).toBe("Без помола");
});

it("selects multiple coffees, removes one independently, and submits all remaining choices", async () => {
  const user = userEvent.setup();
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json({ status: "created" }, { status: 201 }));
  vi.stubGlobal("fetch", fetchMock);
  renderFlow();
  await user.type(
    screen.getByLabelText(/Как вас зовут/),
    "Product selection check",
  );
  await user.type(screen.getByLabelText(/Телефон/), "+375291234567");
  await user.type(screen.getByLabelText(/Комментарий/), "Без помола");
  await user.click(screen.getByLabelText("Разовый заказ"));
  await user.click(screen.getByRole("checkbox", { name: /Эфиопия Иргачеффе/ }));
  await user.click(screen.getByRole("checkbox", { name: /Колумбия Уила/ }));
  await user.click(screen.getByRole("checkbox", { name: /Бразилия Серрадо/ }));
  await user.click(screen.getByRole("checkbox", { name: /Бразилия Серрадо/ }));
  expect(
    screen.getByRole<HTMLInputElement>("checkbox", {
      name: /Эфиопия Иргачеффе/,
    }).checked,
  ).toBe(true);
  expect(
    screen.getByRole<HTMLInputElement>("checkbox", { name: /Колумбия Уила/ })
      .checked,
  ).toBe(true);
  expect(
    screen.getByRole<HTMLInputElement>("checkbox", { name: /Бразилия Серрадо/ })
      .checked,
  ).toBe(false);
  const increase = screen.getByRole<HTMLButtonElement>("button", {
    name: "Увеличить количество: Эфиопия Иргачеффе",
  });
  const decrease = screen.getByRole<HTMLButtonElement>("button", {
    name: "Уменьшить количество: Эфиопия Иргачеффе",
  });
  expect(decrease.disabled).toBe(true);
  for (let index = 0; index < 4; index++) await user.click(increase);
  expect(increase.disabled).toBe(true);
  await user.click(increase);
  expect(
    screen.getByRole("group", { name: "Количество: Эфиопия Иргачеффе" })
      .textContent,
  ).toContain("5 уп.");
  await user.click(decrease);
  expect(increase.disabled).toBe(false);
  await user.click(screen.getByRole("button", { name: /Оставить заявку/ }));
  await screen.findByText(/Заявка получена/);
  const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
  expect(body).toMatchObject({
    name: "Product selection check",
    phone: "+375291234567",
    comment: "Без помола",
    interest: "one_time",
    productId: "ethiopia-yirgacheffe",
    productIds: ["ethiopia-yirgacheffe", "colombia-huila"],
    productQuantities: { "ethiopia-yirgacheffe": 4, "colombia-huila": 1 },
  });
});

it("retains values and offers retry when the actual transport reports unavailable", async () => {
  const user = userEvent.setup();
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      Response.json({ status: "unavailable" }, { status: 503 }),
    );
  vi.stubGlobal("fetch", fetchMock);
  renderFlow();
  await user.type(screen.getByLabelText(/Как вас зовут/), "Тест");
  await user.type(screen.getByLabelText(/Телефон/), "+375291234567");
  await user.click(screen.getByLabelText("Есть вопрос"));
  await user.click(screen.getByRole("button", { name: /Оставить заявку/ }));
  await screen.findByText(/Не получилось отправить заявку/);
  expect((screen.getByLabelText(/Телефон/) as HTMLInputElement).value).toBe(
    "+375291234567",
  );
  expect(
    screen.getByRole("button", { name: /Попробовать ещё раз/ }),
  ).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("sends one immutable request while duplicate submit events are pending", async () => {
  const user = userEvent.setup();
  let complete: (response: Response) => void = () => {};
  const fetchMock = vi.fn().mockReturnValue(
    new Promise<Response>((resolve) => {
      complete = resolve;
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  renderFlow();
  await user.type(screen.getByLabelText(/Как вас зовут/), "Тест");
  await user.type(screen.getByLabelText(/Телефон/), "+375291234567");
  await user.click(screen.getByLabelText("Есть вопрос"));
  const form = screen
    .getByRole("button", { name: /Оставить заявку/ })
    .closest("form");
  if (!form) throw new Error("Expected form");
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  complete(Response.json({ status: "duplicate" }, { status: 200 }));
  await waitFor(() =>
    expect(screen.getByText(/Ваша заявка уже получена/)).toBeTruthy(),
  );
});

it("focuses a server-rejected field and preserves entered values", async () => {
  const user = userEvent.setup();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json(
          { status: "invalid", errors: { phone: "Проверьте номер телефона." } },
          { status: 400 },
        ),
      ),
  );
  renderFlow();
  await user.type(screen.getByLabelText(/Как вас зовут/), "Test");
  await user.type(screen.getByLabelText(/Телефон/), "+375291234567");
  await user.click(screen.getByLabelText("Есть вопрос"));
  await user.click(screen.getByRole("button", { name: /Оставить заявку/ }));
  await screen.findByText("Проверьте номер телефона.");
  expect(document.activeElement).toBe(screen.getByLabelText(/Телефон/));
  expect(
    (screen.getByLabelText(/Как вас зовут/) as HTMLInputElement).value,
  ).toBe("Test");
});
