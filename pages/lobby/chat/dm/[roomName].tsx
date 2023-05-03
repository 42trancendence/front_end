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



const RoomPage: NextPageWithLayout = ({roomData}) => {
  const [message, setMessage] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [userOffsetTop, setUserOffsetTop] = useState(0);
  const [userOffsetLeft, setUserOffsetLeft] = useState(0);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userList, setUserList] = useState([]);
	const [username, setUsername] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    console.log("선택된 유저", selectedUser.length);
  }, [selectedUser]);

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
					await handleRefresh();
				} else {
					return null;
				}
			} catch (error) {
				console.log(error);
			}
		}
		getUser();
	}, [username]);

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
    const handleRouteChangeStart = (url) => {
      socket?.emit('leaveChatPage');
      console.log('페이지를 떠납니다.');
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router, socket]);



  if (!roomData) {
    return <div>Loading...</div>;
  }
	useEffect(() => {
		if (socket) {
			console.log("socket connected!");
		}
	}, [socket]);

  const sendKickRequest = (user) => {
    // 유저에 대한 정보를 보여주는 모달을 열고,
    // 모달 내부에서 kick 또는 mute 처리를 할 수 있는 버튼을 추가하는 로직을 구현.
  }
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
  socket?.on('getChatRoomUsers', function(data){
    console.log("users data", data);
    setUserList(data);
  });

  socket?.on('getMessage', function(data) {
    const newMessage = {
      text: data.message,
      user: data.user.name
    };
    console.log(newMessage);
    setMessage([...message, newMessage]);
  })

  const handleSendMessage = () => {
    const messageText = inputRef.current.value;
    socket?.emit('sendDirectMessage', messageText);

    inputRef.current.value = "";
  };

  return (
    <div className="relative flex flex-1 flex-col gap-4 h-full">
      <p className="text-4xl text-left text-[#939efb]">{roomData.name}</p>
      <div className="grid grid-cols-[1fr,200px] gap-4">
        <div className="p-6 rounded-[14px] bg-[#616161] overflow-y-auto max-h-[calc(100vh-240px)] min-h-[calc(100vh-240px)]">
          <div className="flex-1 p-6">
            {message.map((msg: any, index: number) => (
            <div
              className={`flex justify-${msg.user === username ? "end" : "start"} items-start mb-4`}
              key={index}
            >
              <div
                className={`${msg.user === username ? "bg-blue-300" : "bg-yellow-300"}
                p-3 rounded-lg
                ${msg.user === username ? "rounded-bl-none" : "rounded-br-none"}
                max-w-xs`}
              >
                <p className={`${msg.user === username ? "text-black" : " text-black"} text-sm leading-tight`}>{msg.text}</p>
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



export async function getServerSideProps(context: any) {
  const { roomName } = context.query;
  const roomData = { "name": roomName, "password": 12 };

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
