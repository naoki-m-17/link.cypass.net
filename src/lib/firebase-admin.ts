import * as admin from "firebase-admin";

let firestore: admin.firestore.Firestore | null = null;

// 環境変数 FIREBASE_SERVICE_ACCOUNT_KEY を取得し、Firebaseに接続
function initializeApp(): void {
	if (admin.apps.length > 0) {
		firestore = admin.firestore();
		return;
	}

	const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
	if (!keyJson) {
		return;
	}

	try {
		const serviceAccount = JSON.parse(keyJson) as admin.ServiceAccount;
		admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
		firestore = admin.firestore();
	} catch {
		// 不正な JSON や鍵の場合は Firestore に接続しない
	}
}

initializeApp();

// Firestore インスタンス。未初期化の場合は null
export function getFirestore(): admin.firestore.Firestore | null {
	return firestore;
}
