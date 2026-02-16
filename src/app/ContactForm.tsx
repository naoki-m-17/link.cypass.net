"use client";

import styles from "./not-found.module.css";

export function ContactForm() {
  return (
    <section className={styles.contactSection}>
      <h3 className={styles.contactTitle}>URLが壊れてる！</h3>
      <p className={styles.contactDescription}>
		弊社メンバーから共有されたURLが開けなかった場合は
		<br/>お手数ですが、貴社名とお名前を入力して報告お願いします。
      </p>
      <form className={styles.contactForm} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            className={styles.textInput}
            name="inquiry"
            placeholder="株式会社CyPass、松永"
            aria-label="貴社名とお名前"
          />
          <button type="submit" className={styles.submitButton} aria-label="送信する">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
}
