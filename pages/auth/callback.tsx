import { isTwoFactorAuthEnabled } from "@/utils/Authentication";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AuthCallback({ token, isValidated2fa }: { token?: string, isValidated2fa?: boolean }) {
	const router = useRouter();

	useEffect(() => {
		async function checkLoginStatus() {
		if (token) {
			localStorage.setItem("token", token as string);
			if (isValidated2fa === false) {
				router.push("/lobby/overview");
			}
			else {
				router.push("/2fa");
			}
		} else {
			router.push("/");
		}}
		checkLoginStatus();
	}, [token, isValidated2fa, router]);

	return <div>Authenticating...</div>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const token = context.query.token;
	if (token) {
		const twofaStauts = await isTwoFactorAuthEnabled(token as string);
		if (twofaStauts.status === 200) {
			if (twofaStauts.token !== "") {
				return {
					props: {
						token: "",
						isValidated2fa: true,
					},
				};
			} else {
				return {
					props: {
						token: twofaStauts.token,
						isValidated2fa: false,
					},
				};
			}
		} else if (twofaStauts.status === 500){
			return {
				redirect: {
					destination: "/",
					permanent: false,
				},
			};
		} else {
			return {
				props: {
					token,
					isValidated2fa: false,
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
