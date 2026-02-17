import "./home.scss";

const SERVICES = [
// {
// 	href: "https://cypass.net",
// 	name: "会社HP",
// 	image: "/images/cypass-company.png",
// },
// {
// 	href: "https://naoki.cypass.net",
// 	name: "受託開発事業",
// 	image: "/images/cypass-development.png",
// },
// {
// 	href: "https://knowledge.cypass.net",
// 	name: "ナレッジ",
// 	image: "/images/cypass-knowledge.png",
// },
// {
// 	href: "https://sutekina-omise.com",
// 	name: "ステキなオミセ",
// },
] as const;

export default function HomePage() {
	return (
		<div className="home">
			<section className="homeMain">
				<h1 className="homeMainHeading">CyPass Link Service</h1>
				<p className="homeMainText">弊社にて進行中の受託案件および提携プロジェクトにおける、テスト環境へのアクセスツールです。</p>
			</section>

			{SERVICES.length > 0 && (
				<section className="homeService">
					<h2 className="homeServiceHeading">CyPass Services</h2>
					<div className="homeServiceList">
						{SERVICES.map(({ href, name, image }) => (
							<a
								key={href}
								href={href}
								className="homeServiceListItem"
								target="_blank"
								rel="noopener noreferrer"
							>
								<img
									className="homeServiceListItemImage"
									src={image}
									alt=""
								/>
								<span className="homeServiceListItemName">{name}</span>
							</a>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
