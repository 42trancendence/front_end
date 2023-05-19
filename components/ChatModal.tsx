import Link from "next/link";
import Image from "next/image";
import DefaultAvatarPic from "@/public/default_avatar.svg";
import clsx from "clsx";
import { Fragment, useContext } from "react";
import { toast } from "react-toastify";
import { Menu, Transition } from "@headlessui/react";
import { SocketContext } from "@/lib/socketContext";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCertificate, faCrown } from "@fortawesome/free-solid-svg-icons";
import { NotifyContext } from "@/lib/notifyContext";
import { useRouter } from "next/router";

export default function ChatModal({
	userData,
	userMe,
}: {
	userData: any;
	userMe: any;
}) {
	const { chatSocket: socket } = useContext(SocketContext);
	const { gameSocket: gameSocket } = useContext(SocketContext);
	const me = userMe[0];
	const router = useRouter();

	function KickUser(event: React.MouseEvent<HTMLElement>, item: any) {
		event.preventDefault();
		socket?.emit("kickUser", {userId: item.id}, (error: any) => {
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
				toast.success("요청을 성공적으로 처리했습니다!")
			}
		});
	}

	function BanUser(event: React.MouseEvent<HTMLElement>, item: any) {
		event.preventDefault();
		socket?.emit("toggleBanUser", {userId: item.id}, (error) => {
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
				toast.success("요청을 성공적으로 처리했습니다!")
			}
		});
	}

	function MuteUser(event: React.MouseEvent<HTMLElement>, item: any) {
		event.preventDefault();
		socket?.emit("setMuteUser", {userId: item.id}, (error) => {
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
				toast.success("요청을 성공적으로 처리했습니다!")
			}
		});
	}

	function SetAdmin(event: React.MouseEvent<HTMLElement>, item: any) {
		event.preventDefault();
		socket?.emit("setAdmin", {userId: item.id}, (error) => {
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
				toast.success("요청을 성공적으로 처리했습니다!")
			}
		});
	}

	const createDirectMessage = (id: string, name: string) => {
		socket?.emit("createDirectMessage", {
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

	// 게임 초대 이벤트
	const inviteUserForGame = (event: React.MouseEvent<HTMLElement>, item: any) => {
		gameSocket?.emit("inviteUserForGame", { userName: item.name });
	};

	return userData.map((user: any, index: number) => (
		me ?
		<Menu as="li" key={index} className={clsx(!user.isEntered && "opacity-50", "group")}>
			<div className="bg-black"></div>
			<Menu.Button className="group flex w-full items-center gap-x-4 rounded-md p-2 text-sm font-normal leading-6 text-indigo-200 hover:bg-zinc-700 hover:text-white">
				<img
					className="inline-block h-6 w-6 flex-none rounded-full"
					src={user.user.avatarImageUrl}
					alt=""
					width={28}
					height={28}
				/>
				<span className="mr-auto">{user.user.name}</span>
				{user.role === 0 ? (
					<FontAwesomeIcon
						icon={faCrown}
						className="ml-auto h-4 w-4 text-yellow-500"
					/>
				) : user.role === 1 ? (
					<FontAwesomeIcon
						icon={faCertificate}
						className="ml-auto h-4 w-4 text-green-600"
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
									onClick={() => router.push(`/lobby/users/${user.user.id}`)}
								>
									유저 정보
								</button>
							)}
						</Menu.Item>
						{me.user.name !== user.user.name && (
							<Menu.Item>
								{({ active }) => (
									<button
										className={clsx(
											active ? "bg-gray-100 text-gray-700" : "text-white",
											"block w-full px-4 py-2 text-sm"
										)}
										onClick={(e) => createDirectMessage(user.user.id, user.user.name)}
									>
										1:1 채팅
									</button>
								)}
							</Menu.Item>
						)}
						{me.user.name !== user.user.name && (
							<Menu.Item>
								{({ active }) => (
									<button
										className={clsx(
											active ? "bg-gray-100 text-gray-700" : "text-white",
											"block w-full px-4 py-2 text-sm"
										)}
										onClick={(e) => { inviteUserForGame(e, user.user) }}
									>
										게임 초대
									</button>
								)}
							</Menu.Item>
						)}
						{(me.role === 0 || me.role === 1) &&
						me.user.name !== user.user.name ? (
							<>
								<Menu.Item>
									{({ active }) => (
										<button
											className={clsx(
												active ? "bg-gray-100 text-gray-700" : "text-white",
												"block w-full px-4 py-2 text-sm"
											)}
											onClick={(e) => SetAdmin(e, user.user)}
										>
											관리자 임명
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
												active
													? "bg-red-400 text-white"
													: "bg-red-500 text-white",
												"block w-full rounded-b px-4 py-2 text-sm"
											)}
											onClick={(e) => BanUser(e, user.user)}
										>
											BAN
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
