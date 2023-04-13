import Layout from "@/components/Layout";
import Image from "next/image";
import DefaultAvatar from "@/public/default_avatar.svg";
import ProfileBackground from "@/public/profile_background.jpg";
import { NormalButton } from "@/components/ui/NormalButton";
import { ReactElement, useContext, useEffect, useState } from "react";
import { handleRefresh } from "@/lib/auth-client";
import {
	ChatSocketContext,
	ChatSocketProvider,
	SocketContext,
	SocketProvider,
} from "@/lib/socketContext";
import { NextPageWithLayout } from "@/pages/_app";

const ChatRooms: NextPageWithLayout = () => {
	const [username, setUsername] = useState("");
	const [avatar, setavatarUrl] = useState(DefaultAvatar);
	const [userData, setuserData] = useState({});

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

	const { socket } = useContext(SocketContext);
	useEffect(() => {
		if (socket) {
			socket.emit("updateActiveStatus", 2);
		}
	}, [socket]);

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
		</div>
	);
};

ChatRooms.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
			<ChatSocketProvider>
				<Layout>{page}</Layout>
			</ChatSocketProvider>
		</SocketProvider>
	);
};

export default ChatRooms;
