#!/usr/bin/env node
// シバン：このファイルを直接実行した際、OS が node で実行するよう指定

// Gmail API 用のリフレッシュトークンを取得するスクリプト

// 使用手順:
// 1. Google Cloud Console で Gmail API を有効化
// 2. OAuth 2.0 クライアント ID を作成（アプリケーションの種類: デスクトップアプリ）
//    （- リダイレクト URI に http://localhost:3456 を追加 ← デスクトップアプリの場合は自動設定されて不要かも）
// 3. クライアント ID とシークレットを .env に設定
// 4. このスクリプトを実行: node scripts/get-gmail-refresh-token.mjs
// 5. ブラウザが開くので認可する
// 6. 表示された refresh_token を Secret Manager の GMAIL_REFRESH_TOKEN に登録

import { createServer } from "node:http";
import { config } from "dotenv";
import { google } from "googleapis";

config({ path: ".env" });

const REDIRECT_URI = "http://localhost:3456";
const SCOPES = [
	"https://www.googleapis.com/auth/gmail.send",
	"https://www.googleapis.com/auth/gmail.compose",
];

async function main() {
	const clientId = process.env.GMAIL_CLIENT_ID;
	const clientSecret = process.env.GMAIL_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		console.error(
			"Error: GMAIL_CLIENT_ID と GMAIL_CLIENT_SECRET を .env に設定してください"
		);
		process.exit(1);
	}

	const oauth2Client = new google.auth.OAuth2(
		clientId,
		clientSecret,
		REDIRECT_URI
	);

	const authUrl = oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: SCOPES,
		prompt: "consent",
	});

	const code = await new Promise((resolve) => {
		const server = createServer((req, res) => {
			const url = new URL(req.url, REDIRECT_URI);
			const code = url.searchParams.get("code");
			const error = url.searchParams.get("error");

			res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
			if (code) {
				res.end(
					"<p>認可完了。ターミナルを確認してください。</p><script>window.close()</script>"
				);
				server.close();
				resolve(code);
			} else if (error) {
				res.end(`<p>エラー: ${error}</p>`);
				server.close();
				resolve(null);
			} else {
				res.end("<p>認可を待っています...</p>");
			}
		});

		server.listen(3456, () => {
			console.log("\nブラウザで認可画面を開いています...\n");
			import("node:child_process").then(({ execSync }) => {
				try {
					execSync(`open "${authUrl}"`, { stdio: "ignore" });
				} catch {
					console.log("以下の URL をブラウザで開いてください:\n");
					console.log(authUrl);
					console.log("");
				}
			});
		});
	});

	if (!code) {
		console.error("\nError: 認可がキャンセルされました。");
		process.exit(1);
	}

	const { tokens } = await oauth2Client.getToken(code);

	if (!tokens.refresh_token) {
		console.error("\nError: リフレッシュトークンが取得できませんでした。");
		console.error("既に認可済みの場合は、Google アカウントの連携アプリから権限を削除し、再実行してください。");
		process.exit(1);
	}

	console.log("\n以下の refresh_token を Secret Manager の GMAIL_REFRESH_TOKEN に登録してください:\n");
	console.log(tokens.refresh_token);
	console.log("");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
