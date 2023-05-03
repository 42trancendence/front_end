import Link from "next/link";
import Image from "next/image";
import DefaultAvatarPic from "@/public/default_avatar.svg";
import clsx from "clsx";
import { Fragment, useContext } from "react";
import { Menu, Transition } from "@headlessui/react";
import { SocketContext } from "@/lib/socketContext";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCertificate, faCrown } from "@fortawesome/free-solid-svg-icons";

export default function ChatModal({ userData }: any) {
	const { chatSocket: socket } = useContext(SocketContext);

	function KickUser(event: React.MouseEvent<HTMLElement>, item: any) {
		event.preventDefault();
		socket?.emit("kickUser", item.name);
	}

	function BanUser(event: React.MouseEvent<HTMLElement>, item: any) {
		event.preventDefault();
		socket?.emit("toggleBanUser", item.name);
	}

	function MuteUser(event: React.MouseEvent<HTMLElement>, item: any) {
		event.preventDefault();
		socket?.emit("setMuteUser", item.name);
	}

	return userData.map((user: any, index: number) => (
		<Menu as="li" key={index}>
			<div className="bg-black"></div>
			<Menu.Button className="group flex w-full items-center gap-x-4 rounded-md p-2 text-sm font-normal leading-6 text-indigo-200 hover:bg-zinc-700 hover:text-white">
				<Image
					className="inline-block h-7 w-7 flex-none rounded-full"
					src={DefaultAvatarPic}
					alt=""
				/>
				<span className="mr-auto">{user.user.name}</span>
				{user.role === "OWNER" ? (
					<FontAwesomeIcon
						icon={faCrown}
						className="ml-auto h-5 w-5 text-yellow-500"
					/>
				) : user.role === "ADMIN" ? (
					<FontAwesomeIcon
						icon={faCertificate}
						className="ml-auto h-5 w-5 text-green-600"
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
									className={clsx(
										active ? "bg-gray-100 text-gray-700" : "text-white",
										"block w-full rounded-t px-4 py-2 text-sm"
									)}
								>
									유저 정보
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
									onClick={(e) => MuteUser(e, user.user)}
								>
									게임 초대
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
									onClick={(e) => KickUser(e, user.user)}
								>
									KICK
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
									onClick={(e) => MuteUser(e, user.user)}
								>
									MUTE
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
								>
									BAN
								</button>
							)}
						</Menu.Item>
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	));
}
