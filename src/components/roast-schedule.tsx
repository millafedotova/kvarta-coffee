import { Container } from "./container";
import styles from "./roast-schedule.module.css";

export function RoastSchedule() {
  return (
    <Container>
      <div
        className={styles.schedule}
        aria-label="Расписание обжарки и доставки"
      >
        <div className={styles.day}>
          <span className={styles.dayMark}>ЧТ</span>
          <div>
            <span className="eyebrow">КАЖДУЮ НЕДЕЛЮ</span>
            <h2>Обжариваем в четверг</h2>
            <p>Каждую неделю, партиями по 5 кг.</p>
          </div>
        </div>
        <div className={`${styles.day} ${styles.dark}`}>
          <span className={styles.dayMark}>ПТ</span>
          <div>
            <span className="eyebrow">НА СЛЕДУЮЩИЙ ДЕНЬ</span>
            <h2>Привозим в пятницу</h2>
            <p>По Минску. Заказы от 50 BYN — бесплатно.</p>
          </div>
          <span className={styles.arrow} aria-hidden="true">
            ↗
          </span>
        </div>
      </div>
    </Container>
  );
}
