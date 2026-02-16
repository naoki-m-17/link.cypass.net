import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/emailService";

export async function POST(request: NextRequest) {
	// パース
	const formData = await request.formData();
	// 本文取得
	const body = formData.get("inquiry");
	// アクセス元URLの取得
	const referer = request.headers.get("referer");

	if (typeof body !== "string") {
		return NextResponse.json(
			{ ok: false, error: "入力内容が不正です" },
			{ status: 400 }
		);
	}

	const result = await sendContactEmail({
		body,
		referer,
	});

	if (!result.ok) {
		return NextResponse.json(
			{ ok: false, error: result.error },
			{ status: 500 }
		);
	}

	return NextResponse.json({ ok: true });
}
