import Layout from "@/components/Layout";
import { ReactElement, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Loading from "../../../components/ui/Loading";
import { SocketContext, SocketProvider } from "@/lib/socketContext";
import { NextPageWithLayout } from "@/pages/_app";
import { handleRefresh } from "@/lib/auth-client";
import ChatModal from "@/components/ChatModal";
import { useUsersDispatch, useUsersState } from "@/lib/userContext";
import { Cog6ToothIcon } from "@heroicons/react/20/solid";

const RoomPage: NextPageWithLayout = ({
	password,
	roomName,
}: {
	password: string;
	roomName: string;
}) => {
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
		socket?.emit("enterChatRoom", { roomName: roomName, password: password }, (error) => {
			if (!error.status) {
				console.log(error); // 서버에서 전달된 에러 메시지 출력
				router.push(`/lobby/chat/`);
			}
		});
	}, []);


	// 페이지를 떠날 때 실행되는 이벤트 등록 후 콜백함수 호출
	useEffect(() => {
		const handleRouteChangeStart = (url: string) => {
			if (!url.match(/^\/lobby\/chat(?:\/)?(?:\/.*)?$/)) {
				socket?.emit("leaveChatPage");
				console.log("페이지를 떠납니다.");
			}
		};

		router.events.on("routeChangeStart", handleRouteChangeStart);

		// socket?.emit('enterChatRoom', {roomName: roomName, password: password}, (error: boolean)=>{
		//   if(error){
		//     console.log(error); // 서버에서 전달된 에러 메시지 출력
		//     router.push(`/lobby/chat/`);
		//   } else {
		//       socket?.on('getChatRoomUsers', function(data){
		//       console.log("users data", data);
		//       setUserList(data);
		//       setLoading(false);
		//     });
		//   }

		// if(error){
		//   console.log(error); // 서버에서 전달된 에러 메시지 출력
		//   router.push(`/lobby/chat/`);
		// } else {
		socket?.on("getChatRoomUsers", function (data) {
			console.log("users data", data);
			setUserList(data);
			const me = data.filter((user: any) => {
				return user.user.name === username;
			});
			setUserMe(me);
			console.log("me data", me);
			setLoading(false);
			// });
			// }
		});

		return () => {
			router.events.off("routeChangeStart", handleRouteChangeStart);
		};
	}, [router, socket, username]);

	const userElements: { [key: string]: HTMLLIElement | null } = {};

	const handleCloseUserModal = () => {
		setSelectedUser("");
		setShowUserModal(false);
	};

	socket?.on("getChatRoomMessages", function (data?) {
		console.log("msg data", data);
		if (data)
			setMessage(data);
	});

	socket?.on("getMessage", function (data) {
		console.log(data);
		const newMessage = {
			message: data.message,
			user: [data.user.name],
		};
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
		socket?.emit("updateChatRoom", { type: type, password: password }, (error: boolean) => {
			if (error) {
				console.log(error); // 서버에서 전달된 에러 메시지 출력
				router.push(`/lobby/chat/`);
			}
		});
		setShowCreateRoomPopup(false);
	};

  socket?.on("kickUser", function(data){
  
    console.log("당신은 추방당했습니다!");
    router.push(`/lobby/chat/`);
  })

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
                    className={`flex mb-4 ${
                      msg.user[0] === username ? "justify-end" : "justify-start"
                    }`}
                    key={index}
                  >
                    <div
                      className={`rounded-lg p-3 max-w-xs ${
                        msg.user[0] === username ? "bg-blue-300 rounded-bl-none" : "bg-yellow-300 rounded-br-none"
                      } ${
                        msg.user[0] === username ? "self-end justify-self-end" : "self-start justify-self-start"
                      }`}
                    >
					{msg.user[0] !== username && (
         				 <p className="text-sm text-cyan-700 font-bold mb-1">{msg.user[0]}</p>
        			)}
                      <p
                        className={`text-sm leading-tight ${
                          msg.user[0] === username ? "text-black" : "text-black"
                        }`}
                      >
                        {msg.message}
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
	const { password, roomName } = query;
	// password와 roomName을 사용하여 필요한 데이터를 가져오는 등의 처리를 수행할 수 있습니다.
	return {
		props: {
			password: password ?? null,
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
