import { google } from "googleapis";

// 「OAuth2クラスのインスタンス」と「リフレッシュトークン」を用いてアクセストークンを取得しに行く
function createOAuth2Client() {
	const clientId = process.env.GMAIL_CLIENT_ID;
	const clientSecret = process.env.GMAIL_CLIENT_SECRET;
	const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

	if (!clientId || !clientSecret || !refreshToken) {
		return null;
	}

	// Google Auth Library の OAuth2 クラスをインスタンス化
	const oauth2Client = new google.auth.OAuth2(
		clientId,
		clientSecret,
	// 通常はここでユーザー認証させ、このインスタンスを元にアクセストークンを取得
		"http://localhost" // ユーザー認証後に遷移ページを指定（URI）
	);

	// インスタンスにリフレッシュトークンを注入し、APIが叩かれた際にアクセストークンが未取得・失効中であれば自動で(再)取得できる状態にする
	oauth2Client.setCredentials({ refresh_token: refreshToken });
	// アクセストークンを取得・保持する機能のあるインスタンスを返す
	return oauth2Client;
}

// RFC 2822 形式のメールを base64url エンコードする
function encodeMessage(from: string, to: string, subject: string, body: string): string {
	const encodedSubject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
	const messageParts = [
		`From: ${from}`,
		`To: ${to}`,
		`Subject: ${encodedSubject}`,
		"Content-Type: text/plain; charset=utf-8",
		"MIME-Version: 1.0",
		"",
		body,
	];
	const message = messageParts.join("\r\n");

	return Buffer.from(message)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

// Gmail API でメールを送信
export async function sendContactEmail(params: {
	body: string;
	referer?: string | null;
	ip?: string;
}): Promise<{ ok: boolean; error?: string }> {
	const auth = createOAuth2Client();
	const from = process.env.GMAIL_USER;
	const to = process.env.CONTACT_EMAIL_TO;

	if (!auth || !from || !to) {
		return { ok: false, error: "メール送信の設定が不足しています" };
	}

	const body = params.body.trim();
	if (!body) {
		return { ok: false, error: "本文が空です" };
	}

	try {
		// サービスオブジェクトの生成
		const gmail = google.gmail({ version: "v1", auth });

		const textBody = [
			"【報告内容】",
			body,
			"",
			params.referer ? `【アクセス元URL】\n${params.referer}` : "",
			params.ip ? `【IPアドレス】\n${params.ip}` : "",
		]
			.filter(Boolean)
			.join("\n");
		
		const raw = encodeMessage(
			`link.cypass.net <${from}>`,
			to,
			"[link.cypass.net] URLが開けないという報告",
			textBody
		);

		// メール送信APIを叩き、oauth2Clientによってアクセストークンが処理中で自動解決（取得・更新）され使用される
		await gmail.users.messages.send({
			userId: "me",
			requestBody: { raw },
		});

		return { ok: true };
	} catch (e) {
		const message = e instanceof Error ? e.message : "メール送信に失敗しました";
		return { ok: false, error: message };
	}
}
