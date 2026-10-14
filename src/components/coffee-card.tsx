import Image from "next/image";
import type { CoffeeProduct } from "@/content/coffee";
import { SelectionButton } from "./selection-button";
import styles from "./coffee-section.module.css";

export function CoffeeCard({ product }: { product: CoffeeProduct }) {
  return (
    <article className={styles.card}>
      <div className={styles.photo}>
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 639px) 90vw, (max-width: 1099px) 45vw, 24vw"
          className={styles.image}
        />
        <span className={styles.size}>{product.size}</span>
      </div>
      <div className={styles.origin}>
        <span className={`${styles.dot} ${styles[product.accent]}`} />
        <span className="eyebrow">{product.origin}</span>
      </div>
      <h3>{product.name}</h3>
      <p className={styles.notes}>{product.notes}</p>
      <p className={styles.detail}>{product.detail}</p>
      <div className={styles.cardBottom}>
        <span className={styles.price}>
          {product.price} <span>BYN</span>
        </span>
        <SelectionButton
          selection={{ interest: "one_time", productId: product.id }}
          className={styles.cardButton}
        >
          Хочу этот кофе
        </SelectionButton>
      </div>
    </article>
  );
}
