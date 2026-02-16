import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getRedirectUrl, incrementClickCount, record404Error } from "@/lib/redirectService";

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
  // [id]を元に対応するURLを取得
  const url = await getRedirectUrl(id);

  if (url === null) {
    await record404Error(await getRequestedUrl(id));
    notFound();
  }

  await incrementClickCount(id);
  redirect(url);
}
