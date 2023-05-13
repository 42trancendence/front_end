import { Combobox, Dialog, Transition } from "@headlessui/react";
import {
	ExclamationCircleIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import clsx from "clsx";
import DefaultAvatarPic from "@/public/default_avatar.svg";
import { Fragment, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { NormalButton } from "./ui/NormalButton";
import { SocketContext } from "@/lib/socketContext";
import { handleRefresh } from "@/lib/auth-client";
import { NotifyContext } from "@/lib/notifyContext";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export default function SearchBox({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: any;
}) {
	const [query, setQuery] = useState("");
	const [selectedUser, setSelectedUser] = useState("");
	const [items, setItems] = useState<any>([]);
	const router = useRouter();
	// 모든 유저 검색
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const res = await fetch("http://localhost:3000/users", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				});
				if (res.status === 200) {
					const data = await res.json();
					setItems(data);
				} else if (res.status === 401) {
					// Unauthorized, try to refresh the access token
					const newAccessToken = await handleRefresh();
					if (!newAccessToken) {
						setItems([]);
					}
					fetchUsers();
				} else {
					setItems([]);
				}
			} catch (error) {
				setItems([]);
				console.log(error);
			}
		};
		if (isOpen) {
			fetchUsers();
		}
	}, [isOpen]);
	// 검색된 유저 필터링
	const filteredItems =
		query === ""
			? []
			: items.filter((item: any) => {
					return item.name.toLowerCase().startsWith(query.toLowerCase());
			  });

	// 친구 추가 소켓 이벤트

	const { friendSocket: socket } = useContext(SocketContext);
	const addFriend = (event: React.MouseEvent<HTMLElement>, item: any) => {
		socket?.emit("addFriend", { friendName: item.name }, (res) => {
			if (res.status) {
				toast.success("친구요청을 성공적으로 보냈습니다.");
			}
			if (!res.status) {
				toast.error(res.message);
			}
		});

	};

	function blockUser(event: React.MouseEvent<HTMLElement>, item: any) {
		event.preventDefault();
		console.log("block user data:", item);
		chatSocket?.emit("toggleBlockUser", {userId: item.id},
		(error: any) => {
			if (error.status === "FATAL") {		
				toast.error(error.message);
				router.push(`/lobby/chat/`);
			}
			else if (error.status === "WARNING") {	
				toast.error(error.message);
			}
			else if (error.status === "OK")
			{
				router.push(`/lobby/chat/dm/dm: ${name}?dmId=${error.directMessageId}`);
			}
		});
	}

	// 채팅방으로 이동
	const { chatSocket } = useContext(SocketContext);

	const createDirectMessage = (id: string, name: string) => {
		chatSocket?.emit("createDirectMessage", {
			receiverId: id,
		}, (error: any) => {
			if (error.status === "FATAL") {		
				toast.error(error.message);
				router.push(`/lobby/chat/`);
			}
			else if (error.status === "ERROR") {	
				toast.error(error.message);
				router.push(`/lobby/chat/`);
			}
			else if (error.status === "WARNING") {	
				toast.error(error.message);
			}
			else if (error.status === "OK")
			{
				router.push(`/lobby/chat/dm/dm: ${name}?dmId=${error.directMessageId}`);
			}
		});

	};

	return (
		<Transition.Root
			show={isOpen}
			as={Fragment}
			afterLeave={() => setQuery("")}
			appear
		>
			<Dialog as="div" className="relative z-50" onClose={setIsOpen}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
				</Transition.Child>

				<div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
							<Combobox
								value={selectedUser}
								onChange={(item: any) => setSelectedUser(item.name)}
							>
								<div className="relative">
									<MagnifyingGlassIcon
										className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
										aria-hidden="true"
									/>
									<Combobox.Input
										className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
										placeholder="Search..."
										onChange={(event) => setQuery(event.target.value)}
									/>
								</div>

								{filteredItems.length > 0 && (
									<Combobox.Options
										static
										className="max-h-96 scroll-py-3 overflow-y-auto p-3"
									>
										{filteredItems.map((item: any) => (
											<Combobox.Option
												key={item.id}
												value={item}
												className="flex cursor-default select-none items-center justify-center rounded-xl p-3"
											>
												<div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-zinc-800">
													<Image
														src={item.avatar || DefaultAvatarPic}
														className="h-6 w-6 text-white"
														alt=""
													/>
												</div>
												<div className="ml-4 mr-auto flex-auto">
													<p className={clsx("text-base font-medium")}>
														{item.name}
													</p>
												</div>
												<div>
													<NormalButton
														variant="dark"
														className="mr-2 border"
														onClick={(e) => addFriend(e, item)}
													>
														친구신청
													</NormalButton>
													<NormalButton
														variant="bright"
														className="mr-2 border"
														onClick={() => createDirectMessage(item.id, item.name)}
													>
														DM
													</NormalButton>
													<NormalButton
														variant="red"
														className="mr-2 border"
														onClick={(e) => { blockUser(e, item) }}
													>
														차단
													</NormalButton>
													<NormalButton
														variant="bright"
														className="border"
														onClick={() => {
															router.push(`/lobby/users/${item.id}`);
															setIsOpen(false);
														}}
													>
														정보
													</NormalButton>
												</div>
											</Combobox.Option>
										))}
									</Combobox.Options>
								)}

								{query !== "" && filteredItems.length === 0 && (
									<div className="px-6 py-14 text-center text-sm sm:px-14">
										<ExclamationCircleIcon
											type="outline"
											name="exclamation-circle"
											className="mx-auto h-6 w-6 text-gray-400"
										/>
										<p className="mt-4 font-semibold text-gray-900">
											유저를 찾을 수 없습니다.
										</p>
										<p className="mt-2 text-gray-500">
											다른 이름으로 검색해보세요.
										</p>
									</div>
								)}
							</Combobox>
						</Dialog.Panel>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
}
