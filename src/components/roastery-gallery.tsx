"use client";

import Image from "next/image";
import { formatMessage } from "@/i18n/format";
import type { Dictionary } from "@/i18n/types";
import { useId, useRef, useState } from "react";
import styles from "./roastery-gallery.module.css";

const photos = [
  {
    src: "/images/roastery.png",
    position: "36% center",
  },
  {
    src: "/images/roastery-charging.png",
    position: "center",
  },
  {
    src: "/images/roastery-cooling.png",
    position: "center",
  },
  {
    src: "/images/roastery-sorting.png",
    position: "center",
  },
] as const;

export function RoasteryGallery({ copy }: { copy: Dictionary["gallery"] }) {
  const trackId = useId();
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function showPhoto(index: number) {
    const element = track.current;
    if (!element) return;
    const target = (index + photos.length) % photos.length;
    element.scrollTo({
      left: target * element.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <figure
      className={styles.gallery}
      role="region"
      aria-roledescription={copy.carousel}
      aria-label={copy.label}
    >
      <div
        id={trackId}
        ref={track}
        className={styles.track}
        tabIndex={0}
        aria-label={copy.instructions}
        onScroll={(event) => {
          const element = event.currentTarget;
          if (element.clientWidth) {
            setActive(
              Math.max(
                0,
                Math.min(
                  photos.length - 1,
                  Math.round(element.scrollLeft / element.clientWidth),
                ),
              ),
            );
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            showPhoto(active + (event.key === "ArrowRight" ? 1 : -1));
          } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            showPhoto(event.key === "Home" ? 0 : photos.length - 1);
          }
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.src}
            className={styles.slide}
            role="group"
            aria-roledescription={copy.slide}
            aria-label={formatMessage(copy.position, {
              current: index + 1,
              total: photos.length,
            })}
            aria-hidden={index !== active}
          >
            <Image
              src={photo.src}
              alt={copy.photos[index].alt}
              fill
              sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) 55vw, 660px"
              className={styles.image}
              style={{ objectPosition: photo.position }}
              draggable={false}
            />
          </div>
        ))}
      </div>
      <figcaption
        className={styles.caption}
        aria-live="polite"
        aria-atomic="true"
      >
        {copy.photos[active].caption}
      </figcaption>
      <div className={styles.controls}>
        <span className={styles.counter} aria-live="off" aria-hidden="true">
          {String(active + 1).padStart(2, "0")}
          <span> / {String(photos.length).padStart(2, "0")}</span>
        </span>
        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.button}
            aria-label={copy.previous}
            title={copy.previous}
            aria-controls={trackId}
            onClick={() => showPhoto(active - 1)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12H3m7-7-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.button}
            aria-label={copy.next}
            title={copy.next}
            aria-controls={trackId}
            onClick={() => showPhoto(active + 1)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h18m-7-7 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </figure>
  );
}
