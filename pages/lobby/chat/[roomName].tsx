import Layout from "@/components/Layout";
import { ReactElement, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import {
	ChatSocketProvider,
	SocketProvider,
} from "@/lib/socketContext";
import { NextPageWithLayout } from "@/pages/_app";
import { Socket } from "socket.io-client";



const RoomPage: NextPageWithLayout = ({roomData, userList}) => {
  const [message, setMessage] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [userOffsetTop, setuserOffsetTop] = useState();
  const [userOffsetLeft, setuserOffsetLeft] = useState();
  const [showUserModal, setShowUserModal] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  console.log(userList);
  // useEffect(() => {
  //   const chatContainer = document.getElementById("chat-container");
  //   chatContainer.scrollTop = chatContainer.scrollHeight;
  // }, [message]);


  // useEffect(() => {
  //   // 채팅 내용이 갱신될 때마다 chatHeight 상태를 업데이트합니다.
  //   const chatContainer = chatContainerRef.current;
  //   const chatContainerHeight = chatContainer.scrollHeight;
  //   const windowHeight = window.innerHeight;
  //   const inputBoxHeight = 80;
  //   const chatHeight = windowHeight - inputBoxHeight - (chatContainerHeight - windowHeight);
  //   setChatHeight(`${chatHeight}px`);
  // }, [message]);

  if (!roomData) {
    return <div>Loading...</div>;
  }

  const sendKickRequest = (user) => {
    // 유저에 대한 정보를 보여주는 모달을 열고,
    // 모달 내부에서 kick 또는 mute 처리를 할 수 있는 버튼을 추가하는 로직을 구현.
  }
  const userElements = {};

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  const handleOpenUserModal = (user) => {
    console.log("user", user);
    const userElement = userElements[user];
    if (userElement) {
      setSelectedUser(user);
      console.log("select", selectedUser);
      const { top, left } = userElement.getBoundingClientRect();
      console.log("TOP", top);
      console.log("LEFT", left);
      setuserOffsetTop(top);
      setuserOffsetLeft(left);
      setShowUserModal(true);
    }
  };

  const handleSendMessage = () => {
    const messageText = inputRef.current.value;
    console.log(`Sending message: ${messageText}`);
  
    const newMessage = {
      text: messageText,
      user: "juahn"
    };
  
    setMessage([...message, newMessage]);
    inputRef.current.value = "";
  };

  return (
    <div className="relative flex flex-1 flex-col gap-4 h-full">
      <p className="text-4xl text-left text-[#939efb]">{roomData.name}</p>
      <div className="grid grid-cols-[1fr,200px] gap-4">
        <div className="p-6 rounded-[14px] bg-[#616161] overflow-y-auto max-h-[calc(100vh-240px)] min-h-[calc(100vh-240px)]">
          <div className="flex-1 p-6">
          {message.map((msg, index) => (
            <div
              className={`flex justify-${msg.user === "juahn" ? "end" : "start"} items-start mb-4`}
              key={index}
            >
              <div
                className={`bg-${msg.user === "juahn" ? "yellow" : "blue"}-300 p-3 rounded-lg ${
                  msg.user === "juahn" ? "rounded-bl-none" : "rounded-br-none"
                } max-w-xs`}
              >
                <p className="text-sm text-black leading-tight">{msg.text}</p>
              </div>
            </div>
          ))}
          </div>
        </div>
        <div className="p-6 h-full rounded-[14px] bg-[#616161]">
          <p className="text-xl text-[#939efb]">유저 목록</p>
          <ul className="mt-4">
            {userList.map((user, index) => (
            <li
              key={index}
              className="text-white mb-2"
              onClick={() => handleOpenUserModal(user)}
              ref={(el) => (userElements[user] = el)}
            >
              {user}
            </li>
            ))}
          {showUserModal && (
            <div
              className="fixed z-50 top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex items-center justify-center"
              onClick={handleCloseUserModal}
            >
              <div
                  className="bg-black p-6 rounded-lg absolute"
                  style={{
                    top: `calc(${userOffsetTop}px + 20px)`,
                    left: `calc(${userOffsetLeft}px + 20px)`,
                    maxHeight: `calc(100vh - ${userOffsetTop}px - 20px)`,
                  }}
              >
                {/* 모달 내용 */}
                <button onClick={handleCloseUserModal}>Kick</button>
              </div>
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

    const { id } = context.query;
    const roomData = { "name": "room1", "passwrod": 12}
    const userList = ["juahn", "user1", "user2", "user3", "user4"];

  return {
    props: {
      roomData,
      userList,
    },
  };
}

RoomPage.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
			<ChatSocketProvider isOpen={true}>
				<Layout>{page}</Layout>
			</ChatSocketProvider>
		</SocketProvider>
	);
};


export default RoomPage;
