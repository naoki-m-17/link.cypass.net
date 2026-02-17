import * as admin from "firebase-admin";
import { getFirestore } from "./firebase-admin";

// Firestore のコレクション名
const REDIRECTS_COLLECTION = "redirects";
const NOT_FOUND_LOGS_COLLECTION = "notFoundLogs";
const IP_ERROR_COUNTS_COLLECTION = "ipErrorCounts";
const BLOCKED_IPS_COLLECTION = "blockedIps";

// 404 連続発生によるブロック設定
const BLOCK_WINDOW_MINUTES = 10; // ← 分間に
const BLOCK_THRESHOLD = 30; // ← 回以上でブロック

// IPをFirestoreのdocId用にサニタイズ
function sanitizeIpForDocId(ip: string): string {
	return ip.replace(/[.:]/g, "_");
}

// link.cypass.net へのリダイレクトを禁止（ループ防止）
function isRedirectToSelf(url: string): boolean {
	try {
		const normalized =
			url.startsWith("http://") || url.startsWith("https://")
				? url
				: `https://${url}`;
		const parsed = new URL(normalized);
		const hostname = parsed.hostname.toLowerCase();
		return (
			hostname === "link.cypass.net" || hostname.endsWith(".link.cypass.net")
		);
	} catch {
		return false;
	}
}

// リダイレクト先URLを取得
export async function getRedirectUrl(id: string): Promise<string | null> {
	const db = getFirestore();
	if (!db) {
		return null;
	}

	const doc = await db.collection(REDIRECTS_COLLECTION).doc(id).get();
	const url = doc.data()?.url;
	if (typeof url !== "string") {
		return null;
	}

	if (isRedirectToSelf(url)) {
		return null;
	}

	return url;
}

// クリック数、アクセス日時の記録
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

// ブロック時の表示（現状は too_many_404 のみ）
export const BLOCKED_MESSAGE =
	"短期間に存在しないリンクへ多数アクセスしたため、アクセスを制限しました。クライアント様の場合の解除は、下記よりお問い合わせください。";

// 指定IPがブロック済みかチェック
export async function isIpBlocked(ip: string): Promise<boolean> {
	const db = getFirestore();
	if (!db || !ip) {
		return false;
	}

	const docId = sanitizeIpForDocId(ip);
	const doc = await db.collection(BLOCKED_IPS_COLLECTION).doc(docId).get();
	return doc.exists;
}

// 404 エラー記録（アクセスURL・タイムスタンプ・IP）、IPごとのエラー数を更新、IPブロック追加
export async function record404Error(
	requestedUrl: string,
	ip: string
): Promise<void> {
	const db = getFirestore();
	if (!db) {
		return;
	}

	const now = admin.firestore.Timestamp.now();
	const docId = sanitizeIpForDocId(ip);

	// notFoundLogs に記録
	await db.collection(NOT_FOUND_LOGS_COLLECTION).add({
		url: requestedUrl,
		timestamp: now,
		ip,
	});

	// IPごとのエラー数を更新
	const countsRef = db.collection(IP_ERROR_COUNTS_COLLECTION).doc(docId);
	const countsDoc = await countsRef.get();
	const data = countsDoc.data();
	const windowMs = BLOCK_WINDOW_MINUTES * 60 * 1000;

	let newCount: number;
	let windowStart: admin.firestore.Timestamp;

	if (!countsDoc.exists || !data) {
		newCount = 1;
		windowStart = now;
	} else {
		const prevWindowStart = data.windowStart as admin.firestore.Timestamp;
		const prevStartMs = prevWindowStart.toMillis();
		if (now.toMillis() - prevStartMs > windowMs) {
			// ウィンドウ経過でリセット
			newCount = 1;
			windowStart = now;
		} else {
			newCount = (data.count ?? 0) + 1;
			windowStart = prevWindowStart;
		}
	}

	await countsRef.set({
		count: newCount,
		windowStart,
	});

	// ブロックリストに追加（ブロック時に ipErrorCounts 削除で、 blockedIps 削除だけで解除可能）
	if (newCount >= BLOCK_THRESHOLD) {
		await db.collection(BLOCKED_IPS_COLLECTION).doc(docId).set({
			blockedAt: now,
			reason: "too_many_404",
		});
		await countsRef.delete();
	}
}
