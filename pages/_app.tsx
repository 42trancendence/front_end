import "@/styles/globals.css";
import { GetServerSideProps } from "next";
import type { AppProps } from "next/app";
import { useEffect } from "react";

export default function MyApp(token: string, { Component, pageProps }: AppProps) {
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token as string);
    }
  }, [token]);

	return <Component {...pageProps} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const authHeader = context.req.headers.authorization;
	if (authHeader) {
		const token = authHeader.split(" ")[1];
		return {
			props: {
				token,
			},
		};
	}
  return {
    props: {
      token: "",
    },
  };
};
