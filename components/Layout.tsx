import { checkIsLoggedIn, isTwoFactorAuthEnabled } from "@/utils/Authentication";
import { useRouter } from "next/router";
import { useState, useEffect, useLayoutEffect } from "react";
import NavBar from "./NavBar";
import Loading from "./ui/Loading";

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
					alert("2FA 인증이 필요합니다.");
					router.push("/");
				}
				else {
					setLoading(false);
				}
			}

		};

		checkLoginStatus();
	}, [router]);

	return (
		<>
			{loading ? (
				<>
					<Loading />
				</>
			) : (
				<div className="flex bg-zinc-800 text-white">
					<NavBar />
					<div className="relative flex flex-1 w-full py-6 px-8">
						{pageProps}
						{children}
					</div>
				</div>
			)}
		</>
	);
}
