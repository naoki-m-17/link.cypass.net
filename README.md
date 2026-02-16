# CyPass Link Service

（主に、受託開発の依頼をいただいたクライアント様のためのプレビューリンク共有用webアプリです。）

デプロイ情報：[https://link.cypass.net](https://link.cypass.net)  
リダイレクト例：[https://link.cypass.net/EQrE4sfZNy0XzOrE8DWU](https://link.cypass.net/EQrE4sfZNy0XzOrE8DWU)

---

`/{id}` で Firestore に登録した URL へ転送し、クリック数・アクセス日時を記録します。  
独自ドメインで信頼感を出しつつ、遷移先は DB の更新だけで差し替えられます。

---

## 技術スタック

| 分類 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| データベース | Firebase Firestore |
| 認証・接続 | Firebase Admin SDK（サーバーサイドのみ） |
| メール送信 | Gmail API (OAuth 2.0) |

---

## アーキテクチャ

### 全体構成（リダイレクト 1 回の流れ）

```
  ① クライアント  GET /{id}
         │
         ▼
  ② app/[id]/page.tsx (Server Component)
         │  getRedirectUrl(id)
         ▼
  ③ lib/redirectService.ts  ──►  lib/firebase-admin.ts (FIREBASE_SERVICE_ACCOUNT_KEY で初期化)
         │
         │  Firestore 読取: redirects/{id} から url 取得
         ▼
  ④ url なし → notFound() → 404
     url あり → incrementClickCount(id) → Firestore 書込 (clicks++, accessedAt 追加)
             → redirect(url) で 302
         │
         ▼
  ⑤ クライアントは転送先へ
```

リダイレクトと計測は同一リクエスト内で完結し、クライアントでの追加往復は不要。

### ディレクトリ構成

```
scripts/
├── get-gmail-refresh-token.mjs  # Gmail API 用リフレッシュトークン取得（pnpm gmail:token）
src/
├── app/                    # Next.js App Router（UI・ルーティング）
│   ├── api/contact/        # 問い合わせフォーム API (POST)
│   ├── [id]/page.tsx       # 動的ルート: リダイレクト処理（Server Component）
│   ├── page.tsx            # トップ: サービス説明・他サービスへの導線
│   ├── not-found.tsx       # 404: リンク未検出時の表示
│   ├── layout.tsx
└── lib/                    # ドメイン・インフラ層
    ├── redirectService.ts  # リダイレクト先取得・クリック/アクセス日時記録
    ├── emailService.ts    # 問い合わせメール送信（Gmail API）
    └── firebase-admin.ts  # Firebase Admin 初期化・Firestore 取得
```

- **app**: ルートとページの責務のみ。ビジネスロジックは `lib` に委譲。
- **lib**: Firestore のコレクション名やフィールド操作を集約。`firebase-admin` の初期化は `firebase-admin.ts` に限定し、他モジュールは `getFirestore()` 経由でのみ利用。
- **scripts**: セットアップ・メンテナンス用スクリプト。`pnpm gmail:token` で Gmail のリフレッシュトークンを取得。

---

## セットアップ

```bash
pnpm install
cp .env.example .env
# .env に FIREBASE_SERVICE_ACCOUNT_KEY および Gmail API 用の変数を設定
pnpm dev
```

**Firebase App Hosting + Secret Manager** で本番デプロイする場合は [docs/APP_HOSTING_SECRETS.md](docs/APP_HOSTING_SECRETS.md) を参照。

### Gmail API（問い合わせフォーム）関連

- 初回セットアップ: [docs/GMAIL_API_SETUP.md](docs/GMAIL_API_SETUP.md) を参照
- **リフレッシュトークンの再取得**: トークンが失効した場合など、`pnpm gmail:token` を実行。ブラウザで認可後、出力されたトークンを `.env` および Secret Manager の `GMAIL_REFRESH_TOKEN` に登録する

---

## 開発中の注意

本番デプロイ前に以下を確認すること。

- `app/[id]/page.tsx`: `record404Error` のコメントアウトを外す
