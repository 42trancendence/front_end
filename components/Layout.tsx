import { checkIsLoggedIn, isTwoFactorAuthEnabled } from "@/utils/Authentication";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import NavBar from "./NavBar";

export default function Layout({
	pageProps,
	children,
}: {
	pageProps?: any;
	children: React.ReactNode;
}) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkLoginStatus = async () => {
			// 로그인 상태 확인하는 비동기 함수
			const token = await checkIsLoggedIn();

			if (!token) {
				router.push("/");
			}
			else {
				const isValidated2fa = await isTwoFactorAuthEnabled(token);
				if (isValidated2fa !== 409) {
					router.push("/");
				}
				setLoading(false);
			}

		};

		checkLoginStatus();
	}, [router]);

	return (
		<>
			{loading ? (
				<div>
					<p>Loading...</p>
				</div>
			) : (
				<div className="flex bg-zinc-800 text-white">
					<NavBar />
					<div className="">
						{pageProps}
						{children}
					</div>
				</div>
			)}
		</>
	);
}
