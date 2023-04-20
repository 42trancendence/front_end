import Layout from "@/components/Layout";
import Image from "next/image";
import DefaultAvatar from "@/public/default_avatar.svg";
import { NormalButton } from "@/components/ui/NormalButton";
import CloseButton from "@/components/ui/CloseButton";
import OpenButton from "@/components/ui/OpenButton";
import { ReactElement, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { handleRefresh } from "@/lib/auth-client";
import {
	ChatSocketContext,
	ChatSocketProvider,
	SocketContext,
	SocketProvider,
} from "@/lib/socketContext";
import { NextPageWithLayout } from "@/pages/_app";
import { Socket } from "socket.io-client";

const ChatRoom: NextPageWithLayout = () => {
	const [username, setUsername] = useState("");
	const [showCreateRoomPopup, setShowCreateRoomPopup] = useState(false);
	const [chatRooms, setChatRooms] = useState([]);
	const router = useRouter();

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

	const globalSocket = useContext(SocketContext);
	useEffect(() => {
		globalSocket?.socket?.emit("updateActiveStatus", 2);
	}, [globalSocket.socket]);

	const { socket } = useContext(ChatSocketContext);
	useEffect(() => {
		if (socket) {
			console.log("socket connected!");
		}
	}, [socket]);

	return (
		<>
			<main className="bg-zinc-700 rounded-md w-full px-4 pt-6 pb-4 flex flex-col">
				<div className="flex-1">
					chat content
				</div>
				<div className="flex h-10">
					<textarea className="w-full resize-none rounded text-sm text-zinc-900 placeholder:text-zinc-400" name="comment" id="comment" placeholder="코멘트를 입력해주세요..."></textarea>
					<NormalButton variant="bright" className="ml-2">Send</NormalButton>
				</div>
			</main>
		</>
	);
};

// export const joinChatRoom = (roomName: string, roomSocket: Socket): any => {
// 	roomSocket.emit('enterChatRoom', roomName);
// 	return ();
//   };

ChatRoom.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
			<ChatSocketProvider isOpen={true}>
				<Layout>{page}</Layout>
			</ChatSocketProvider>
		</SocketProvider>
	);
};

export default ChatRoom;
