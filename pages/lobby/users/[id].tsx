import Layout from "@/components/Layout";
import Image from "next/image";
import DefaultAvatar from "@/public/default_avatar.svg";
import ProfileBackground from "@/public/profile_background.jpg";
import { ReactElement, useContext, useEffect, useState } from "react";
import { handleRefresh } from "@/lib/auth-client";
import {
	SocketContext,
	SocketProvider,
} from "@/lib/socketContext";
import { NextPageWithLayout } from "../../_app";
import OverviewSkeleton from "@/components/ui/OverviewSkeleton";
import { useRouter } from "next/router";
import Seo from "@/components/Seo";
import moment from "moment";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface GameHistory {
	createAt: string;
	player1Score: number;
	player2Score: number;
	winnerName: string;
	loserName: string;
}

const UserInfo: NextPageWithLayout = () => {
	const [username, setUsername] = useState("");
	const [avatar, setavatarUrl] = useState(DefaultAvatar);
	const [userData, setuserData] = useState({});
	const [isEditOpen, setisEditOpen] = useState(false);
	const [isUserDataLoaded, setisUserDataLoaded] = useState(false);
	const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
	const [rating, setRating] = useState(0);
	const [winRate, setWinRate] = useState(0);
	const [loseRate, setloseRate] = useState(0);

	const router = useRouter();
	const { id } = router.query;

	// user 정보 가져오기
	useEffect(() => {
		let accessToken = localStorage.getItem("token");

		const getUser = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/users/history/${id}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				});
				if (res.ok) {
					const userData = await res.json();
					setUsername(userData.user.name);
					setavatarUrl(userData.user.avatarImageUrl);
					setRating(userData.user.rating);
					setWinRate(userData.countWinLose.win);
					setloseRate(userData.countWinLose.lose);
					setGameHistory(userData.gameHistory);
					setisUserDataLoaded(true);
					return userData;
				} else if (res.status === 401) {
					// Unauthorized, try to refresh the access token
					const newAccessToken = await handleRefresh();
					if (!newAccessToken) {
						router.push("/");
					}
					getUser();
				} else {
					return null;
				}
			} catch (error) {
				// console.log(error);
			}
		};
		getUser();
	}, [username, router, id]);

	useEffect(() => {
		let accessToken = localStorage.getItem("token");

		const getGameHistory = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/users/game-history`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				});
				if (res.ok) {
					const historyData = await res.json();

					// console.log(historyData);

					setGameHistory(historyData);

					return historyData;
				} else if (res.status === 401) {
					// Unauthorized, try to refresh the access token
					const newAccessToken = await handleRefresh();
					if (!newAccessToken) {
						router.push("/");
					}
					getGameHistory();
				} else {
					return null;
				}
			} catch (error) {
				// console.log(error);
			}
		};
		getGameHistory();
	}, [router]);

	const { friendSocket } = useContext(SocketContext);
	useEffect(() => {
		if (friendSocket) {
			friendSocket.emit("updateActiveStatus", 1);
		}
	}, [friendSocket]);

	return (
		<>
			<Seo title="UserInfo" />
			<div className="relative flex flex-1 flex-col">
				<div>
					<Image
						className="h-48 w-full rounded-lg object-cover brightness-95 drop-shadow lg:h-56"
						src={ProfileBackground}
						alt=""
					/>
				</div>
				<div className="-mt-12 flex space-x-5 self-center sm:-mt-16">
					<div className="z-20 flex">
						<Image
							className="h-24 w-24 rounded-full bg-zinc-800 shadow ring-8 ring-zinc-800 sm:h-32 sm:w-32"
							src={avatar}
							alt=""
							width={300}
							height={300}
						/>
					</div>
				</div>
				{!isUserDataLoaded ? (
					<OverviewSkeleton /> // 로딩중일때
				) : (
					<div className="z-10 -mt-6 grid w-full grid-cols-1 gap-3 self-center rounded bg-zinc-800 p-6 text-center shadow-neumreverse sm:w-3/4 lg:grid-cols-3">
						<div className="flex divide-x divide-zinc-400">
							<div className="flex w-24 flex-col items-center justify-center space-y-3 font-orbitron text-sm">
								<p className="text-zinc-200">Total</p>
								<p className="text-lg font-semibold">{winRate+loseRate}</p>
							</div>
							<div className="flex w-24 flex-col items-center justify-center space-y-3 font-orbitron text-sm">
								<p className="text-zinc-200">Win</p>
								<p className="text-lg font-semibold">{winRate}</p>
							</div>
							<div className="flex w-24 flex-col items-center justify-center space-y-3 font-orbitron text-sm">
								<p className="text-zinc-200">Lose</p>
								<p className="text-lg font-semibold">{loseRate}</p>
							</div>
						</div>
						<div className="m-auto flex">
							<div className="text-2xl font-bold">
								<p className="text-white">{username}</p>
							</div>
						</div>
						<div className="ml-auto gap-2 flex divide-x divide-zinc-400">
							<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
								<p className="text-xs text-zinc-400">rating</p>
								<p className="text-lg font-semibold">{rating}</p>
							</div>
							<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm"></div>
						</div>
					</div>
				)}
{/* 내 전적 목록 */}
{gameHistory.length == 0 ? (
							<div className="mt-8 w-full flex flex-grow flex-col items-center justify-center rounded-lg border border-zinc-500 px-6 py-14 text-center text-sm sm:px-14">
								<ExclamationCircleIcon
									type="outline"
									name="exclamation-circle"
									className="mx-auto h-6 w-6 text-gray-400"
								/>
								<p className="mt-4 font-semibold text-zinc-400">
									전적이 존재하지 않습니다.
								</p>
								<p className="mt-2 text-zinc-500">
									게임을 플레이 하여 전적을 확인할 수 있습니다!
								</p>
							</div>
						) : (
							<div className="mt-2 container mx-auto py-6">
								<div className="mb-4 text-2xl font-extrabold text-indigo-400">
									최근 전적
								</div>
								<div className="grid grid-cols-1 gap-4 rounded-lg bg-zinc-600 p-5">
									<div className="flex content-start divide-x-4 divide-zinc-400">
										<div className="flex w-1/3 flex-col items-center justify-center text-base">
											<p className="text-[#bbc2ff]">날짜</p>
										</div>
										<div className="flex w-1/5 flex-col items-center justify-center space-y-3 text-base">
											<p className="text-[#bbc2ff]">승자 이름</p>
										</div>
										<div className="flex w-1/5 flex-col items-center justify-center space-y-3 text-base">
											<p className="text-[#bbc2ff]">승자 점수</p>
										</div>
										<div className="flex w-1/5 flex-col items-center justify-center space-y-3 text-base">
											<p className="text-[#bbc2ff]">패자 이름</p>
										</div>
										<div className="flex w-1/5 flex-col items-center justify-center space-y-3 text-base">
											<p className="text-[#bbc2ff]">패자 점수</p>
										</div>
									</div>
									{gameHistory.map((room, index) => {
										const date = moment(room.createAt);
										const formattedDateTime = date.format(
											"YYYY-MM-DD HH:mm:ss"
										);

										return (
											<div
												key={index}
												className="rounded-lg bg-zinc-800 p-4 text-white shadow"
											>
												<div className="flex divide-x-4 divide-zinc-800">
													<div className="flex w-1/3 flex-col items-center justify-center space-y-3 text-base">
														<p className="font-bold">{formattedDateTime}</p>
													</div>
													<div className="flex w-1/5 flex-col items-center justify-center space-y-3 text-base">
														<p className="font-bold">{room.winnerName}</p>
													</div>
													<div className="flex w-1/5 flex-col items-center justify-center space-y-3 text-base">
														<p className="font-bold">{room.player1Score}</p>
													</div>
													<div className="flex w-1/5 flex-col items-center justify-center space-y-3 text-base">
														<p className="font-bold">{room.loserName}</p>
													</div>
													<div className="flex w-1/5 flex-col items-center justify-center space-y-3 text-base">
														<p className="font-bold">{room.player2Score}</p>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						)}
			</div>
		</>
	);
};

UserInfo.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
			<Layout>{page}</Layout>
		</SocketProvider>
	);
};

export default UserInfo;
