import { getClientIp } from "@/lib/getClientIp";
import { BLOCKED_MESSAGE, isIpBlocked } from "@/lib/redirectService";
import "./not-found.scss";
import { ReportForm } from "./ReportForm";

export default async function NotFound() {
	const ip = await getClientIp();
	const blocked = await isIpBlocked(ip);

	return (
		<div className="not-found">
			<div className="not-foundContent">
				<h2 className="not-foundContentTitle">このリンクは使えません</h2>
				{blocked && (
					<p className="not-foundContentBlockedReason">{BLOCKED_MESSAGE}</p>
				)}
				<ReportForm />
			</div>
		</div>
	);
}
