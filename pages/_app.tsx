import Loading from "@/components/ui/Loading";
import { SocketProvider } from "@/lib/socketContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		const start = () => {
			console.log("start");
			setLoading(true);
		};
		const end = () => {
			console.log("findished");
			setLoading(false);
		};
		router.events.on("routeChangeStart", start);
		router.events.on("routeChangeComplete", end);
		router.events.on("routeChangeError", end);
		return () => {
			router.events.off("routeChangeStart", start);
			router.events.off("routeChangeComplete", end);
			router.events.off("routeChangeError", end);
		};
	}, [router]);
	return (
		<>
			{loading ? (
				<Loading />
			) : (
				<SocketProvider>
					<Component {...pageProps} />
				</SocketProvider>
			)}
		</>
	);
}
