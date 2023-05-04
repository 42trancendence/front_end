import Layout from "@/components/Layout";
import Image from "next/image";
import DefaultAvatar from "@/public/default_avatar.svg";
import ProfileBackground from "@/public/profile_background.jpg";
import { NormalButton } from "@/components/ui/NormalButton";
import { ReactElement, useContext, useEffect, useState } from "react";
import { handleRefresh } from "@/lib/auth-client";
import {
	SocketContext,
	SocketProvider,
} from "@/lib/socketContext";
import { NextPageWithLayout } from "../_app";
import OverviewSkeleton from "@/components/ui/OverviewSkeleton";
import router from "next/router";
import Seo from "@/components/Seo";
import EditProfilePallet from "@/components/EditProfilePallet";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Canvas from "@/components/canvas/canvas";
import usePersistentState from "@/components/canvas/usePersistentState";
import { useUsersDispatch, useUsersState, getUser, refetchUser } from "@/lib/userContext";
import { Socket } from "socket.io-client";


const OverView: NextPageWithLayout = () => {
	const state = useUsersState();
	const dispatch = useUsersDispatch();
	const { data: user, loading: isUserDataLoaded, error } = state.user;

	const [username, setUsername] = useState("");
	const [avatar, setavatarUrl] = useState(DefaultAvatar);
	const [isEditOpen, setisEditOpen] = useState(false);
	const [isProfileChanged, setisProfileChanged] = useState(false);
	const [gameHistory, setGameHistory] = useState([]);
	const [onGame, setOnGame] = usePersistentState('onGame', false);
	const [match, setMatch] = useState('자동 매칭');

	// user 정보 가져오기
	useEffect(() => {
		setUsername(user.name);
		setavatarUrl(user.avatarImageUrl);
	}, [user]);

	useEffect(() => {
		refetchUser(dispatch);
	}, [isProfileChanged, dispatch]);

	useEffect(() => {
		let accessToken = localStorage.getItem("token");

		const getGameHistory =  async () => {
			try {
				const res = await fetch("http://localhost:3000/users/game-history", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				});
				if (res.ok) {
					const historyData = await res.json();

					console.log(historyData);

					setGameHistory(historyData);

					return historyData;
				} else if (res.status === 401){
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
		}
		getGameHistory();
	}, []);

	const { friendSocket, gameSocket } = useContext(SocketContext);
	useEffect(() => {
		if (friendSocket) {
			friendSocket.emit("updateActiveStatus", 1);
		}
	}, [friendSocket]);

	// socketio 로 게임방 목록 요청
	useEffect(() => {

		if (friendSocket) {
			// console.log('gameSocket: ', socket);
			friendSocket.on('connect', () => {
				if (friendSocket.recovered) {
					console.log('연결이 복구되었습니다.');
				} else {
					console.log('새로운 연결이 생성되었습니다.');
				}
			})
			// gameSocket.on('getGameHistory', (data: []) => {
			// 	console.log(data);
			// 	setGameHistory(data);
			// })
			friendSocket.on('getMatching', (data1: string, data2: object) => {
				console.log(`getMatching: ${data1}`);
				if (data1 == 'matching')	{
					console.log(data2);
					setOnGame(true);
					setMatch('자동 매칭');
				}	else {
					alert('매칭 실패');
					setMatch('자동 매칭');
				}
			})
			friendSocket.on('postLeaveGame', (data: string) => {
        console.log('getLeaveGame: ', data);
        if (data == 'delete') {
			friendSocket.emit('postLeaveGame');
        } else if (data == 'leave') {
					setOnGame(false);
					friendSocket.emit('getGameHistory');
        }
      })
	  friendSocket.on('finishGame', () => {
				setOnGame(false);
			})
			friendSocket.emit('getGameHistory'); // 이거 삭제 해야 하나?
			}
		}, [friendSocket, setOnGame])

		// socketio 로 자동 매칭 요청
		const handleMatching = () => {
			if (friendSocket) {
				if (match == '자동 매칭') {
					console.log('자동 매칭: ', friendSocket, match)
					friendSocket.emit('postMatching');
					setMatch('매칭 중~~~');
				} else {
					friendSocket.emit('postCancelMatching');
					setMatch('자동 매칭');
				}
			}
		}

	return (
		<>
			<Seo title="Overview" />
			<EditProfilePallet isOpen={isEditOpen} setIsOpen={setisEditOpen} setisProfileChanged={setisProfileChanged} />
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
					<div className="z-10 -mt-6 grid w-full sm:w-3/4 grid-cols-1 gap-3 self-center rounded bg-zinc-800 p-6 text-center shadow-neumreverse lg:grid-cols-3">
						<div className="flex divide-x divide-zinc-400">
							<div className="flex w-24 flex-col items-center justify-center space-y-3 font-orbitron text-sm">
								<p className="text-zinc-200">Total</p>
								<p className="text-lg font-semibold">100</p>
							</div>
							<div className="flex w-24 flex-col items-center justify-center space-y-3 font-orbitron text-sm">
								<p className="text-zinc-200">Win</p>
								<p className="text-lg font-semibold">50</p>
							</div>
							<div className="flex w-24 flex-col items-center justify-center space-y-3 font-orbitron text-sm">
								<p className="text-zinc-200">Lose</p>
								<p className="text-lg font-semibold">50</p>
							</div>
						</div>
						<div className="m-auto flex">
							<div className="text-2xl font-bold">
								<p className="font-orbitron text-white">{username}</p>
							</div>
						</div>
						<div className="ml-auto gap-2 flex divide-x divide-zinc-400">
							<div className="flex w-24 flex-col items-center justify-center space-y-3 font-orbitron text-sm">
								<p className="text-xs text-zinc-200">Achievement</p>
								<p className="text-lg font-semibold">1</p>
							</div>
							<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
								<NormalButton
									className="shadow"
									variant="bright"
									onClick={() => setisEditOpen(true)}
								>
									Edit
								</NormalButton>
							</div>
						</div>
					</div>
				)}
				<button type="button" className="flex flex-col items-center justify-center w-full bg-zinc-900 hover:bg-zinc-700 shadow rounded-lg py-6 mt-8 text-xl font-bold">
					{match}
				</button>
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
			{onGame ? (
			<Canvas></Canvas>
			) : (
				<div className="flex h-full w-full flex-col items-center px-8 py-6">
				{/* 자동 매칭 버튼 */}
				<button onClick={handleMatching} className="bg-zinc-600 w-[50%] font-bold text-xl text-indigo-400 h-20 rounded-lg hover:bg-zinc-400 hover:text-zinc-800" >
					{match}
				</button>
				{/* 내 전적 목록 */}
				<div className="container mx-auto py-6">
					<div className="text-2xl font-extrabold text-indigo-400 mb-4">
						최근 전적
					</div>
					<div className="grid grid-cols-1 gap-4 rounded-lg bg-zinc-600 p-5">
						{/* { gameHistory } */}
						{gameHistory.map((room, index) => (
							<div key={index} className="bg-zinc-800 text-white p-4 rounded-lg shadow">
								<div className="flex justify-between items-center px-10">
									<span>{room.createAt}</span>
									<span>{room.player1Score}</span>
									<span>{room.player2Score}</span>
									<span>{room.winnerName}</span>
									<span>{room.loserName}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			)}
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
