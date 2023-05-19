import Layout from "@/components/Layout";
import { ReactElement, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Loading from "../../../../components/ui/Loading";
import {
	SocketContext,
	SocketProvider,
} from "@/lib/socketContext";
import { NextPageWithLayout } from "@/pages/_app";
import { handleRefresh } from "@/lib/auth-client";
import DirectChatModal from "@/components/DirectChatModal";
import { useUsersDispatch, useUsersState } from "@/lib/userContext";
import Image from "next/image";

const DmRoomPage: NextPageWithLayout = ({ dmId, roomName}: { dmId: string, roomName: string}) => {
  const [message, setMessage] = useState([]);
  const [isBlocked, setIsBlocked] = useState();
	const [userMe, setUserMe] = useState([]);
	const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [userLists, setUserLists] = useState([]);
	const [username, setUsername] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

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

  useEffect(() => {
		// 채팅방 페이지에 들어왔을 때, 채팅방에 입장하는 이벤트를 서버에 전달
    // console.log("dmId",dmId);
    if (dmId !== "false") {
      socket?.emit("enterDirectMessage", { directMessageId: dmId }, (error) => {
        if (!error.status) {
          console.log(error); // 서버에서 전달된 에러 메시지 출력
          router.push(`/lobby/chat/`);
        }
      });
    }
    return () => {
    }
	}, [router]);

  const { friendSocket, chatSocket: socket } = useContext(SocketContext);
	useEffect(() => {
		friendSocket?.emit("updateActiveStatus", 2);
	}, [friendSocket]);

  // 페이지를 떠날 때 실행되는 이벤트 등록 후 콜백함수 호출
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (!url.match(/^\/lobby\/chat(?:\/)?(?:\/.*)?$/)) {
				socket?.emit('leaveChatPage');
				console.log('페이지를 떠납니다.');
			}
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    if (socket)
    {
      socket.on("getMessage", function (data) {
        if (data.user.name !== user.name)
          setMessage(prevMessages => [...prevMessages, data]);
      });
    }
    
    if (socket)
    {
      socket.on("getChatRoomMessages", function (data: any) {
        console.log("getChatRoomMessages: ", data);
        setMessage([...data]);
      });
    }

    if (socket)
    {
    socket.on("getDirectMessageUsers", function (data) {
      console.log("users data", data);
      const newUserList = Object.keys(data)
      .filter(key => key !== 'isBlocked')
      .map(key => data[key]);
      const me = newUserList.filter((user: any) => {
        return user.name === username;
      });
      setUserMe(me);
      setIsBlocked(data.isBlocked);
      setUserLists(newUserList);
      console.log("console data", userLists);
      setLoading(false);
    });
  }
  
    return () => {
      socket?.off("getDirectMessageUsers");
      socket?.off("getMessage");
      socket?.off("getChatRoomMessages");
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
	}, [router, socket, username]);


  useEffect(() => {
    console.log("usersdata:", userLists);
  }, [userLists]);


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
				  avatarImageUrl: user.avatarImageUrl
				}
			  };
		setMessage(prevMessages => [...prevMessages, newMessage]);
		socket?.emit("sendDirectMessage", messageText);
		inputRef.current.value = "";
	};

  return (
		<>
    {loading ? (
      <>
        <Loading />
      </>
    ) : (
      <>
    <div className="relative flex flex-1 flex-col gap-4 h-full">
      <p className="text-4xl text-left text-[#939efb]">{roomName.substring(3) + "님과의 1:1 대화"}</p>
      <div className="grid grid-cols-[1fr,200px] gap-4">
        <div className="p-6 rounded-[14px] bg-[#616161] overflow-y-auto max-h-[calc(100vh-240px)] min-h-[calc(100vh-240px)]">
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
															<img
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
																? "rounded-br-none bg-blue-300"
																: "rounded-bl-none bg-yellow-300"
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
													{new Date(msg.timestamp).toLocaleTimeString('ko-KR', { day: 'numeric', hour: 'numeric', minute: 'numeric'})}
												</span>
											</div>
										</div>
									))}
          </div>
        </div>
        <div className="p-6 h-full rounded-[14px] bg-[#616161]">
          <p className="text-xl text-[#939efb]">유저 목록</p>
          <ul className="mt-4">
          {userLists && (
            <DirectChatModal userData={userLists} userMe={userMe} isBlocked={isBlocked}/>
          )}
          {showUserModal && selectedUser.length > 0 && (
            <div
              className="fixed z-50 top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex items-center justify-center"
              onClick={handleCloseUserModal}
            >
            </div>
          )}
          </ul>
        </div>
      </div>
      <div className="bg-gray-200 p-4 flex rounded-lg justify-between">
        <input
          type="text"
          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none text-black"
          placeholder="메시지를 입력하세요."
          ref={inputRef}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <button
          className="bg-blue-500 w-20 text-white py-2 px-4 rounded-lg ml-2"
          onClick={handleSendMessage}
        >
          전송
        </button>
      </div>
    </div>
    </>
					)}
				</>
  );

}



export const getServerSideProps = async ({ query }) => {
  const { dmId, roomName } = query;
  // password와 roomName을 사용하여 필요한 데이터를 가져오는 등의 처리를 수행할 수 있습니다.

  return {
    props: {
      dmId,
      roomName,
    },
  };
}

DmRoomPage.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
					<Layout>{page}</Layout>
		</SocketProvider>
	);
};


export default DmRoomPage;
