import { Fragment, useContext, useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { SocketContext } from "@/lib/socketContext";
import { toast } from "react-toastify";

const FriendNotifyMessage = ({ socket, userData, closeToast }: { socket:any, userData: any }) => {


	// 친구 요청 수락
	const acceptFriend = (event: React.MouseEvent<HTMLElement>) => {
		socket?.emit(
			"acceptFriendRequest",
			{ friendName: userData.name },
			(error: boolean) => {
				if (error) {
					console.log(error); // 서버에서 전달된 에러 메시지 출력
				}
			}
		);
		closeToast();
	};
	// 친구 요청 거절
	const rejectFriend = (event: React.MouseEvent<HTMLElement>) => {
		socket?.emit(
			"rejectFriendRequest",
			{ friendName: userData.name },
			(error: boolean) => {
				if (error) {
					console.log(error); // 서버에서 전달된 에러 메시지 출력
				}
			}
		);
		closeToast();
	};

	return (
	<>
	<div className="flex items-start">
		<div className="flex-shrink-0 pt-0.5">
			<Image
				className="h-10 w-10 rounded-full"
				src={userData.avatarImageUrl}
				width={160}
				height={160}
				alt=""
			/>
		</div>
		<div className="ml-3 w-0 flex-1">
			<p className="text-sm font-medium text-zinc-200">{userData?.name}</p>
			<p className="mt-1 text-sm text-zinc-200">
				친구 요청을 수락하시겠습니까?
			</p>
			<div className="mt-4 flex">
				<button
					type="button"
					className="inline-flex items-center rounded-md bg-indigo-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
					onClick={acceptFriend}
				>
					수락
				</button>
				<button
					type="button"
					className="ml-3 inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
					onClick={rejectFriend}
				>
					거절
				</button>
			</div>
		</div>
	</div>
</>)
};


export default function FriendNotification() {
	const [userData, setuserData] = useState<any>([]);
	// 소켓 연결
	const { friendSocket: socket } = useContext(SocketContext);
	useEffect(() => {
		if (socket) {
			socket.on("friendRequest", (data) => {
				if (data.length > 0) {
					setuserData([]);
					data.map((user: any, index: any) => {
						toast(<FriendNotifyMessage key={index} socket={socket} userData={user[index]} />,
						{
							autoClose: false,
							closeOnClick: false,
						});
					});
					setuserData(data);
				}
				if (data.length === 0) {
					setuserData([]);
				}
			});
		}
		return () => {
			socket?.off("friendRequest");
		};
	}, [socket]);

	return (
		<>
		</>
	);
}
