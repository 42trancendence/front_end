import Layout from "@/components/Layout";
import Image from "next/image";
import DefaultAvatar from "@/public/default_avatar.svg";
import ProfileBackground from "@/public/profile_background.jpg";
import { NormalButton } from "@/components/ui/NormalButton";
import Loading from "../../../components/ui/Loading";
import CloseButton from "@/components/ui/CloseButton"
import OpenButton from "@/components/ui/OpenButton"
import { ReactElement, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { handleRefresh } from "@/lib/auth-client";
import {
	SocketContext,
	SocketProvider,
} from "@/lib/socketContext";
import { NextPageWithLayout } from "@/pages/_app";

const ChatRooms: NextPageWithLayout = () => {
	const [loading, setLoading] = useState(true);
	const [username, setUsername] = useState("");
	const [avatar, setavatarUrl] = useState(DefaultAvatar);
	const [userData, setuserData] = useState({});
	const [name, setName] = useState('');
	const [isPrivate, setIsPrivate] = useState(false);
	const [password, setPassword] = useState('');
	const [showCreateRoomPopup, setShowCreateRoomPopup] = useState(false);
	const [chatRooms, setChatRooms] = useState([]);
	const router = useRouter();

	// socket 연결
	const { friendSocket, chatSocket } = useContext(SocketContext);
	useEffect(() => {
		friendSocket?.emit("updateActiveStatus", 2);
	}, [friendSocket]);

	function showChatRoomList(data: any)
	{
		console.log("chatrooms data : ", data)
	}

	useEffect(() => {
		const handleRouteChangeStart = (url: string) => {
			if (!url.match(/^\/lobby\/chat(?:\/)?(?:\/.*)?$/)) {
					chatSocket?.emit('leaveChatPage');
					console.log('페이지를 떠납니다.');
				  }
		  };
		chatSocket?.emit("enterChatLobby");
		router.events.on('routeChangeStart', handleRouteChangeStart);
		return () => {
			router.events.off('routeChangeStart', handleRouteChangeStart);
		  };
	}, [chatSocket, router]);

	chatSocket?.on("showChatRoomList", function(data) {
		console.log(data);
		setChatRooms(data);
		setLoading(false);
		showChatRoomList(data);
	})


	function createChatRoomMethod(roomType: string) {
		return new Promise((resolve, reject) => {
		  chatSocket?.emit('createChatRoom', {
			name,
			type: String(roomType),
			password
		  }, (error, response) => {
			if (error) {
			  reject(error);
			} else {
			  resolve(response);
			}
		  });
		  console.log("test");
		});
	  }

	const createChatRoom = () => {

		const roomType = isPrivate === true ? "PROTECTED" : "PUBLIC";
		createChatRoomMethod(roomType)
		.then(chatRoom => {
		  console.log('Created chat room:', chatRoom);
		  // do something with the chat room data
		})
		.catch(error => {
		  console.error('Error creating chat room:', error);
		  // handle the error
		});
		chatSocket?.on('error', (error) => {
			console.log(error); // 서버에서 전달된 에러 메시지 출력
		  });
		// socket?.emit('enterChatRoom', {name, password});
		router.push(`/lobby/chat/${name}?password=${password}`);
		setShowCreateRoomPopup(false);
	  };
	  
	  const joinChatRoom = (room: any) => {
		if (room.type === "PROTECTED") {
		  const inputPassword = prompt("비밀번호를 입력하세요");
		  router.push(`/lobby/chat/${room.name}?password=${inputPassword}`);
		  return;
		}
		router.push(`/lobby/chat/${room.name}`);
	  };

	return (
		<div className="relative flex flex-1 flex-col gap-4">

		<div className="container mx-auto py-6">
					<div className="text-3xl font-bold text-indigo-400 mb-4">
						나의 채팅방 목록
					</div>
					<div className="grid grid-cols-1 gap-3 rounded-lg bg-zinc-600 p-5">
					<div className="flex divide-x-4 divide-zinc-400 content-start">
						<div className="flex w-1/4 flex-col items-center justify-center text-base">
						<p className="text-[#bbc2ff]">채팅방 이름</p>
						</div>
						<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-base">
						<p className="text-[#bbc2ff]">인원</p>
						</div>
						<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-base">
						<p className="text-[#bbc2ff]">공개 채널</p>
						</div>
						<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-base">
						<p className="text-[#bbc2ff]">입장</p>
						</div>
					</div>

						{/* Replace this array with actual game room data */}
					<>
					{loading ? (
					<>
						<Loading />
					</>
					) : (
					chatRooms.map((room: any) => (
					<div key={room.id} className="bg-zinc-800 text-white p-4 rounded-lg shadow">
						<div className="flex divide-x-4 divide-zinc-800">
							<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-base">
								<p className="font-bold">{room.name}</p>
							</div>
							<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-base">
								<p className="font-bold">{room.users.length || '---'}</p>
							</div>
							<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-base">
								<p className="font-bold">{room.type === "PROTECTED" ? '비공개' : '공개'}</p>
							</div>
							<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-base">
								<button onClick={() => joinChatRoom(room)} className="rounded-lg bg-zinc-400 p-3 hover:bg-zinc-700 transition-colors cursor-pointer">입장</button>
							</div>
						</div>
					</div>
					))
					)}
					</>
					</div>
				</div>
			<div className="absolute bottom-5 right-8 ...">
				<div className="flex -mt-12 w-24 flex-col items-center justify-center space-y-3 text-sm">
					{!showCreateRoomPopup && <OpenButton onClick={() => setShowCreateRoomPopup(true)} />}
					{showCreateRoomPopup && <CloseButton onClick={() => setShowCreateRoomPopup(false)} />}
					{showCreateRoomPopup && (
						<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 grid w-60 rounded bg-zinc-800 shadow-neumreverse">
							<p className="text-sm text-center text-[#939efb]">방 제목</p>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="bg-black text-white px-3 py-2 rounded-md mb-3"
							/>
							<p className="text-sm text-center text-[#939efb]">비밀번호 설정</p>
							<input
								type="checkbox"
								checked={isPrivate}
								onChange={() => setIsPrivate(prevState => !prevState)}
								className="mb-3"
							/>
							{isPrivate && (
							<p className="text-sm text-center text-[#939efb]">비밀번호 입력</p>
							)}
							{isPrivate &&
							(
								<input
								type="text"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="bg-black text-white px-3 py-2 rounded-md mb-3"
								/>
							)
							}
						<button onClick={createChatRoom}>생성</button>
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
