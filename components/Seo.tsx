import Head from "next/head";

export default function Seo({title} : {title: string}) {
	const Title = `${title} | ft_transcendence`;
	return (
		<Head>
			<title>{Title}</title>
		</Head>
	)
}
