import Layout from "@/components/Layout";
import { ReactElement, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import {
	ChatSocketProvider,
	SocketProvider,
} from "@/lib/socketContext";
import { NextPageWithLayout } from "@/pages/_app";
import { Socket } from "socket.io-client";



const RoomPage: NextPageWithLayout = ({roomData}) => {
  const [message, setMessage] = useState([]);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // message 배열의 길이에 따라 채팅창의 높이를 동적으로 조절합니다.
    const chatContainer = document.getElementById("chat-container");
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [message]);


  useEffect(() => {
    return () => {
      // roomSocket.close();
    setMessage(["1", "2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2",]);
    };
  }, [router.query.id]);

  if (!roomData) {
    return <div>Loading...</div>;
  }

  const handleSendMessage = () => {
    const messageText = inputRef.current.value;
    console.log(`Sending message: ${messageText}`);
    // 여기에 메시지 전송 코드를 추가하세요.
    inputRef.current.value = "";
  };

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <p className="text-4xl text-left text-[#939efb]">채팅방 이름</p>
      <div
        id="chat-container"
        className="p-4 h-full overflow-y-auto rounded-[14px] bg-[#616161]"
        style={{ maxHeight: "750px" }}
      >
        <div className="flex flex-col h-screen">
          <div className="flex-1 p-6">
            {message.map((msg) => (
              <div className="flex justify-start items-start mb-4">
                <div className="bg-blue-300 p-3 rounded-lg rounded-br-none max-w-xs">
                  <p className="text-sm text-black leading-tight">{msg}</p>
                </div>
              </div>
            ))}
            <div className="flex justify-end items-end mb-4">
              <div className="bg-yellow-300 p-3 rounded-lg rounded-bl-none max-w-xs">
                <p className="text-sm text-black leading-tight">안녕하세요!</p>
              </div>
            </div>
          </div>
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
      // const roomSocket = io("http://localhost:3000/chat-room");
      // const roomData = await roomSocket?.on("showChatRoomList", function(data){
      //   console.log("chatrooms data : ", data);
      // })
      const roomData = { "name": "John", "passwrod": 12}

  return {
    props: {
      roomData,
      // roomSocket,
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
