import styles from "./page.module.css";

const SERVICES = [
//   {
//     href: "https://cypass.net",
//     name: "会社HP",
//     image: "/images/cypass-company.png",
//   },
//   {
//     href: "https://naoki.cypass.net",
//     name: "受託開発事業",
//     image: "/images/cypass-development.png",
//   },
//   {
//     href: "https://knowledge.cypass.net",
//     name: "ナレッジ",
//     image: "/images/cypass-knowledge.png",
//   },
//   {
//     href: "https://sutekina-omise.com",
//     name: "ステキなオミセ",
//   },
] as const;

export default function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>CyPass Link Service</h1>

        <section className={styles.section}>
          <p className={styles.description}>弊社にて進行中の受託案件および提携プロジェクトにおける、テスト環境へのアクセスツールです。</p>
        </section>

        {SERVICES.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>CyPass Directory</h2>
            <ul className={styles.serviceList}>
              {SERVICES.map(({ href, name, image }) => (
                <li key={href} className={styles.serviceItem}>
                  <a
                    href={href}
                    className={styles.serviceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundImage: `url(${image})` }}
                  >
                    <span className={styles.serviceName}>{name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
