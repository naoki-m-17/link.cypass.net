# CyPass Link Service

（主に、受託開発の依頼をいただいたクライアント様のためのプレビューリンク共有用webアプリです。）

デプロイ情報：[https://link.cypass.net](https://link.cypass.net)  
リダイレクト例：[https://link.cypass.net/EQrE4sfZNy0XzOrE8DWU](https://link.cypass.net/EQrE4sfZNy0XzOrE8DWU)

---

`/{id}` で Firestore に登録した URL へ転送し、クリック数・アクセス日時を記録します。  
独自ドメインで信頼感を出しつつ、遷移先は DB の更新だけで差し替えられます。

- **noindex**: 検索エンジンへのインデックス登録を防ぎ、開発プレビューが公開検索されるのを抑制
- **IPブロック**: 短期間に 404 を多発した IP を自動ブロックし、列挙攻撃・不正アクセスを抑制

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
         │  getClientIp() → isIpBlocked(ip)
         │
         ├─ ブロック済み → notFound() → 404（DB 負荷を抑えて早期遮断）
         │
         │  getRedirectUrl(id)
         ▼
  ③ lib/redirectService.ts  ──►  lib/firebase-admin.ts (FIREBASE_SERVICE_ACCOUNT_KEY で初期化)
         │
         │  Firestore 読取: redirects/{id} から url 取得
         ▼
  ④ url なし → record404Error() → notFound() → 404
               （notFoundLogs 記録、ipErrorCounts 更新、閾値超えで blockedIps 追加）
     url あり → incrementClickCount(id) → Firestore 書込 (clicks++, accessedAt 追加)
             → redirect(url) で 302
         │
         ▼
  ⑤ クライアントは転送先へ
```

リダイレクトと計測は同一リクエスト内で完結し、クライアントでの追加往復は不要。

### Firestore コレクション

| コレクション | 用途 | 備考 |
|-------------|------|------|
| `redirects` | リダイレクト先 URL、クリック数、アクセス日時 | - |
| `notFoundLogs` | 404 発生時のログ | url, timestamp, ip |
| `ipErrorCounts` | IP ごとの 404 発生数 | docId=IP（`.` `:` を `_` に置換）、count, windowStart。閾値超え時にドキュメント削除 |
| `blockedIps` | ブロック済み IP のリスト | docId=IP（同上）、blockedAt, reason |

### ディレクトリ構成

```
scripts/
├── get-gmail-refresh-token.mjs  # Gmail API 用リフレッシュトークン取得（pnpm gmail:token）
src/
├── app/                    # Next.js App Router（UI・ルーティング）
│   ├── api/contact/        # 問い合わせフォーム API (POST)
│   ├── [id]/page.tsx       # 動的ルート: リダイレクト処理（Server Component）
│   ├── page.tsx            # トップ: サービス説明・他サービスへの導線
│   ├── not-found.tsx       # 404: リンク未検出時（ブロック時は理由を表示）
│   └── layout.tsx
└── lib/                    # ドメイン・インフラ層
    ├── redirectService.ts  # リダイレクト、404記録、IPブロック
    ├── getClientIp.ts      # クライアントIP取得（x-forwarded-for / x-real-ip）
    ├── emailService.ts    # 問い合わせメール送信（Gmail API）
    └── firebase-admin.ts  # Firebase Admin 初期化・Firestore 取得
```

- **app**: ルートとページの責務のみ。ビジネスロジックは `lib` に委譲。
- **lib**: Firestore のコレクション名やフィールド操作を集約。`firebase-admin` の初期化は `firebase-admin.ts` に限定し、他モジュールは `getFirestore()` 経由でのみ利用。
- **scripts**: セットアップ・メンテナンス用スクリプト。`pnpm gmail:token` で Gmail のリフレッシュトークンを取得。

---

## IP ブロック

### 動作

- `redirectService.ts` 内の `BLOCK_WINDOW_MINUTES` と `BLOCK_THRESHOLD` で制御
- ウィンドウ内に 404 を閾値回数超えて発生させた IP を `blockedIps` に自動追加
- ブロック済み IP は `/{id}` にアクセスしても有効なリンクを含めすべて 404 となり、Firestore への不要な読み書きを抑える

### 解除方法

Firebase Console → Firestore → `blockedIps` コレクションから該当 IP のドキュメントを削除する。  
（ブロック時に `ipErrorCounts` は削除済みのため、`blockedIps` のみ削除で復旧）

誤ってブロックされたクライアントから問い合わせがあった場合、メールに含まれる IP で `blockedIps` 内のドキュメント（docId は IP の `.` と `:` を `_` に置換した文字列）を検索して削除する。

---

## 開発について

### セットアップ

```bash
pnpm install
cp .env.example .env
# .env に FIREBASE_SERVICE_ACCOUNT_KEY および Gmail API 用の変数を設定
pnpm dev
```

### デプロイ前の確認

- `app/[id]/page.tsx`: `record404Error` のコメントアウトを外す

### Gmail API（問い合わせフォーム）関連

- **リフレッシュトークンの再取得**: トークンが失効した場合など、`pnpm gmail:token` を実行。ブラウザで認可後、出力されたトークンを `.env` および Secret Manager の `GMAIL_REFRESH_TOKEN` に登録する
- 問い合わせメールには **Referer**（アクセス元 URL）と **IP アドレス** が含まれる（ブロック解除時の照合に利用）
