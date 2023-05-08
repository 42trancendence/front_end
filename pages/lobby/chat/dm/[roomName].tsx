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

const DmRoomPage: NextPageWithLayout = ({ dmId, roomName}: { dmId: string, roomName: string}) => {
  const [message, setMessage] = useState([]);
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
    console.log("dmId",dmId);
    if (dmId !== "false")
		socket?.emit("enterDirectMessage", { directMessageId: dmId }, (error) => {
			if (!error.status) {
				console.log(error); // 서버에서 전달된 에러 메시지 출력
				router.push(`/lobby/chat/`);
			}
		});
	}, []);

  const { chatSocket: socket } = useContext(SocketContext);

  // 페이지를 떠날 때 실행되는 이벤트 등록 후 콜백함수 호출
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (!url.match(/^\/lobby\/chat(?:\/)?(?:\/.*)?$/)) {
				socket?.emit('leaveChatPage');
				console.log('페이지를 떠납니다.');
			}
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
	}, [router, socket, username]);

  socket?.on("getDirectMessageUsers", function (data) {
    console.log("users data", data);
    const newUserList = Object.keys(data).map(key => {
      return {
        id: data[key].id,
        name: data[key].name,
      };
    });
    const me = newUserList.filter((user: any) => {
      return user.name === username;
    });
    setUserMe(me);
    setUserLists(newUserList);
    console.log("console data", userLists);
    setLoading(false);
    // });
    // }
  });

  useEffect(() => {
    console.log("usersdata:", userLists);
  }, [userLists]);


  const handleCloseUserModal = () => {
    setSelectedUser("");
    setShowUserModal(false);
  };

	socket?.on("getMessage", function (data: any) {
		console.log(data);
		setMessage([...message, data]);
	});


  const handleSendMessage = () => {
    const messageText = inputRef.current.value;
    socket?.emit('sendDirectMessage', messageText);

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
          <div className="flex-1 p-6">
          {message.map((msg: any, index: number) => (
                  <div
                    className={`flex mb-4 ${
                      msg.user.name === username ? "justify-end" : "justify-start"
                    }`}
                    key={index}
                  >
					{msg.user.name !== username && (
						<div className="mr-2">
						<img
							src={msg.user.avatarImageUrl}
							alt=""
							className="w-8 h-8 rounded-full"
						/>
						</div>
					)}
                    <div
                      className={`rounded-lg p-3 max-w-xs ${
                        msg.user.name === username ? "bg-blue-300 rounded-bl-none" : "bg-yellow-300 rounded-br-none"
                      } ${
                        msg.user.name === username ? "self-end justify-self-end" : "self-start justify-self-start"
                      }`}
                    >
					{msg.user.name !== username && (
         				 <p className="text-sm text-cyan-700 font-bold mb-1">{msg.user.name}</p>
        			)}
                      <p
                        className={`text-sm leading-tight ${
                          msg.user.name === username ? "text-black" : "text-black"
                        }`}
                      >
                        {msg.message}
                      </p>
        			{/* <p className="text-xs text-gray-500">{msg..toLocaleString()}</p> // 메시지를 보낸 날짜 출력 */}
                    </div>
                    <div ref={messagesEndRef} />
                  </div>
                ))}
          </div>
        </div>
        <div className="p-6 h-full rounded-[14px] bg-[#616161]">
          <p className="text-xl text-[#939efb]">유저 목록</p>
          <ul className="mt-4">
          {userLists && (
            <DirectChatModal userData={userLists} userMe={userMe}/>
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
