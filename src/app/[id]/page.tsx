import { notFound, redirect } from "next/navigation";
import { getRedirectUrl, incrementClickCount } from "@/lib/redirectService";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RedirectPage({ params }: PageProps) {
  const { id } = await params;
  // [id]を元に対応するURLを取得
  const url = await getRedirectUrl(id);

  if (url === null) {
    notFound();
  }

  await incrementClickCount(id);
  redirect(url);
}
