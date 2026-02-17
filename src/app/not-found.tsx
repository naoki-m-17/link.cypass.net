import { getClientIp } from "@/lib/getClientIp";
import { BLOCKED_MESSAGE, isIpBlocked } from "@/lib/redirectService";
import styles from "./not-found.module.css";
import { ContactForm } from "./ContactForm";

export default async function NotFound() {
  const ip = await getClientIp();
  const blocked = await isIpBlocked(ip);

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h2 className={styles.title}>このリンクは使えません</h2>
        {blocked && (
          <p className={styles.blockedReason}>{BLOCKED_MESSAGE}</p>
        )}
        <ContactForm />
      </div>
    </div>
  );
}
