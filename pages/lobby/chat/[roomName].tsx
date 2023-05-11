import Layout from "@/components/Layout";
import { ReactElement, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Loading from "../../../components/ui/Loading";
import { SocketContext, SocketProvider } from "@/lib/socketContext";
import { NextPageWithLayout } from "@/pages/_app";
import { toast } from "react-toastify";
import { handleRefresh } from "@/lib/auth-client";
import ChatModal from "@/components/ChatModal";
import { useUsersDispatch, useUsersState } from "@/lib/userContext";
import { Cog6ToothIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import BannedChatModal from "@/components/BannedChatModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCommentSlash} from "@fortawesome/free-solid-svg-icons";

const RoomPage: NextPageWithLayout = ({
	isProtected,
	roomName,
}: {
	isProtected: string;
	roomName: string;
}) => {
	const [message, setMessage] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedUser, setSelectedUser] = useState("");
	const [showUserModal, setShowUserModal] = useState(false);
	const [userList, setUserList] = useState([]);
	const [bannedUserList, setbannedUserList] = useState([]);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isMuted, setIsMuted] = useState(false);
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

	const { friendSocket, chatSocket: socket } = useContext(SocketContext);
	useEffect(() => {
		friendSocket?.emit("updateActiveStatus", 2);
	}, [friendSocket]);

	useEffect(() => {
		if (password) {
			socket?.emit(
				"enterChatRoom",
				{ roomName: roomName, password: password },
				(error) => {
					if (!error.status) {
						toast.error(error.message);
						router.push(`/lobby/chat/?`);
					}
				}
			);
		}
	}, [password]);

	useEffect(() => {
		if (isProtected === "false") {
			socket?.emit(
				"enterChatRoom",
				{ roomName: roomName, password: password },
				(error) => {
					if (!error.status) {
						toast.error(error.message);
						router.push(`/lobby/chat/`);
					}
				}
			);
		}
	}, [router]);

	function handleKick() {
		toast.error("관리자가 당신을 내보냈습니다");
		router.push(`/lobby/chat/`);
	}

	function handleMute() {
		toast.error("관리자가 당신을 채팅 금지시켰습니다");
		setIsMuted(true);
	}

	useEffect(() => {
		if (socket) {
			socket.on("kickUser", handleKick);
			socket.on("muteUser", handleMute);
		}

		if (socket) {
			socket.on("getMessage", function (data) {
				if (data.user.name !== user.name)
					setMessage((prevMessages) => [...prevMessages, data]);
			});
		}

		if (isProtected == "true") {
			const inputPassword = prompt("비밀번호를 입력하세요");
			setPassword(inputPassword);
			if (inputPassword === null || inputPassword === "") {
				toast.error("비밀번호가 틀렸습니다.");
				router.push(`/lobby/chat/`);
			}
		} else {
			setPassword("");
		}

		return () => {
			socket?.off("getMessage");
			socket?.off("kickUser", handleKick);
			socket?.off("muteUser", handleMute);
		};
	}, []);

	// 페이지를 떠날 때 실행되는 이벤트 등록 후 콜백함수 호출
	useEffect(() => {
		const handleRouteChangeStart = (url: string) => {
			if (!url.match(/^\/lobby\/chat(?:\/)?(?:\/.*)?$/)) {
				socket?.emit("leaveChatPage");
				console.log("페이지를 떠납니다.");
			}
		};
		if (socket) {
			socket.on("getChatRoomMessages", function (data?) {
				console.log("msg data", data);
				if (data) setMessage(data);
			});
		}

		if (socket) {
			socket.on("getChatRoomUsers", function (data) {
				const Users = data.filter((user: any) => {
					return !user.isBanned;
				});
				const bannedUsers = data.filter((user: any) => {
					return user.isBanned;
				});
				setUserList(Users);
				setbannedUserList(bannedUsers);
				const me = Users.filter((user: any) => {
					return user.user.name === username;
				});
				setUserMe(me);
				setLoading(false);
			});
		}
		router.events.on("routeChangeStart", handleRouteChangeStart);

		return () => {
			socket?.off("getChatRoomMessages");
			socket?.off("getChatRoomUsers");
			router.events.off("routeChangeStart", handleRouteChangeStart);
		};
	}, [router, socket, username]);

	const handleCloseUserModal = () => {
		setSelectedUser("");
		setShowUserModal(false);
	};

	const handleSendMessage = () => {
		const messageText = inputRef.current.value;
		const newMessage = {
			id: user.id,
			message: messageText,
			timestamp: new Date().toISOString(),
			user: {
				name: user.name,
				avatarImageUrl: user.avatarImageUrl,
			},
		};
		setMessage((prevMessages) => [...prevMessages, newMessage]);
		socket?.emit("sendMessage", messageText);
		inputRef.current.value = "";
	};

	const changeRoomSettings = () => {
		// 채팅방 설정 변경 모달을 띄우는 로직을 구현
		// type password
		const type = isPrivate ? "PRIVATE" : "PUBLIC";
		socket?.emit(
			"updateChatRoom",
			{ type: type, password: password },
			(error: boolean) => {
				if (error) {
					toast.error(error); // 서버에서 전달된 에러 메시지 출력
					router.push(`/lobby/chat/`);
				}
			}
		);
		setShowCreateRoomPopup(false);
	};

	return (
		<>
			{loading ? (
				<>
					<Loading />
				</>
			) : (
				<>
					<div className="relative flex h-full flex-1 flex-col gap-4">
						<p className="text-left text-4xl text-[#939efb]">{roomName}</p>
						<div className="grid grid-cols-[1fr,200px] gap-4">
							<div className="max-h-[calc(100vh-240px)] min-h-[calc(100vh-240px)] overflow-y-auto rounded-[14px] bg-[#616161] p-6">
								<div className="flex flex-col">
									{message.map((msg: any, index: number) => (
										<div
											className={`mb-4 flex ${
												msg.user.name === username
													? "justify-end"
													: "justify-start"
											}`}
											key={index}
										>
											<div className="flex flex-col">
												<div className="flex flex-row">
													{msg.user.name !== username && (
														<div className="mr-2">
															<Image
																src={msg.user.avatarImageUrl}
																alt=""
																width={64}
																height={64}
																className="h-8 w-8 rounded-full"
															/>
														</div>
													)}
													<div
														className={`max-w-xs break-words rounded-lg p-3 text-sm leading-tight ${
															msg.user.name === username
																? "rounded-bl-none bg-blue-300"
																: "rounded-br-none bg-yellow-300"
														} ${
															msg.user.name === username
																? "self-end justify-self-end"
																: "self-start justify-self-start"
														}`}
													>
														{msg.user.name !== username && (
															<p className="mb-1 text-sm font-bold text-cyan-700">
																{msg.user.name}
															</p>
														)}
														<p
															className={`text-sm leading-tight ${
																msg.user.name === username
																	? "text-black"
																	: "text-black"
															}`}
														>
															{msg.message}
														</p>
													</div>
													<div ref={messagesEndRef} />
												</div>
												<span className="text-sm text-gray-400">
													{new Date(msg.timestamp).toLocaleString()}
												</span>
											</div>
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
							<div className="flex h-full flex-col rounded-[14px] bg-[#616161] p-6">
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
								{(userMe[0]?.role === 0 ||
									userMe[0]?.role === 1) && (
									<>
										<p className="mt-auto text-xl text-[#939efb]">
											차단된 유저
										</p>
										<ul className="mt-4">
											<BannedChatModal
												userData={bannedUserList}
												userMe={userMe}
											/>
											{showUserModal && selectedUser.length > 0 && (
												<div
													className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-gray-500 bg-opacity-50"
													onClick={handleCloseUserModal}
												></div>
											)}
										</ul>
									</>
								)}
							</div>
						</div>
						<div className="flex justify-between rounded-lg bg-gray-200 p-4">
							<input
								type="text"
								className="w-full rounded-lg border border-gray-300 p-2 text-black focus:outline-none"
								placeholder="메시지를 입력하세요."
								ref={inputRef}
								onKeyDown={(event) => {
									if (event.key === "Enter" && isMuted === false) {
										handleSendMessage();
									}
								}}
							/>
							{isMuted ? (
								<button
									type="button"
									className="ml-2 w-20 rounded-lg bg-blue-500 px-4 py-2 text-white"
								>
									<FontAwesomeIcon
										className="text-white"
										icon={faCommentSlash}
									/>
								</button>
							) : (
								<button
									className="ml-2 w-20 rounded-lg bg-blue-500 px-4 py-2 text-white"
									onClick={handleSendMessage}
								>
									전송
								</button>
							)}
						</div>
					</div>
					{showCreateRoomPopup && (
						<>
							<div className="fixed left-0 top-0 h-full w-full bg-zinc-800/50 "></div>
							<div className="fixed left-1/2 top-1/2 flex w-60 -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center rounded bg-zinc-800 py-2 shadow-xl">
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
										<label
											htmlFor="private"
											className="font-medium text-zinc-200"
										>
											비밀번호 설정
										</label>
									</div>
								</div>
								{isPrivate && (
									<>
										<p className="mt-2 text-center text-sm text-[#939efb]">
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
			)}
		</>
	);
};
export const getServerSideProps = async ({ query }) => {
	const { isProtected, roomName } = query;
	return {
		props: {
			isProtected,
			roomName,
		},
	};
};

RoomPage.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
			<Layout>{page}</Layout>
		</SocketProvider>
	);
};

export default RoomPage;
