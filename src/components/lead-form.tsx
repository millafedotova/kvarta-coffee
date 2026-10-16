"use client";

import { useCallback, useEffect, useRef } from "react";
import { site } from "@/content/site";
import { formatMessage, formatPrice } from "@/i18n/format";
import type { LocalizedCoffee } from "@/i18n/products";
import type { Dictionary } from "@/i18n/types";
import { readVisibleDraft } from "@/lib/lead-draft-handoff";
import { interests } from "@/lib/lead-contract";
import { useLeadFlow } from "./lead-flow";
import { Container } from "./container";
import actions from "./action.module.css";
import styles from "./lead-form.module.css";

export function LeadForm({
  copy,
  products,
}: {
  copy: Dictionary["form"];
  products: Pick<
    LocalizedCoffee,
    "id" | "name" | "size" | "price" | "accent"
  >[];
}) {
  const flow = useLeadFlow();
  const form = useRef<HTMLFormElement>(null);
  const interestOptions = interests.map((value) => ({
    value,
    label: copy.interests[value],
  }));
  const syncDraft = flow.syncDraft;
  const syncVisibleDraft = useCallback(
    (element: HTMLFormElement) => {
      syncDraft(readVisibleDraft(element));
    },
    [syncDraft],
  );

  useEffect(() => {
    const element = form.current;
    function synchronize() {
      if (element) syncVisibleDraft(element);
    }
    const frame = requestAnimationFrame(synchronize);
    window.addEventListener("pageshow", synchronize);
    element?.addEventListener("animationstart", synchronize);
    element?.addEventListener("webkitAnimationStart", synchronize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pageshow", synchronize);
      element?.removeEventListener("animationstart", synchronize);
      element?.removeEventListener("webkitAnimationStart", synchronize);
    };
  }, [syncVisibleDraft, flow.draftVersion]);
  const pending = flow.state.type === "submitting";
  const selectedProductIds =
    flow.selection.productIds ??
    (flow.selection.productId ? [flow.selection.productId] : []);
  const message =
    flow.state.type === "success"
      ? copy.success
      : flow.state.type === "duplicate"
        ? copy.duplicate
        : flow.state.type === "error"
          ? flow.message
          : "";

  return (
    <section
      id="request"
      className={styles.section}
      aria-labelledby="request-heading"
    >
      <Container className={styles.grid}>
        <div className={styles.copy}>
          <h2 id="request-heading" tabIndex={-1}>
            {copy.title.join(" ")}
          </h2>
          <p>{copy.description}</p>
          <div className={styles.note}>
            <span className={styles.star} aria-hidden="true">
              ✳
            </span>
            <span>
              {copy.advice[0]}
              <br />
              {copy.advice[1]}
            </span>
          </div>
        </div>
        <form
          key={flow.draftVersion}
          id="lead-form"
          ref={form}
          method="post"
          action="/api/lead"
          noValidate
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            void flow.submit(readVisibleDraft(event.currentTarget));
          }}
          onInputCapture={(event) => syncVisibleDraft(event.currentTarget)}
          onChangeCapture={(event) => syncVisibleDraft(event.currentTarget)}
          onFocusCapture={(event) => syncVisibleDraft(event.currentTarget)}
          aria-busy={pending}
        >
          <fieldset disabled={pending} className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="lead-name">
                {copy.name} <span>*</span>
              </label>
              <input
                id="lead-name"
                name="name"
                autoComplete="name"
                required
                maxLength={100}
                defaultValue={flow.draft.name}
                placeholder={copy.namePlaceholder}
                onChange={(event) => flow.edit("name", event.target.value)}
                onBlur={(event) =>
                  flow.validateField("name", event.currentTarget.value)
                }
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
                {copy.phone} <span>*</span>
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
                defaultValue={flow.draft.phone}
                placeholder="+375 XX XXX-XX-XX"
                onChange={(event) => flow.edit("phone", event.target.value)}
                onBlur={(event) =>
                  flow.validateField("phone", event.currentTarget.value)
                }
                aria-invalid={Boolean(flow.errors.phone)}
                aria-describedby={flow.errors.phone ? "error-phone" : undefined}
              />
              {flow.errors.phone ? (
                <p id="error-phone" className={styles.error} role="alert">
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
                {copy.interest} <span>*</span>
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
                                productIds: selectedProductIds,
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
            {flow.selection.interest === "one_time" ? (
              <fieldset
                className={styles.products}
                id="lead-products"
                tabIndex={-1}
                aria-describedby={
                  flow.errors.productId ||
                  flow.errors.productIds ||
                  flow.errors.productQuantities
                    ? "error-product"
                    : undefined
                }
              >
                <legend>
                  {copy.product} <span>{copy.multiple}</span>
                </legend>
                <div className={styles.productGrid}>
                  {products.map((product) => (
                    <div className={styles.productItem} key={product.id}>
                      <label className={styles.productChoice}>
                        <input
                          type="checkbox"
                          name="productIds"
                          value={product.id}
                          checked={selectedProductIds.includes(product.id)}
                          onChange={(event) => {
                            const nextProducts = event.currentTarget.checked
                              ? [...selectedProductIds, product.id]
                              : selectedProductIds.filter(
                                  (id) => id !== product.id,
                                );
                            flow.choose({
                              interest: "one_time",
                              productId: nextProducts[0] ?? null,
                              productIds: nextProducts,
                            });
                          }}
                        />
                        <span
                          className={`${styles.productColor} ${styles[product.accent]}`}
                          aria-hidden="true"
                        />
                        <span className={styles.productInfo}>
                          <span>{product.name}</span>
                          <span>
                            {product.size} ·{" "}
                            {formatPrice(product.price, flow.locale)}
                          </span>
                        </span>
                        <span
                          className={styles.productCheck}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      </label>
                      {selectedProductIds.includes(product.id) ? (
                        <div
                          className={styles.quantity}
                          role="group"
                          aria-label={formatMessage(copy.quantity, {
                            product: product.name,
                          })}
                        >
                          <button
                            type="button"
                            aria-label={formatMessage(copy.decrease, {
                              product: product.name,
                            })}
                            disabled={
                              (flow.selection.productQuantities?.[product.id] ??
                                1) <= 1
                            }
                            onClick={() =>
                              flow.choose({
                                interest: "one_time",
                                productId: flow.selection.productId,
                                productIds: selectedProductIds,
                                productQuantities: {
                                  ...flow.selection.productQuantities,
                                  [product.id]:
                                    (flow.selection.productQuantities?.[
                                      product.id
                                    ] ?? 1) - 1,
                                },
                              })
                            }
                          >
                            −
                          </button>
                          <span aria-live="polite" aria-atomic="true">
                            {formatMessage(copy.packs, {
                              count:
                                flow.selection.productQuantities?.[
                                  product.id
                                ] ?? 1,
                            })}
                          </span>
                          <button
                            type="button"
                            aria-label={formatMessage(copy.increase, {
                              product: product.name,
                            })}
                            disabled={
                              (flow.selection.productQuantities?.[product.id] ??
                                1) >= site.maxProductQuantity
                            }
                            onClick={() =>
                              flow.choose({
                                interest: "one_time",
                                productId: flow.selection.productId,
                                productIds: selectedProductIds,
                                productQuantities: {
                                  ...flow.selection.productQuantities,
                                  [product.id]:
                                    (flow.selection.productQuantities?.[
                                      product.id
                                    ] ?? 1) + 1,
                                },
                              })
                            }
                          >
                            +
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
                <p className={styles.quantityHint}>
                  {formatMessage(copy.quantityHint, {
                    max: site.maxProductQuantity,
                  })}
                </p>
                {flow.selection.productId ? (
                  <button
                    type="button"
                    className={styles.clearProduct}
                    onClick={() =>
                      flow.choose({ interest: "one_time", productId: null })
                    }
                  >
                    {copy.clear}
                  </button>
                ) : null}
                {flow.errors.productId ||
                flow.errors.productIds ||
                flow.errors.productQuantities ? (
                  <p id="error-product" className={styles.error}>
                    {flow.errors.productQuantities ??
                      flow.errors.productIds ??
                      flow.errors.productId}
                  </p>
                ) : null}
              </fieldset>
            ) : flow.selection.interest === "subscription" ? (
              <div className={styles.selection}>
                <div>
                  <span className="eyebrow">{copy.subscription}</span>
                  <strong>
                    {formatMessage(copy.subscriptionQuantity, {
                      count: site.subscription.count,
                      weight: site.subscription.weight,
                    })}
                  </strong>
                  <span>
                    {formatMessage(copy.subscriptionPrice, {
                      price: formatPrice(site.subscription.price, flow.locale),
                    })}
                  </span>
                </div>
              </div>
            ) : null}
            <div className={styles.field}>
              <label htmlFor="lead-comment">
                {copy.comment}{" "}
                <span className={styles.optional}>{copy.optional}</span>
              </label>
              <textarea
                id="lead-comment"
                name="comment"
                rows={3}
                maxLength={1000}
                defaultValue={flow.draft.comment}
                placeholder={copy.commentPlaceholder}
                onChange={(event) => flow.edit("comment", event.target.value)}
                onBlur={(event) =>
                  flow.validateField("comment", event.currentTarget.value)
                }
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
                ? copy.submitting
                : flow.state.type === "error"
                  ? copy.retry
                  : copy.submit}
            </button>
          </fieldset>
          <div
            className={styles.status}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {pending ? (
              <p>{copy.pending}</p>
            ) : message ? (
              <p
                className={
                  flow.state.type === "error" ? styles.error : styles.success
                }
              >
                {message}
              </p>
            ) : (
              <p className={styles.hint}>{copy.hint}</p>
            )}
          </div>
          <noscript>
            <p className={styles.error}>{copy.noScript}</p>
          </noscript>
        </form>
      </Container>
    </section>
  );
}
