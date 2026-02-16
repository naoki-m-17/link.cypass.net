import styles from "./page.module.css";

const SERVICES = [
  {
    href: "https://cypass.net/company",
    name: "cypass.net",
    description: "会社HP",
  },
  {
    href: "https://naoki.cypass.net",
    name: "naoki.cypass.net",
    description: "受託開発事業",
  },
  {
    href: "https://knowledge.cypass.net",
    name: "knowledge.cypass.net",
    description: "ナレッジ",
  },
  {
    href: "https://link.cypass.net",
    name: "link.cypass.net",
    description: "短縮URLサービス",
  },
//   {
//     href: "https://sutekina-omise.com",
//     name: "sutekina-omise.com",
//     description: "お店探し",
//   },
] as const;

export default function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>CyPass Link Service</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>このサービスについて</h2>
          <p className={styles.description}>
            link.cypass.net は、CyPass が提供する短縮URLサービスです。
            メールやSNSでお渡しするURLを短くし、信頼できるドメインで宛先へ誘導します。
            リンクをクリックすると、登録された本来のURLへ自動で転送されます。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>CyPass のサービス</h2>
          <p className={styles.lead}>
            会社サイトおよび公開中のサービスです。ぜひご利用ください。
          </p>
          <ul className={styles.serviceList}>
            {SERVICES.map(({ href, name, description }) => (
              <li key={href} className={styles.serviceItem}>
                <a
                  href={href}
                  className={styles.serviceLink}
                  rel="noopener noreferrer"
                >
                  <span className={styles.serviceName}>{name}</span>
                  <span className={styles.serviceDesc}>{description}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
