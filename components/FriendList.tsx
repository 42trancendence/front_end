import Link from "next/link";
import Image from "next/image";
import DefaultAvatarPic from "@/public/default_avatar.svg";
import clsx from "clsx";
import { Fragment, useContext } from "react";
import { Menu, Transition } from "@headlessui/react";
import { SocketContext } from "@/lib/socketContext";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { NotifyContext } from "@/lib/notifyContext";

export default function FreindList({ userData }: any) {
	console.log(userData);
	const { friendSocket: socket, chatSocket, gameSocket } = useContext(SocketContext);
	
	function deleteFriend(event: React.MouseEvent<HTMLElement>, item: any) {
		event.preventDefault();
		socket?.emit("deleteFriend", { friendName: item.name });
	}
	const router = useRouter();

	function BlockUser(event: React.MouseEvent<HTMLElement>, item: any) {
		event.preventDefault();
		chatSocket?.emit("toggleBlockUser", {userId: item.id}, (error) => {
			if (!error.status) {
				console.log(error); // 서버에서 전달된 에러 메시지 출력
			}
		});
	}

	const createDirectMessage = (id: string, name: string) => {
		chatSocket?.emit("createDirectMessage", {
			receiverId: id,
		}, (res: any) => {
			console.log("res", res);
			router.push(`/lobby/chat/dm/dm: ${name}?dmId=${res.directMessageId}`);
			if (!res.status) {
				console.log(res); // 서버에서 전달된 에러 메시지 출력
				router.push(`/lobby/chat/`);
			}
		});

	};

		// 친구 추가 소켓 이벤트
	const { successed } = useContext(NotifyContext);
	function onSuccessed() {
		successed({
			header: "게임요청",
			message: "게임요청을 성공적으로 보냈습니다.",
		});
	}

	// 게임 초대 이벤트
	const inviteUserForGame = (event: React.MouseEvent<HTMLElement>, item: any) => {

		console.log('user: ', item)

		gameSocket?.emit("inviteUserForGame", { userName: item.name });
		gameSocket?.on("error", (error) => {
			console.log(error); // 서버에서 전달된 에러 메시지 출력
		});
		router.push(`/lobby/overview`);
		onSuccessed();
	};


	return (
		<>
			{userData.length > 0 ? (
				userData.map((user: any, index: number) => (
					<Menu as="li" key={index}>
						<Menu.Button className="group flex w-full items-center gap-x-4 rounded-md p-2 text-sm font-normal leading-6 text-indigo-200 hover:bg-zinc-700 hover:text-white">
							<Image
								className="inline-block h-7 w-7 flex-none rounded-full"
								src={DefaultAvatarPic}
								alt=""
							/>
							<span className="mr-auto">{user.name}</span>
							<span
								className={clsx(
									user.status === 1
										? "bg-green-500"
										: user.status === 2
										? "bg-blue-500"
										: user.status === 3
										? "bg-yellow-500"
										: "bg-red-500",
									"h-2 w-2 flex-none rounded-full"
								)}
							></span>
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
									<Menu.Item>
										{({ active }) => (
											<button
												type="button"
												className={clsx(
													active ? "bg-gray-100 text-gray-700" : "text-white",
													"block w-full px-4 py-2 text-sm"
												)}
												onClick={(e) => createDirectMessage(user.id, user.name)}
											>
												1:1 채팅
											</button>
										)}
									</Menu.Item>
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
													active
														? "bg-violet-500 text-white"
														: "text-white",
													"block w-full px-4 py-2 text-sm"
												)}
												onClick={(e) => BlockUser(e, user)}
											>
												차단
											</button>
										)}
									</Menu.Item>
									<Menu.Item>
										{({ active }) => (
											<button
												className={clsx(
													active
														? "bg-red-400 text-white"
														: "bg-red-500 text-white",
													"block w-full rounded-b px-4 py-2 text-sm"
												)}
												onClick={(e) => deleteFriend(e, user)}
											>
												친구 삭제
											</button>
										)}
									</Menu.Item>
								</div>
							</Menu.Items>
						</Transition>
					</Menu>
				))
			) : (
				<div className="px-6 py-14 text-center text-sm sm:px-14">
					<ExclamationCircleIcon
						type="outline"
						name="exclamation-circle"
						className="mx-auto h-6 w-6 text-gray-200"
					/>
					<p className="mt-4 font-semibold text-zinc-100">친구가 없습니다.</p>
					<p className="mt-2 text-zinc-200">검색을 통해 친구를 추가해보세요!</p>
				</div>
			)}
		</>
	);
}
