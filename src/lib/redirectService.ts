/**
 * リダイレクト先URLを取得するサービス（Firestore 使用）
 */

import * as admin from "firebase-admin";
import { getFirestore } from "./firebase-admin";

// Firestore のコレクション名
const REDIRECTS_COLLECTION = "redirects";

// リダイレクト先URLを取得
export async function getRedirectUrl(id: string): Promise<string | null> {
  const db = getFirestore();
  if (!db) {
    return null;
  }

  const doc = await db.collection(REDIRECTS_COLLECTION).doc(id).get();
  const url = doc.data()?.url;
  return typeof url === "string" ? url : null;
}

// クリック数の加算、アクセス日時の記録
export async function incrementClickCount(id: string): Promise<void> {
  const db = getFirestore();
  if (!db) {
    return;
  }

  const ref = db.collection(REDIRECTS_COLLECTION).doc(id);
  const now = admin.firestore.Timestamp.now();
  await ref.set(
    {
      clicks: admin.firestore.FieldValue.increment(1),
      accessedAt: admin.firestore.FieldValue.arrayUnion(now),
    },
    { merge: true }
  );
}
