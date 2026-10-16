"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { formatMessage, formatNumber } from "@/i18n/format";
import type { LocalizedCoffee } from "@/i18n/products";
import type { Dictionary } from "@/i18n/types";
import { useLeadFlow } from "./lead-flow";
import { SelectionButton } from "./selection-button";
import styles from "./coffee-section.module.css";
import dialogStyles from "./coffee-details.module.css";
import actionStyles from "./action.module.css";

export function CoffeeCard({
  product,
  copy,
  locale,
}: {
  product: LocalizedCoffee;
  copy: Dictionary["coffee"];
  locale: Locale;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [open, setOpen] = useState(false);
  const flow = useLeadFlow();
  const details = product.details;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function showDetails() {
    dialog.current?.showModal();
    if (content.current) content.current.scrollTop = 0;
    setOpen(true);
  }

  function closeDetails() {
    dialog.current?.close();
    setOpen(false);
  }

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.photo}
        aria-label={formatMessage(copy.open, { product: product.name })}
        aria-haspopup="dialog"
        onClick={showDetails}
      >
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 639px) 90vw, (max-width: 1099px) 45vw, 24vw"
          className={styles.image}
        />
        <span className={styles.size}>{product.size}</span>
      </button>
      <div className={styles.origin}>
        <span className={`${styles.dot} ${styles[product.accent]}`} />
        <span className="eyebrow">{product.origin}</span>
      </div>
      <h3>
        <button
          type="button"
          className={styles.nameButton}
          aria-haspopup="dialog"
          onClick={showDetails}
        >
          {product.name}
        </button>
      </h3>
      <p className={styles.notes}>{product.notes}</p>
      {product.detail ? (
        <p className={styles.detail}>{product.detail}</p>
      ) : null}
      <button
        type="button"
        className={styles.detailsButton}
        aria-label={formatMessage(copy.moreAbout, { product: product.name })}
        aria-haspopup="dialog"
        onClick={showDetails}
      >
        {copy.more}
      </button>
      <div className={styles.cardBottom}>
        <span className={styles.price}>
          {formatNumber(product.price, locale)} <span>BYN</span>
        </span>
        <SelectionButton
          selection={{ interest: "one_time", productId: product.id }}
          className={styles.cardButton}
        >
          {copy.choose}
        </SelectionButton>
      </div>
      <dialog
        ref={dialog}
        className={dialogStyles.dialog}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDetails();
        }}
      >
        <div className={dialogStyles.panel}>
          <button
            type="button"
            className={dialogStyles.close}
            aria-label={copy.closeDetails}
            title={copy.close}
            onClick={closeDetails}
          >
            <span aria-hidden="true">×</span>
          </button>
          <div className={dialogStyles.visual}>
            <Image
              src={product.image}
              alt={product.imageAlt}
              fill
              sizes="(max-width: 639px) 85vw, 380px"
              className={dialogStyles.image}
            />
            <span className={dialogStyles.size}>{product.size}</span>
          </div>
          <div
            ref={content}
            className={dialogStyles.content}
            tabIndex={0}
            role="region"
            aria-labelledby={titleId}
          >
            <span className="eyebrow">{product.origin}</span>
            <h2 id={titleId}>{product.name}</h2>
            <p id={descriptionId} className={dialogStyles.introduction}>
              {details.introduction}
            </p>
            {details.profile ? (
              <details className={dialogStyles.profile}>
                <summary>{copy.profile}</summary>
                <dl className={dialogStyles.beanFacts}>
                  {details.profile.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>
                        {fact.value}
                        {fact.description ? (
                          <p className={dialogStyles.factDescription}>
                            {fact.description}
                          </p>
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              </details>
            ) : null}
            {details.recipe ? (
              <div className={dialogStyles.recipe}>
                <h3>{copy.recipe}</h3>
                <dl className={dialogStyles.recipeFacts}>
                  {details.recipe.facts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>
                        {fact.value}
                        {fact.description ? (
                          <p className={dialogStyles.factDescription}>
                            {fact.description}
                          </p>
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className={dialogStyles.contextNote}>{copy.recipeNote}</p>
              </div>
            ) : null}
            {details.ordering ? (
              <div className={dialogStyles.ordering}>
                <h3>{copy.ordering}</h3>
                <p>{details.ordering}</p>
              </div>
            ) : null}
            <div className={dialogStyles.purchase}>
              <div>
                <span className={dialogStyles.price}>
                  {formatNumber(product.price, locale)} <span>BYN</span>
                </span>
                <span className={dialogStyles.weight}>{product.size}</span>
              </div>
              <button
                type="button"
                className={actionStyles.button}
                disabled={flow.state.type === "submitting"}
                onClick={() => {
                  closeDetails();
                  flow.choose(
                    { interest: "one_time", productId: product.id },
                    true,
                  );
                }}
              >
                {copy.choose}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </article>
  );
}
