import styles from "./not-found.module.css";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h2 className={styles.title}>404 - Link Not Found</h2>
        <p className={styles.message}>
          指定されたリンクが見つからないか、有効期限が切れている可能性があります。
        </p>
        <p className={styles.hint}>URLが正しいか再度ご確認ください。</p>
        <Link href="/" className={styles.button}>
          トップページへ
        </Link>
      </div>
    </div>
  );
}
