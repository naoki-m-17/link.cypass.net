import styles from "./not-found.module.css";
import { ContactForm } from "./ContactForm";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h2 className={styles.title}>このリンクは使えません</h2>

        <ContactForm />
      </div>
    </div>
  );
}
