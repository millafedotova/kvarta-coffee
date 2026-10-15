import Image from "next/image";
import { site } from "@/content/site";
import { Container } from "./container";
import { SelectionButton } from "./selection-button";
import styles from "./subscription-section.module.css";

export function SubscriptionSection() {
  return (
    <section id="subscription" aria-labelledby="subscription-heading">
      <Container>
        <div className={styles.panel}>
          <div className={styles.copy}>
            <span className="eyebrow">02 / ПОДПИСКА НА КОФЕ</span>
            <h2 id="subscription-heading">
              Две пачки
              <br />
              каждый месяц.
            </h2>
            <p className={styles.description}>
              Подписка на кофе с доставкой по Минску.
            </p>
            <div className={styles.offer}>
              <strong>
                {site.subscription.price}
                <span>BYN / месяц</span>
              </strong>
              <p>
                2 пачки × 250 г<br />
                Доставка по Минску включена
              </p>
            </div>
            <SelectionButton
              selection={{ interest: "subscription", productId: null }}
              light
            >
              Хочу подписку
            </SelectionButton>
            <ol className={styles.steps}>
              <li>
                <span>01</span>Оставляете заявку
              </li>
              <li>
                <span>02</span>Согласуем детали по телефону
              </li>
              <li>
                <span>03</span>Получаете кофе каждый месяц
              </li>
            </ol>
          </div>
          <div className={styles.photo}>
            <Image
              src="/images/coffee-foam.jpg"
              alt="Кофейная пенка крупным планом"
              fill
              sizes="(max-width: 767px) 100vw, 45vw"
              className={styles.image}
            />
            <div className={styles.caption}>
              <span className="eyebrow">ПОДПИСКА НА КОФЕ</span>
              <span>
                54 BYN
                <br />в месяц.
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
