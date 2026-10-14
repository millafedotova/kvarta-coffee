import { expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeadFlow } from "../src/components/lead-flow";
import { LeadForm } from "../src/components/lead-form";
import { SelectionButton } from "../src/components/selection-button";

function renderFlow() {
  return render(
    <LeadFlow>
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
      <LeadForm />
    </LeadFlow>,
  );
}

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
  await screen.findByText(/Сервис временно недоступен/);
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
