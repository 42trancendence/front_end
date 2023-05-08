import Layout from "@/components/Layout";
import { ReactElement, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import {
	SocketContext,
	SocketProvider,
} from "@/lib/socketContext";
import { NextPageWithLayout } from "@/pages/_app";
import { handleRefresh } from "@/lib/auth-client";
import DirectChatModal from "@/components/DirectChatModal";
import { useUsersDispatch, useUsersState } from "@/lib/userContext";

const RoomPage: NextPageWithLayout = ({ password, roomName}: { password: string, roomName: string}) => {
  const [message, setMessage] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [userList, setUserList] = useState([]);
	const [username, setUsername] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  const state = useUsersState();
	const dispatch = useUsersDispatch();
	const { data: user, loading: isUserDataLoaded, error } = state.user;

  useEffect(() => {
    console.log("선택된 유저", selectedUser.length);
  }, [selectedUser]);

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

  // 페이지를 떠날 때 실행되는 이벤트 등록 후 콜백함수 호출
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (!url.match(/^\/lobby\/chat(?:\/)?(?:\/.*)?$/)) {
				socket?.emit('leaveChatPage');
				console.log('페이지를 떠납니다.');
			}
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    socket?.on('getChatRoomUsers', function(data){
      console.log("users data", data);
      setUserList(data);
    });
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router, socket]);


  const userElements: { [key: string]: HTMLLIElement | null } = {};

  const handleCloseUserModal = () => {
    setSelectedUser("");
    setShowUserModal(false);
  };

	socket?.on("getMessage", function (data) {
		const newMessage = {
			message: data.message,
			user: [data.user.name],
		};
		console.log(newMessage);
		setMessage([...message, newMessage]);
	});


  const handleSendMessage = () => {
    const messageText = inputRef.current.value;
    socket?.emit('sendDirectMessage', messageText);

    inputRef.current.value = "";
  };

  return (
    <div className="relative flex flex-1 flex-col gap-4 h-full">
      <p className="text-4xl text-left text-[#939efb]">{roomName}</p>
      <div className="grid grid-cols-[1fr,200px] gap-4">
        <div className="p-6 rounded-[14px] bg-[#616161] overflow-y-auto max-h-[calc(100vh-240px)] min-h-[calc(100vh-240px)]">
          <div className="flex-1 p-6">
            {message.map((msg: any, index: number) => (
            <div
              className={`flex justify-${msg.user[0] === username ? "end" : "start"} items-start mb-4`}
              key={index}
            >
              <div
                className={`${msg.user[0] === username ? "bg-blue-300" : "bg-yellow-300"}
                p-3 rounded-lg
                ${msg.user === username ? "rounded-bl-none" : "rounded-br-none"}
                max-w-xs`}
              >
                <p className={`${msg.user[0] === username ? "text-black" : " text-black"} text-sm leading-tight`}>{msg.text}</p>
              </div>
            <div ref={messagesEndRef} />
            </div>
            ))}
          </div>
        </div>
        <div className="p-6 h-full rounded-[14px] bg-[#616161]">
          <p className="text-xl text-[#939efb]">유저 목록</p>
          <ul className="mt-4">
          <DirectChatModal userData={userList} />
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
  );

}



export const getServerSideProps = async ({ query }) => {
  const { password, roomName } = query;
  // password와 roomName을 사용하여 필요한 데이터를 가져오는 등의 처리를 수행할 수 있습니다.

  return {
    props: {
      password: password ?? null,
      roomName,
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
