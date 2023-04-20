import Layout from "@/components/Layout";
import Image from "next/image";
import DefaultAvatar from "@/public/default_avatar.svg";
import ProfileBackground from "@/public/profile_background.jpg";
import { NormalButton } from "@/components/ui/NormalButton";
import CloseButton from "@/components/ui/CloseButton"
import OpenButton from "@/components/ui/OpenButton"
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

const ChatRooms: NextPageWithLayout = () => {
	const [username, setUsername] = useState("");
	const [avatar, setavatarUrl] = useState(DefaultAvatar);
	const [userData, setuserData] = useState({});
	const [name, setName] = useState('');
	const [isPrivate, setIsPrivate] = useState(false);
	const [password, setPassword] = useState('');
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

	function showChatRoomList(data: any)
	{
		console.log("chatrooms data : ", data)
	}

	const { socket } = useContext(ChatSocketContext);
	useEffect(() => {
		if (socket) {
			console.log("socket connected!");
		}
	}, [socket]);


	socket?.on("showChatRoomList", function(data) {
		setChatRooms(data);
		showChatRoomList(data);
	})

	const createChatRoom = () => {
		socket?.emit('createChatRoom', {
		name,
		isPrivate: String(isPrivate),
		password
		})
		socket?.on('error', (error) => {
			console.log(error); // 서버에서 전달된 에러 메시지 출력
		  });
		router.push(`/lobby/chat/${name}`);
		setShowCreateRoomPopup(false);
	  };
	

	return (
		<div className="relative flex flex-1 flex-col gap-4">

			<p className="text-4xl text-left text-[#939efb]">나의 채팅방 목록</p>
			<div className="flex grid gird-rows w-8/9 h-[774px] rounded-[14px] bg-[#616161] gap-5 ">
				<div className="flex w-5/6 h-[40px] my-4 grid rounded-[15px] bg-[#3a3a3a] grid-cols-1 gap-8 justify-self-center">
					<div className="flex divide-x-4 divide-zinc-400 content-start">
						<div className="flex w-1/4 flex-col items-center justify-center text-sm">
						<p className="text-[#bbc2ff]">채팅방 이름</p>
						</div>
						<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-sm">
						<p className="text-[#bbc2ff]">방장 닉네임</p>
						</div>
						<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-sm">
						<p className="text-[#bbc2ff]">공개 채널</p>
						</div>
						<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-sm">
						<p className="text-[#bbc2ff]">4명</p>
						</div>
					</div>
				</div>
				{chatRooms.map((room) => (
					<div className="flex divide-x-4 divide-zinc-400">
						<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-sm">
							<p className="text-[#bbc2ff]">{room.name}</p>
						</div>
						<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-sm">
							<p className="text-[#bbc2ff]">{room.owner || '---'}</p>
						</div>
						<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-sm">
							<p className="text-[#bbc2ff]">{room.isPrivate ? '비공개' : '공개'}</p>
						</div>
					</div>
					))}
			</div>
			<div className="absolute bottom-5 right-8 ...">
				<div className="flex -mt-12 w-24 flex-col items-center justify-center space-y-3 text-sm">
					{!showCreateRoomPopup && <OpenButton onClick={() => setShowCreateRoomPopup(true)} />}
					{showCreateRoomPopup && <CloseButton onClick={() => setShowCreateRoomPopup(false)} />}
					{showCreateRoomPopup && (
						<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 grid w-60 rounded bg-zinc-800 shadow-neumreverse">
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="bg-black text-white px-3 py-2 rounded-md mb-3"
							/>
							<input
								type="checkbox"
								checked={isPrivate}
								onChange={() => setIsPrivate(prevState => !prevState)}
								className="mb-3"
							/>
							{isPrivate && (
								<input
								type="text"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="bg-black text-white px-3 py-2 rounded-md mb-3"
								/>
							)}
						<button onClick={createChatRoom}>생성</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// export const joinChatRoom = (roomName: string, roomSocket: Socket): any => {
// 	roomSocket.emit('enterChatRoom', roomName);
// 	return ();
//   };

ChatRooms.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
			<ChatSocketProvider isOpen={true}>
				<Layout>{page}</Layout>
			</ChatSocketProvider>
		</SocketProvider>
	);
};

export default ChatRooms;