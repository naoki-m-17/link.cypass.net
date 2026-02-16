"use client";

import { useState } from "react";
import styles from "./not-found.module.css";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setStatus("loading");
    setErrorMessage("");

    const res = await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });

    const data = (await res.json()) as { ok: boolean; error?: string };

    if (data.ok) {
      setStatus("success");
      form.reset();
    } else {
      setStatus("error");
      setErrorMessage(data.error ?? "送信に失敗しました");
    }
  }

  return (
    <section className={styles.contactSection}>
      <h3 className={styles.contactTitle}>URLが壊れてる！</h3>
      <p className={styles.contactDescription}>
        弊社メンバーから共有されたURLが開けなかった場合は
        <br />
        お手数ですが、貴社名とご担当者名を入力してお知らせください。
      </p>
      <form className={styles.contactForm} onSubmit={handleSubmit}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            className={styles.textInput}
            name="inquiry"
            placeholder="株式会社CyPass、松永"
            aria-label="貴社名とお名前"
            disabled={status === "loading"}
          />
          <button
            type="submit"
            className={styles.submitButton}
            aria-label="送信する"
            disabled={status === "loading"}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {status === "success" && (
          <p className={styles.feedbackSuccess}>送信しました。お手数おかけしました🙇‍♂️</p>
        )}
        {status === "error" && (
          <p className={styles.feedbackError}>{errorMessage}</p>
        )}
      </form>
    </section>
  );
}
