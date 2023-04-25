import Link from "next/link";
import Image from "next/image";
import logoPic from "@/public/42_Logo.svg";
import Seo from "@/components/Seo";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useEffect, useState } from "react";
import { checkIsLoggedIn } from "@/utils/Authentication";
import { useRouter } from "next/router";
import Loading from "@/components/ui/Loading";

export default function IndexPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	return (
		<>
			{loading ? <Loading /> : (
				<div className="relative h-full isolate overflow-hidden py-32 sm:py-48 lg:py-56 flex">
					<Seo title="Home" />
					<svg
						className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
						aria-hidden="true"
					>
						<defs>
							<pattern
								id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
								width={200}
								height={200}
								x="50%"
								y={-1}
								patternUnits="userSpaceOnUse"
							>
								<path d="M.5 200V.5H200" fill="none" />
							</pattern>
						</defs>
						<rect
							width="100%"
							height="100%"
							strokeWidth={0}
							fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)"
						/>
					</svg>
					<div className="m-auto max-w-7xl flex flex-col items-center justify-center">
						<div className="mx-auto max-w-4xl flex flex-col">
							<Image className="w-20" src={logoPic} alt="42_transcendence" />
							<h1 className="mt-10 text-4xl font-bold tracking-tight text-slate-100 sm:text-6xl">
								온라인 멀티플레이어 Trans-Pong에 오신 것을 환영합니다!
							</h1>
							<p className="mt-6 text-lg leading-8 text-zinc-400">
								Trans-Pong에서 최고의 온라인 Pong 경험을 즐기세요! 전세계의 다른 플레이어들과 경쟁하고, 실력을 키우며, 무한한 재미를 찾으세요. 이제 어디서나, 언제든 함께 Pong을 즐겨보세요!
							</p>
							<div className="mt-10 mx-auto flex items-center gap-x-6">
								<PrimaryButton type="link" link={process.env.NEXT_PUBLIC_AUTH_URL || "#"} text="로그인" />
							</div>
						</div>
					</div>
				</div>
			)}

		</>
	);
}
