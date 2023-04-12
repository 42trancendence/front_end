import Layout from "@/components/Layout";
import Image from "next/image";
import DefaultAvatar from "@/public/default_avatar.svg";
import ProfileBackground from "@/public/profile_background.jpg";
import { NormalButton } from "@/components/ui/NormalButton";
import { useEffect, useState } from "react";
import withSocket from "@/hoc/withSocket";
import { Socket } from "socket.io-client";
import { handleRefresh } from "@/lib/auth-client";

const ChatRooms = ({ pageProps, socket }: { pageProps?: any, socket: Socket }) => {

	const [username, setUsername] = useState("");
	const [avatar, setavatarUrl] = useState(DefaultAvatar);

	// user 정보 가져오기
	useEffect(() => {
		let accessToken = localStorage.getItem('token');

		async function getUser() {
			try {
				const res = await fetch("http://localhost:3000/users/me", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer: ${accessToken}`,
					},
				});
				if (res.ok) {
					const userData = await res.json();
					setUsername(userData.name);
					setavatarUrl(userData.avatar);
					return userData;
				} else if (res.status === 401) { // Unauthorized, try to refresh the access token
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

	// socket.io 테스트
	useEffect(() => {
		// Subscribe to a specific event
		socket.on("my-event", (data) => {
			console.log("Received data from server:", data);
		});

		// Unsubscribe from the event when the component is unmounted
		return () => {
			socket.off("my-event");
		};
	}, [socket]);

	return (
		<Layout pageProps={pageProps}>
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
				<div className="-mt-6 z-10 bg-zinc-800 grid gap-3 lg:grid-cols-3 grid-cols-1 w-3/4 self-center rounded p-6 shadow-neumreverse">
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
					<div className="flex m-auto">
						<div className="text-2xl font-bold">
							<p className="text-white">{username}</p>
						</div>
					</div>
					<div className="flex divide-x divide-zinc-400 ml-auto">
						<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
							<p className="text-zinc-400">Achievement</p>
							<p className="text-lg font-semibold">1</p>
						</div>
						<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
							<NormalButton className="shadow" variant="bright" >
								Edit
							</NormalButton>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default withSocket(ChatRooms)
