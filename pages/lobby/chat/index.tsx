import Layout from "@/components/Layout";
import Image from "next/image";
import DefaultAvatar from "@/public/default_avatar.svg";
import ProfileBackground from "@/public/profile_background.jpg";
import { NormalButton } from "@/components/ui/NormalButton";
import { ReactElement, useContext, useEffect, useState } from "react";
import { handleRefresh } from "@/lib/auth-client";
import { SocketContext, SocketProvider } from "@/lib/socketContext";
import { NextPageWithLayout } from "@/pages/_app";
import io from 'socket.io-client';

const socket = io('http://localhost:3000/chat-room');


const ChatRooms: NextPageWithLayout = () => {
	
	const [username, setUsername] = useState("");
	const [avatar, setavatarUrl] = useState(DefaultAvatar);
	const [userData, setuserData] = useState({});
	const [name, setName] = useState('');
	const [isPrivate, setIsPrivate] = useState(false);
	const [password, setPassword] = useState('');
	const [showCreateRoomPopup, setShowCreateRoomPopup] = useState(false);

	// user 정보 가져오기
	useEffect(() => {
		let accessToken = localStorage.getItem("token");

		async function getUser() {
			try {
				const res = await fetch("http://localhost:3000/users/me", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				});
				if (res.ok) {
					const userData = await res.json();
					setUsername(userData.name);
					setavatarUrl(userData.avatar);
					return userData;
				} else if (res.status === 401) {
					// Unauthorized, try to refresh the access token
					await handleRefresh(getUser);
				} else {
					return null;
				}
			} catch (error) {
				console.log(error);
			}
		}
		getUser();
	}, [username]);

	const createChatRoom = () => {
		console.log(name);
		console.log(isPrivate);
		console.log(password);
		socket.emit('createChatRoom', {
		name,
		isPrivate,
		password
		})
		setShowCreateRoomPopup(false);
	  };

	return (
		<div className="relative flex flex-1 flex-col">
			<div>
				<Image
					className="h-48 w-full rounded-lg object-cover lg:h-56"
					src={ProfileBackground}
					alt=""
				/>
			</div>
			<div className="-mt-12 flex space-x-5 self-center sm:-mt-36">
				<div className="z-20 flex">
					<Image
						className="h-24 w-24 rounded-full bg-zinc-800 shadow ring-4 ring-zinc-800 sm:h-32 sm:w-32"
						src={avatar}
						alt=""
						width={300}
						height={300}
					/>
				</div>
			</div>
			<div className="z-10 -mt-6 grid w-3/4 grid-cols-1 gap-3 self-center rounded bg-zinc-800 p-6 shadow-neumreverse lg:grid-cols-3">
				<div className="flex divide-x divide-zinc-400">
					<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
						<p className="text-zinc-400">Total games</p>
						<p className="text-lg font-semibold">100</p>
					</div>
					<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
						<p className="text-zinc-400">Win</p>
						<p className="text-lg font-semibold">50</p>
					</div>
					<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
						<p className="text-zinc-400">Lose</p>
						<p className="text-lg font-semibold">50</p>
					</div>
				</div>
				<div className="m-auto flex">
					<div className="text-2xl font-bold">
						<p className="text-white">{username}</p>
					</div>
				</div>
				<div className="ml-auto flex divide-x divide-zinc-400">
					<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
						<p className="text-zinc-400">Achievement</p>
						<p className="text-lg font-semibold">1</p>
					</div>
					<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
						<NormalButton className="shadow" variant="bright">
							Edit
						</NormalButton>
					</div>
				</div>
			</div>
			<div className="z-0 mt-3 grid w-3/4 grid-cols-1 gap-3 self-center rounded bg-zinc-800 p-60 shadow-neumreverse lg:grid-cols-3">
			</div>
			<div className="absolute bottom-5 right-8 ...">
				<div className="flex -mt-12 w-24 flex-col items-center justify-center space-y-3 text-sm">
					<NormalButton  onClick={() => setShowCreateRoomPopup(true)}
						className="shadow" variant="bright">
						채팅방 생성
					</NormalButton>
					{showCreateRoomPopup && (
						<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 grid w-60 rounded bg-zinc-800 shadow-neumreverse">
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
							<input
								type="checkbox"
								checked={isPrivate}
								onChange={() => setIsPrivate(prevState => !prevState)}
							/>
							{isPrivate && (
								<input
								type="text"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								/>
							)}
						<button onClick={createChatRoom}>생성</button>
						<button onClick={() => setShowCreateRoomPopup(false)}>취소</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

ChatRooms.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
			<Layout>{page}</Layout>
		</SocketProvider>
	);
};

export default ChatRooms;
