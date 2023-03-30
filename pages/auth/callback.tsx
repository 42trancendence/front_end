import { isTwoFactorAuthEnabled } from "@/utils/Authentication";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AuthCallback({token}: {token?:string}) {
	const router = useRouter();

	useEffect(() => {
		if (token) {
			localStorage.setItem("token", token as string);
			router.push("/signup");
		} else {
			router.push("/");
		}
	}, [token, router]);

	return <div>Authenticating...</div>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const authHeader = context.req.headers.authorization;
	if (authHeader) {
		const token = authHeader.split(" ")[1];
		const isValidated2fa = await isTwoFactorAuthEnabled(token);
		if (isValidated2fa) {
			return {
				redirect: {
					destination: "/lobby/overview",
					permanent: false,
				},
			};
		} else {
			return {
				props: {
					token,
				},
			};
		}
	} else {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}
};
