# CyPass Link Service

デプロイ情報：[https://link.cypass.net](https://link.cypass.net)
リダイレクト例：[https://link.cypass.net/EQrE4sfZNy0XzOrE8DWU](https://link.cypass.net/EQrE4sfZNy0XzOrE8DWU)

---

Next.jsを採用し、`/{id}` で Firestore に登録した URL へ転送し、クリック数・アクセス日時を記録します。
受託のクライアント向けプレビューリンク共有用で、独自ドメインで信頼感を出しつつ、遷移先は DB の更新だけで差し替えられます。

---

## 技術スタック

| 分類 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| データベース | Firebase Firestore |
| 認証・接続 | Firebase Admin SDK（サーバーサイドのみ） |

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
src/
├── app/                    # Next.js App Router（UI・ルーティング）
│   ├── [id]/page.tsx       # 動的ルート: リダイレクト処理（Server Component）
│   ├── page.tsx            # トップ: サービス説明・他サービスへの導線
│   ├── not-found.tsx       # 404: リンク未検出時の表示
│   ├── layout.tsx
└── lib/                    # ドメイン・インフラ層
    ├── redirectService.ts  # リダイレクト先取得・クリック/アクセス日時記録
    └── firebase-admin.ts    # Firebase Admin 初期化・Firestore 取得
```

- **app**: ルートとページの責務のみ。ビジネスロジックは `lib` に委譲。
- **lib**: Firestore のコレクション名やフィールド操作を集約。`firebase-admin` の初期化は `firebase-admin.ts` に限定し、他モジュールは `getFirestore()` 経由でのみ利用。

---

## セットアップ

```bash
pnpm install
cp .env.example .env
# .env に FIREBASE_SERVICE_ACCOUNT_KEY を設定
pnpm dev
```
