import Link from "next/link";
import Image from "next/image";
import DefaultAvatarPic from "@/public/default_avatar.svg";
import clsx from "clsx";
import { toast } from "react-toastify";
import { Fragment, useContext } from "react";
import { Menu, Transition } from "@headlessui/react";
import { SocketContext } from "@/lib/socketContext";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import {useRouter} from "next/router";
import { NotifyContext } from "@/lib/notifyContext";
import {
	NoSymbolIcon
} from "@heroicons/react/24/outline";

export default function DirectChatModal({
	userData,
	userMe,
	isBlocked,
}: {
	userData: any;
	userMe: any;
	isBlocked: boolean;
}) {
	console.log(userData);
	console.log(isBlocked);
	const me = userMe[0];
	console.log("me", userMe);
	const newUserList = Object.keys(userData).map((key) => {
        return {
          id: userData[key].id,
          name: userData[key].name,
        };
	});
	console.log("modal data:", userData);
	const { chatSocket: socket } = useContext(SocketContext);
	const { gameSocket: gameSocket } = useContext(SocketContext);
	const router = useRouter();

	function BlockUser(event: React.MouseEvent<HTMLElement>, item: any) {
		event.preventDefault();

		socket?.emit("toggleBlockUser", {userId: item.id}, (error: any) => {
			if (error.status === "FATAL") {
				toast.error(error.message);
				router.push(`/lobby/chat/`);
			}
			else if (error.status === "WARNING") {
				toast.error(error.message);
			}
			else if (error.status === "OK")
			{
				toast.success("요청을 성공적으로 처리했습니다!")
			}
		});
	}

	const { successed } = useContext(NotifyContext);
	function onSuccessed() {
		successed({
			header: "게임요청",
			message: "게임요청을 성공적으로 보냈습니다.",
		});
	}

	// 게임 초대 이벤트
	const inviteUserForGame = (event: React.MouseEvent<HTMLElement>, item: any) => {

		// console.log('user: ', item)

		gameSocket?.emit("inviteUserForGame", { userName: item.name });
		gameSocket?.on("error", (error) => {
			console.log(error); // 서버에서 전달된 에러 메시지 출력
		});
	};

	return newUserList.map((user: any, index: number) => (
		me ?
		<Menu as="li" key={index}>
			<div className="bg-black"></div>
			<Menu.Button className="group flex w-full items-center gap-x-4 rounded-md p-2 text-sm font-normal leading-6 text-indigo-200 hover:bg-zinc-700 hover:text-white">
				<Image
					className="inline-block h-6 w-6 flex-none rounded-full"
					src={user.user.avatarImageUrl}
					alt=""
					width={28}
					height={28}
				/>
				<span className="mr-auto">{user.name}</span>
				{(user.name !== me.name && isBlocked === true) ? (
					<NoSymbolIcon
						className="ml-auto h-6 w-6 text-red-500"
					/>
				) : (
					<></>
				)}
			</Menu.Button>
			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu.Items className="absolute right-4 z-10 mt-2 w-48 origin-top-right rounded bg-zinc-950 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
					<div>
						<Menu.Item>
							{({ active }) => (
								<button
									type="button"
									className={clsx(
										active ? "bg-gray-100 text-gray-700" : "text-white",
										"block w-full rounded-t px-4 py-2 text-sm"
									)}
									onClick={() => router.push(`/lobby/users/${user.id}`)}
								>
									유저 정보
								</button>
							)}
						</Menu.Item>
						{me.name !== user.name ? (
							<>
						<Menu.Item>
							{({ active }) => (
								<button
									className={clsx(
										active ? "bg-gray-100 text-gray-700" : "text-white",
										"block w-full px-4 py-2 text-sm"
									)}
									onClick={(e) => { inviteUserForGame(e, user) }}
								>
									게임 초대
								</button>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<button
									className={clsx(
										active ? "bg-red-400 text-white" : "bg-red-500 text-white",
										"block w-full rounded-b px-4 py-2 text-sm"
									)}
									onClick={(e) => BlockUser(e, user)}
								>
									BLOCK
								</button>
							)}
						</Menu.Item>
						</>
						) : (
							<></>
						)}
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
		: <></>
	));
}
