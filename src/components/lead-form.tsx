"use client";

import { getProduct } from "@/content/coffee";
import { useLeadFlow } from "./lead-flow";
import { Container } from "./container";
import actions from "./action.module.css";
import styles from "./lead-form.module.css";

const interestOptions = [
  { value: "subscription", label: "Подписка" },
  { value: "one_time", label: "Разовый заказ" },
  { value: "question", label: "Есть вопрос" },
] as const;

export function LeadForm() {
  const flow = useLeadFlow();
  const pending = flow.state.type === "submitting";
  const selectedProduct = getProduct(flow.selection.productId);
  const message =
    flow.state.type === "success"
      ? "Заявка получена. Перезвоним и согласуем детали вашего заказа."
      : flow.state.type === "duplicate"
        ? "Ваша заявка уже получена. Повторно отправлять её не нужно — мы свяжемся с вами."
        : flow.state.type === "error"
          ? flow.state.message
          : "";

  return (
    <section
      id="request"
      className={styles.section}
      aria-labelledby="request-heading"
    >
      <Container className={styles.grid}>
        <div className={styles.copy}>
          <span className="eyebrow">05 / ЗАЯВКА</span>
          <h2 id="request-heading" tabIndex={-1}>
            Заказать кофе
            <br />
            или задать вопрос.
          </h2>
          <p>
            Оставьте номер — позвоним, поможем выбрать кофе и договоримся о
            доставке.
          </p>
          <div className={styles.note}>
            <span className={styles.star} aria-hidden="true">
              ✳
            </span>
            <span>
              Не знаете, какой кофе взять?
              <br />
              Расскажите, как обычно его готовите.
            </span>
          </div>
        </div>
        <form
          method="post"
          action="/api/lead"
          noValidate
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            void flow.submit();
          }}
          aria-busy={pending}
        >
          <fieldset disabled={pending} className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="lead-name">
                Как вас зовут <span>*</span>
              </label>
              <input
                id="lead-name"
                name="name"
                autoComplete="name"
                required
                maxLength={100}
                value={flow.draft.name}
                placeholder="Ваше имя"
                onChange={(event) => flow.edit("name", event.target.value)}
                onBlur={() => flow.validateField("name")}
                aria-invalid={Boolean(flow.errors.name)}
                aria-describedby={flow.errors.name ? "error-name" : undefined}
              />
              {flow.errors.name ? (
                <p id="error-name" className={styles.error}>
                  {flow.errors.name}
                </p>
              ) : null}
            </div>
            <div className={styles.field}>
              <label htmlFor="lead-phone">
                Телефон <span>*</span>
              </label>
              <input
                id="lead-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                required
                maxLength={64}
                value={flow.draft.phone}
                placeholder="Например, +375291234567"
                onChange={(event) => flow.edit("phone", event.target.value)}
                onBlur={() => flow.validateField("phone")}
                aria-invalid={Boolean(flow.errors.phone)}
                aria-describedby={flow.errors.phone ? "error-phone" : undefined}
              />
              {flow.errors.phone ? (
                <p id="error-phone" className={styles.error}>
                  {flow.errors.phone}
                </p>
              ) : null}
            </div>
            <fieldset
              className={styles.interests}
              aria-describedby={
                flow.errors.interest ? "error-interest" : undefined
              }
            >
              <legend>
                Что вас интересует <span>*</span>
              </legend>
              <div className={styles.options}>
                {interestOptions.map((option) => (
                  <label key={option.value} className={styles.option}>
                    <input
                      id={`interest-${option.value}`}
                      type="radio"
                      required
                      name="interest"
                      value={option.value}
                      checked={flow.selection.interest === option.value}
                      onChange={() =>
                        flow.choose(
                          option.value === "one_time"
                            ? {
                                interest: "one_time",
                                productId: flow.selection.productId,
                              }
                            : { interest: option.value, productId: null },
                        )
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {flow.errors.interest ? (
                <p id="error-interest" className={styles.error}>
                  {flow.errors.interest}
                </p>
              ) : null}
            </fieldset>
            {selectedProduct ? (
              <div className={styles.selection}>
                <div>
                  <span className="eyebrow">ВЫ ВЫБРАЛИ</span>
                  <strong>{selectedProduct.name}</strong>
                  <span>
                    {selectedProduct.size} · {selectedProduct.price} BYN
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    flow.choose({ interest: "one_time", productId: null })
                  }
                  aria-label="Убрать выбранный кофе"
                >
                  ×
                </button>
              </div>
            ) : flow.selection.interest === "subscription" ? (
              <div className={styles.selection}>
                <div>
                  <span className="eyebrow">ВАША ПОДПИСКА</span>
                  <strong>2 пачки по 250 г каждый месяц</strong>
                  <span>54 BYN · доставка включена</span>
                </div>
              </div>
            ) : null}
            <div className={styles.field}>
              <label htmlFor="lead-comment">
                Комментарий <span className={styles.optional}>по желанию</span>
              </label>
              <textarea
                id="lead-comment"
                name="comment"
                rows={3}
                maxLength={1000}
                value={flow.draft.comment}
                placeholder="Какой кофе любите? Есть пожелания?"
                onChange={(event) => flow.edit("comment", event.target.value)}
                onBlur={() => flow.validateField("comment")}
                aria-invalid={Boolean(flow.errors.comment)}
                aria-describedby={
                  flow.errors.comment ? "error-comment" : undefined
                }
              />
              {flow.errors.comment ? (
                <p id="error-comment" className={styles.error}>
                  {flow.errors.comment}
                </p>
              ) : null}
            </div>
            <button
              type="submit"
              className={`${actions.button} ${styles.submit}`}
              disabled={pending}
            >
              {pending
                ? "Отправляем…"
                : flow.state.type === "error"
                  ? "Попробовать ещё раз"
                  : "Оставить заявку"}
              <span className={actions.arrow} aria-hidden="true">
                ↗
              </span>
            </button>
          </fieldset>
          <div
            className={styles.status}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {pending ? (
              <p>Отправляем вашу заявку…</p>
            ) : message ? (
              <p
                className={
                  flow.state.type === "error" ? styles.error : styles.success
                }
              >
                {message}
              </p>
            ) : (
              <p className={styles.hint}>
                Оформим заказ после звонка. Оплата на сайте не нужна.
              </p>
            )}
          </div>
          <noscript>
            <p className={styles.error}>
              Для отправки заявки включите JavaScript в браузере.
            </p>
          </noscript>
        </form>
      </Container>
    </section>
  );
}
