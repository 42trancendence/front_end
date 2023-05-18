import Layout from "@/components/Layout";
import Image from "next/image";
import DefaultAvatar from "@/public/default_avatar.svg";
import ProfileBackground from "@/public/profile_background.jpg";
import { NormalButton } from "@/components/ui/NormalButton";
import { Fragment, ReactElement, useContext, useEffect, useState } from "react";
import { handleRefresh } from "@/lib/auth-client";
import { SocketContext, SocketProvider } from "@/lib/socketContext";
import { NextPageWithLayout } from "../_app";
import OverviewSkeleton from "@/components/ui/OverviewSkeleton";
import router from "next/router";
import Seo from "@/components/Seo";
import EditProfilePallet from "@/components/EditProfilePallet";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import usePersistentState from "@/components/canvas/usePersistentState";
import moment from "moment";
import { NotifyContext } from "@/lib/notifyContext";
import {
	useUsersDispatch,
	useUsersState,
	getUser,
	refetchUser,
} from "@/lib/userContext";
import Achievements from "@/components/Achievements";
import { Menu, Switch, Transition } from "@headlessui/react";
import clsx from "clsx";
import Loading from "@/components/ui/Loading";
import MiniLoading from "@/components/ui/MiniLoading";

interface GameHistory {
	createAt: string;
	player1Score: number;
	player2Score: number;
	winnerName: string;
	loserName: string;
}

const OverView: NextPageWithLayout = () => {
	const state = useUsersState();
	const dispatch = useUsersDispatch();
	const { data: user, loading: isUserDataLoaded, error } = state.user;

	const [username, setUsername] = useState("");
	const [avatar, setavatarUrl] = useState(DefaultAvatar);
	const [is2faEnabled, setis2faEnabled] = useState(false);
	const [is2favalidating, setis2favalidating] = useState(false);
	const [isEditOpen, setisEditOpen] = useState(false);
	const [isProfileChanged, setisProfileChanged] = useState(false);
	const [isAchievementsOpen, setisAchievementsOpen] = useState(false);
	const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
	const [rating, setRating] = useState(0);
	const [winRate, setWinRate] = useState(0);
	const [loseRate, setloseRate] = useState(0);


	// const [startGame, setStartGame] = usePersistentState("startGame", false);
	const [match, setMatch] = useState("자동 매칭");

	// user 정보 가져오기
	useEffect(() => {
		setUsername(user.name);
		setavatarUrl(user.avatarImageUrl);
		setis2faEnabled(user.isTwoFactorEnable);
	}, [user]);

	// console.log(userData);
	useEffect(() => {
		refetchUser(dispatch);
	}, [isProfileChanged, dispatch]);

	const toggle2fa = async () => {
		try {
			setis2favalidating(true);
			const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/users/me/2fa`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			if (res.ok) {
				const userData = await res.json();
				console.log(userData);
				setis2faEnabled(userData.is2FAEnabled);
				setis2favalidating(false);
			} else if (res.status === 401) {
				// Unauthorized, try to refresh the access token
				const newAccessToken = await handleRefresh();
				if (!newAccessToken) {
					router.push("/");
				}
				toggle2fa();
			} else {
				setis2favalidating(false);
				return null;
			}
		} catch (error) {
			setis2favalidating(false);
			console.log(error);
		}
	};

	useEffect(() => {
		let accessToken = localStorage.getItem("token");

		const getGameHistory = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/users/history/me`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				});
				if (res.ok) {
					const historyData = await res.json();

					console.log(historyData);

					if (historyData.gameHistory[0].status != 'end') {
						router.push(`/lobby/game/${historyData.gameHistory[0].roomId}`);
					}

					setRating(historyData.user.rating);
					setWinRate(historyData.countWinLose.win);
					setloseRate(historyData.countWinLose.lose);
					setGameHistory(historyData.gameHistory);

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
				console.log(error);
			}
		};
		getGameHistory();
	}, []);

	const { friendSocket, gameSocket } = useContext(SocketContext);
	useEffect(() => {
		if (friendSocket) {
			friendSocket.emit("updateActiveStatus", 1);
		}
	}, [friendSocket]);

	const { successed, failed } = useContext(NotifyContext);
	function failedMatching() {
		failed({
			header: "매칭 요청",
			type: "global",
			message: "매칭요청을 실패하였습니다.",
		});
	}

	// socketio 로 게임방 목록 요청
	useEffect(() => {
		if (gameSocket) {
			gameSocket.emit("isMatching");
			gameSocket.on("isMatching", (data: string) => {
				setMatch('매칭 중');
			});

			gameSocket.on('failedMatching', (data: string) => {
				failedMatching();
				setMatch('자동 매칭');
			});
		}

		return () => {
			if (gameSocket) {
				gameSocket.off('isMatching');
				gameSocket.off('failedMatching');
			}
		}
	}, [gameSocket, setMatch]);

	// socketio 로 자동 매칭 요청
	const handleMatching = () => {
		if (gameSocket) {
			if (match == '자동 매칭') {
				gameSocket.emit('postMatching');
				setMatch('매칭 중');
			} else {
				gameSocket.emit('postCancelMatching');
				setMatch('자동 매칭');
			}
		}
	}

	return (
		<>
			<Seo title="Overview" />
			<Achievements
				isOpen={isAchievementsOpen}
				setIsOpen={setisAchievementsOpen}
			/>
			<EditProfilePallet
				isOpen={isEditOpen}
				setIsOpen={setisEditOpen}
				setisProfileChanged={setisProfileChanged}
			/>
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
				{isUserDataLoaded ? (
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
								<p className="font-orbitron text-white">{username}</p>
							</div>
						</div>
						<div className="ml-auto flex gap-2 divide-x divide-zinc-400">
							<div className="flex w-24 flex-col items-center justify-center space-y-3 font-orbitron text-sm">
								<p className="text-xs text-zinc-400">rating</p>
								<p className="text-lg font-semibold">{rating}</p>
							</div>
							<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
								<Menu as="div">
									<Menu.Button className="text-md inline-flex items-center justify-center gap-2 whitespace-nowrap rounded bg-white px-4 py-2.5 text-zinc-800 shadow outline-offset-2 transition active:transition-none">
										Edit
									</Menu.Button>
									<Transition
										as={Fragment}
										enter="transition ease-out duration-100"
										enterFrom="transform opacity-0 scale-95"
										enterTo="transform opacity-100 scale-100"
										leave="transition ease-in duration-75"
										leaveFrom="transform opacity-100 scale-100"
										leaveTo="transform opacity-0 scale-95"
									>
										<Menu.Items className="absolute right-4 z-10 mt-2 w-48 origin-top-right rounded bg-zinc-950 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
											<div>
												<Menu.Item>
													{({ active }) => (
														<button
															className={clsx(
																active
																	? "bg-gray-100 text-gray-700"
																	: "text-white",
																"block w-full rounded-t px-4 py-2 text-sm"
															)}
															onClick={() => setisEditOpen(true)}
														>
															유저 정보 수정
														</button>
													)}
												</Menu.Item>
												<Menu.Item>
													<div className="flex items-center px-4 py-4">
														<Switch
															checked={is2faEnabled}
															onChange={() => {
																if (!is2favalidating) {
																	toggle2fa();
																}
															}}
															className={clsx(
																is2faEnabled ? "bg-green-600" : "bg-gray-200",
																"relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
															)}
														>
															{is2favalidating && <MiniLoading />}
															<span
																aria-hidden="true"
																className={clsx(
																	is2faEnabled
																		? "translate-x-5"
																		: "translate-x-0",
																	"pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
																)}
															/>
														</Switch>
														<span className="ml-3 font-medium text-zinc-200">
															2FA 인증 활성화
														</span>
													</div>
												</Menu.Item>
											</div>
										</Menu.Items>
									</Transition>
								</Menu>
							</div>
						</div>
					</div>
				)}
				<div className="flex h-full w-full flex-col items-center px-8 py-6">
				{/* 자동 매칭 버튼 */}
				<button onClick={handleMatching} type="button" className="flex flex-col items-center justify-center w-full bg-zinc-900 hover:bg-zinc-700 shadow rounded-lg py-6 mt-8 text-xl font-bold">
					{match}
				</button>
				{/* 내 전적 목록 */}
				{gameHistory.length == 0 ? (

				<div className="mt-8 flex flex-grow flex-col items-center justify-center rounded-lg border border-zinc-500 px-6 py-14 text-center text-sm sm:px-14">
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
				<div className="container mx-auto py-6">
					<div className="text-2xl font-extrabold text-indigo-400 mb-4">
						최근 전적
					</div>
					<div className="grid grid-cols-1 gap-4 rounded-lg bg-zinc-600 p-5">
						<div className="flex divide-x-4 divide-zinc-400 content-start">
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
						{gameHistory.map((room: any, index: number) => {
							const date = moment(room.createAt);
							const formattedDateTime = date.format(`YYYY-MM-DD HH:mm`);

							return (
								<div key={index} className="bg-zinc-800 text-white p-4 rounded-lg shadow">
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
		</div>
		</>
	);
};

OverView.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
			<Layout>{page}</Layout>
		</SocketProvider>
	);
};

export default OverView;
