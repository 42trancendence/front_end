import Layout from "@/components/Layout";
import { ReactElement, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Loading from "../../../components/ui/Loading";
import {
	SocketContext,
	SocketProvider,
} from "@/lib/socketContext";
import { NextPageWithLayout } from "@/pages/_app";
import { handleRefresh } from "@/lib/auth-client";
import ChatModal from "@/components/ChatModal";
import { useUsersDispatch, useUsersState } from "@/lib/userContext";
import { Cog6ToothIcon } from "@heroicons/react/20/solid";

const RoomPage: NextPageWithLayout = ({ password, roomName}: { password: string, roomName: string}) => {

  const [message, setMessage] = useState([]);
	const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState("");
  const [userOffsetTop, setUserOffsetTop] = useState(0);
  const [userOffsetLeft, setUserOffsetLeft] = useState(0);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userList, setUserList] = useState([]);
	const [username, setUsername] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  const [userMe, setUserMe] = useState([]);
	const [showCreateRoomPopup, setShowCreateRoomPopup] = useState(false);
	const [isPrivate, setIsPrivate] = useState(false);
	const [newPassword, setNewPassword] = useState("");

	const state = useUsersState();
	const dispatch = useUsersDispatch();
	const { data: user, loading: isUserDataLoaded, error } = state.user;

	useEffect(() => {
		setUsername(user.name);
	}, [user]);

	useEffect(() => {
		scrollToBottom();
	}, [message]);

	const scrollToBottom = () => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	const { chatSocket: socket } = useContext(SocketContext);

	useEffect(() => {
		// 채팅방 페이지에 들어왔을 때, 채팅방에 입장하는 이벤트를 서버에 전달
		if (username) {
			socket?.emit("enterChatRoom", { roomName: roomData.name, password: "" });
		}
	}, [socket, roomData.name, username]);

	// 페이지를 떠날 때 실행되는 이벤트 등록 후 콜백함수 호출
	useEffect(() => {
		const handleRouteChangeStart = (url: string) => {
			if (!url.match(/^\/lobby\/chat(?:\/)?(?:\/.*)?$/)) {
				socket?.emit("leaveChatPage");
				console.log("페이지를 떠납니다.");
			}
		};

		// 채팅방에 입장한 유저들의 정보를 서버로부터 받아옴
		socket?.on("getChatRoomUsers", function (data) {
			setUserList(data);
			const me = data.filter((user: any) => {
				return user.user.name === username;
			});
			setUserMe(me);
		});

		// 채팅방 페이지를 떠날 때, 채팅방에서 나가는 이벤트를 서버에 전달
		router.events.on("routeChangeStart", handleRouteChangeStart);
		return () => {
			router.events.off("routeChangeStart", handleRouteChangeStart);
		};
	}, [router, socket, username]);

	if (!roomData) {
		return <div>Loading...</div>;
	}

	const sendKickRequest = (user) => {
		// 유저에 대한 정보를 보여주는 모달을 열고,
		// 모달 내부에서 kick 또는 mute 처리를 할 수 있는 버튼을 추가하는 로직을 구현.
	};
	const userElements: { [key: string]: HTMLLIElement | null } = {};

	const handleCloseUserModal = () => {
		setSelectedUser("");
		setShowUserModal(false);
	};

	const handleOpenUserModal = (user: string) => {
		console.log("user", user);
		const userElement = userElements[user];
		if (userElement) {
			setSelectedUser(user);
			console.log("sele", selectedUser);
			console.log("select", selectedUser);
			const { top, left } = userElement.getBoundingClientRect();
			console.log("TOP", top);
			console.log("LEFT", left);
			setUserOffsetTop(top);
			setUserOffsetLeft(left);
			setShowUserModal(true);
		}
	};

	socket?.on("getMessage", function (data) {
		const newMessage = {
			text: data.message,
			user: data.user.name,
		};
		console.log(newMessage);
		setMessage([...message, newMessage]);
	});

	const handleSendMessage = () => {
		const messageText = inputRef.current.value;
		socket?.emit("sendMessage", messageText);

		inputRef.current.value = "";
	};

	const changeRoomSettings = () => {
		// 채팅방 설정 변경 모달을 띄우는 로직을 구현
		// type password
    const type = isPrivate ? "PRIVATE" : "PUBLIC";
    socket?.emit("updateChatRoom", {type: type, password: password});
    setShowCreateRoomPopup(false);
	};

	return (
		<>
			<div className="relative flex h-full flex-1 flex-col gap-4">
				<p className="text-left text-4xl text-[#939efb]">{roomData.name}</p>
				<div className="grid grid-cols-[1fr,200px] gap-4">
					<div className="relative max-h-[calc(100vh-240px)] min-h-[calc(100vh-240px)] overflow-y-auto rounded-[14px] bg-[#616161] p-6">
						<div className="flex-1 p-6">
							{message.map((msg: any, index: number) => (
								<div
									className={`flex justify-${
										msg.user === username ? "end" : "start"
									} mb-4 items-start`}
									key={index}
								>
									<div
										className={`${
											msg.user === username ? "bg-blue-300" : "bg-yellow-300"
										}
                rounded-lg p-3
                ${msg.user === username ? "rounded-bl-none" : "rounded-br-none"}
                max-w-xs`}
									>
										<p
											className={`${
												msg.user === username ? "text-black" : " text-black"
											} text-sm leading-tight`}
										>
											{msg.text}
										</p>
									</div>
									<div ref={messagesEndRef} />
								</div>
							))}
						</div>
						{userMe[0]?.role === "OWNER" && (
							<Cog6ToothIcon
								onClick={() => setShowCreateRoomPopup(true)}
								className="absolute bottom-0 right-0 m-4 h-6 w-6 cursor-pointer text-zinc-200 hover:text-zinc-400"
							/>
						)}
					</div>
					<div className="h-full rounded-[14px] bg-[#616161] p-6">
						<p className="text-xl text-[#939efb]">유저 목록</p>
						<ul className="mt-4">
							<ChatModal userData={userList} userMe={userMe} />
							{showUserModal && selectedUser.length > 0 && (
								<div
									className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-gray-500 bg-opacity-50"
									onClick={handleCloseUserModal}
								></div>
							)}
						</ul>
					</div>
				</div>
				<div className="flex justify-between rounded-lg bg-gray-200 p-4">
					<input
						type="text"
						className="w-full rounded-lg border border-gray-300 p-2 text-black focus:outline-none"
						placeholder="메시지를 입력하세요."
						ref={inputRef}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								handleSendMessage();
							}
						}}
					/>
					<button
						className="ml-2 w-20 rounded-lg bg-blue-500 px-4 py-2 text-white"
						onClick={handleSendMessage}
					>
						전송
					</button>
				</div>
			</div>

			{showCreateRoomPopup && (
				<>
					<div className="fixed left-0 top-0 h-full w-full bg-zinc-800/50 "></div>
					<div className="fixed left-1/2 top-1/2 py-2 flex w-60 -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center rounded bg-zinc-800 shadow-xl">
						<div className="relative flex items-start">
							<div className="flex h-6 items-center">
								<input
									id="private"
									name="private"
									type="checkbox"
									checked={isPrivate}
									onChange={() => setIsPrivate((prevState) => !prevState)}
									className="h-4 w-4 rounded border-zinc-300 text-zinc-600 focus:ring-zinc-600"
								/>
							</div>
							<div className="ml-3 text-sm leading-6">
								<label htmlFor="private" className="font-medium text-zinc-200">
                비밀번호 설정
								</label>
							</div>
						</div>
						{isPrivate && (
							<>
								<p className="text-center mt-2 text-sm text-[#939efb]">
									비밀번호 입력
								</p>
                <div className="mx-2">
								<input
									type="text"
									value={password}
									onChange={(e) => setNewPassword(e.target.value)}
									className="mb-3 w-full rounded-md bg-black px-3 py-2 text-white"
								/>
                </div>
							</>
						)}

						<div className="mt-5 flex gap-2 sm:mt-4">
							<button
								className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
								type="button"
								onClick={changeRoomSettings}
							>
								저장
							</button>
							<button
								type="button"
								className="mt-3 inline-flex w-full justify-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-100 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-zinc-700 sm:mt-0 sm:w-auto"
								onClick={() => setShowCreateRoomPopup(false)}
							>
								닫기
							</button>
						</div>
					</div>
				</>
			)}
		</>
	);
};

export async function getServerSideProps(context: any) {
	const { roomName } = context.query;
	const roomData = { name: roomName, password: 12 };

	return {
		props: {
			roomData,
		},
	};
}

RoomPage.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
			<Layout>{page}</Layout>
		</SocketProvider>
	);
};

export default RoomPage;
