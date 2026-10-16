import { site } from "@/content/site";
import { formatMessage } from "@/i18n/format";
import type { Dictionary } from "@/i18n/types";
import { Container } from "./container";
import { RoasteryGallery } from "./roastery-gallery";
import styles from "./roastery-section.module.css";

export function RoasterySection({
  copy,
  galleryCopy,
}: {
  copy: Dictionary["roastery"];
  galleryCopy: Dictionary["gallery"];
}) {
  return (
    <section
      id="roastery"
      className="sectionSpace"
      aria-labelledby="roastery-heading"
    >
      <Container>
        <div className={styles.grid}>
          <RoasteryGallery copy={galleryCopy} />
          <div className={styles.story}>
            <span className="eyebrow">{copy.eyebrow}</span>
            <h2 id="roastery-heading">{copy.title.join(" ")}</h2>
            <p>{copy.introduction}</p>
            <p>{formatMessage(copy.batches, { batch: site.batchWeightKg })}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
