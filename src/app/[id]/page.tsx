import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getClientIp } from "@/lib/getClientIp";
import { getRedirectUrl, incrementClickCount, isIpBlocked, record404Error } from "@/lib/redirectService";

type PageProps = {
	params: Promise<{ id: string }>;
};

// アクセスURLを取得
async function getRequestedUrl(id: string): Promise<string> {
	const headersList = await headers();
	const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "link.cypass.net";
	const proto = headersList.get("x-forwarded-proto") ?? "https";
	return `${proto}://${host}/${id}`;
}

export default async function RedirectPage({ params }: PageProps) {
	const { id } = await params;

	// ブロックチェックを最優先（通信量削減・悪意あるアクセスの早期遮断）
	const ip = await getClientIp();
	if (await isIpBlocked(ip)) {
		notFound();
	}

	const url = await getRedirectUrl(id);

	if (url === null) {
		await record404Error(await getRequestedUrl(id), ip);
		notFound();
	}

	await incrementClickCount(id);
	redirect(url);
}
