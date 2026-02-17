import { headers } from "next/headers";

/** クライアントIPを取得（x-forwarded-for の先頭、なければ x-real-ip） */
export async function getClientIp(): Promise<string> {
	const headersList = await headers();
	const forwarded = headersList.get("x-forwarded-for");
	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}
	return headersList.get("x-real-ip") ?? "";
}