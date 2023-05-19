import Link from "next/link";
import FreindList from "./FriendList";
import {
	PlayIcon,
	IdentificationIcon,
	UsersIcon,
	MagnifyingGlassIcon,
	ArrowLeftOnRectangleIcon,
	XMarkIcon,
	Bars3Icon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { Fragment, useContext, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import SearchBox from "./SerachBox";
import { NotifyContext } from "@/lib/notifyContext";
import { SocketContext } from "@/lib/socketContext";

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

interface NavigationItem {
	name: string;
	href: string;
	icon: any;
}

const navigation = [
	{
		name: "로비",
		href: "/lobby/overview",
		icon: IdentificationIcon,
	},
	{ name: "채팅", href: "/lobby/chat", icon: UsersIcon },
];

function NavItem({ item }: { item: NavigationItem }) {
	let isActive = useRouter().pathname === item.href;

	return (
		<Link
			href={item.href}
			className={classNames(
				isActive
					? "bg-white text-zinc-800"
					: "text-indigo-200 hover:bg-zinc-700 hover:text-white",
				"group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
			)}
		>
			<item.icon
				className={classNames(
					isActive ? "text-zinc-800" : "text-indigo-200 group-hover:text-white",
					"h-6 w-6 shrink-0"
				)}
				aria-hidden="true"
			/>
			{item.name}
		</Link>
	);
}

export default function NavBar({ userData }: any) {
	const [isSerchBoxOpen, setIsSerchBoxOpen] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const router = useRouter();

	function SearchUsers() {
		setIsSerchBoxOpen(true);
	}

	const logout = () => {
		const doLogout = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/auth/logout`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});
				if (res.ok) {
					localStorage.removeItem("token");
					router.push("/");
				} else {
					return null;
				}
			} catch (error) {
				console.log(error);
				localStorage.removeItem("token");
				router.push("/");
			}
		};
		doLogout();
	};

	const { friendSocket, chatSocket } = useContext(SocketContext);
	const { successed } = useContext(NotifyContext);

	useEffect(() => {
		function onSuccessed(name: string, type:string, message: string, id: string, avatarImageUrl: string) {
			successed({
				header: name,
				type: type,
				message: message,
				id: id,
				avatarImageUrl: avatarImageUrl,
			});
		}
		chatSocket?.on("newDirectMessage", (data) => {
			onSuccessed(data.name, "chat", data.message, data.id, data.avatarImageUrl);
		});

		return () => {
			chatSocket?.off("newDirectMessage");
		};
	}, [chatSocket, successed]);

	return (
		<>
			<SearchBox isOpen={isSerchBoxOpen} setIsOpen={setIsSerchBoxOpen} />
			{/* Desktop */}
			<div className="sticky top-0 z-40 flex items-center gap-x-6 bg-zinc-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
				<button
					type="button"
					className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
					onClick={() => setSidebarOpen(true)}
				>
					<span className="sr-only">Open sidebar</span>
					<Bars3Icon className="h-6 w-6" aria-hidden="true" />
				</button>
				<Link
					href="/lobby/overview"
					className="m-auto font-orbitron text-lg font-bold text-zinc-200"
				>
					TRANS-PONG
				</Link>
			</div>
			<div className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-r lg:border-zinc-700">
				<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-zinc-900 px-6">
					<div className="flex h-16 shrink-0 items-center">
						<Link
							href="/lobby/overview"
							className="font-orbitron text-xl font-bold text-zinc-200"
						>
							TRANS-PONG
						</Link>
					</div>
					<nav className="flex flex-1 flex-col">
						<ul role="list" className="flex flex-1 flex-col gap-y-7">
							<li>
								<ul role="list" className="-mx-2 space-y-1">
									{navigation.map((item) => (
										<li key={item.name}>
											<NavItem item={item} />
										</li>
									))}
								</ul>
							</li>
							<li>
								<div className="-mx-2">
									<button
										type="button"
										className="flex w-full cursor-pointer flex-row items-center gap-3 rounded-md bg-zinc-800 p-2 text-sm leading-6 text-slate-300"
										onClick={SearchUsers}
									>
										<MagnifyingGlassIcon className="h-5 w-5 shrink-0" />
										<p>유저 검색...</p>
									</button>
								</div>
							</li>
							<li>
								<div className="text-xs font-semibold leading-6 text-indigo-200">
									친구
								</div>
								<ul
									role="list"
									className="-mx-2 mt-2 space-y-1 rounded-md bg-zinc-800 p-2"
								>
									<FreindList userData={userData} />
								</ul>
							</li>
							<li className="mb-4 mt-auto">
								<button
									type="button"
									className="text-md flex items-center justify-center font-bold text-zinc-400 hover:text-zinc-200"
									onClick={logout}
								>
									<ArrowLeftOnRectangleIcon className="h-6 w-6" />
									<span className="ml-2">로그아웃</span>
								</button>
							</li>
						</ul>
					</nav>
				</div>
			</div>

			{/* Mobile */}
			<Transition.Root show={sidebarOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-50 lg:hidden"
					onClose={setSidebarOpen}
				>
					<Transition.Child
						as={Fragment}
						enter="transition-opacity ease-linear duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="transition-opacity ease-linear duration-300"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-gray-900/80" />
					</Transition.Child>
					<div className="fixed inset-0 flex">
						<Transition.Child
							as={Fragment}
							enter="transition ease-in-out duration-300 transform"
							enterFrom="-translate-x-full"
							enterTo="translate-x-0"
							leave="transition ease-in-out duration-300 transform"
							leaveFrom="translate-x-0"
							leaveTo="-translate-x-full"
						>
							<Dialog.Panel className="relative mr-16 flex w-full max-w-xs border-r border-zinc-700">
								<Transition.Child
									as={Fragment}
									enter="transition ease-in-out duration-300 transform"
									enterFrom="-translate-x-full"
									enterTo="translate-x-0"
									leave="transition ease-in-out duration-300 transform"
									leaveFrom="translate-x-0"
									leaveTo="-translate-x-full"
								>
									<div className="absolute left-full top-0 flex w-16 justify-center pt-5">
										<button
											type="button"
											className="-m-2.5 p-2.5"
											onClick={() => setSidebarOpen(false)}
										>
											<span className="sr-only">Close sidebar</span>
											<XMarkIcon
												className="h-6 w-6 text-white"
												aria-hidden="true"
											/>
										</button>
									</div>
								</Transition.Child>
								<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-zinc-900 px-6">
									<div className="flex h-16 shrink-0 items-center">
										<Link
											href="/lobby/overview"
											className="font-orbitron text-xl font-bold text-zinc-200"
										>
											TRANS-PONG
										</Link>
									</div>
									<nav className="flex flex-1 flex-col">
										<ul role="list" className="flex flex-1 flex-col gap-y-7">
											<li>
												<ul role="list" className="-mx-2 space-y-1">
													{navigation.map((item) => (
														<li key={item.name}>
															<NavItem item={item} />
														</li>
													))}
												</ul>
											</li>
											<li>
												<div className="-mx-2">
													<button
														type="button"
														className="flex w-full cursor-pointer flex-row items-center gap-3 rounded-md bg-zinc-800 p-2 text-sm leading-6 text-slate-300"
														onClick={SearchUsers}
													>
														<MagnifyingGlassIcon className="h-5 w-5 shrink-0" />
														<p>유저 검색...</p>
													</button>
												</div>
											</li>
											<li>
												<div className="text-xs font-semibold leading-6 text-indigo-200">
													친구
												</div>
												<ul
													role="list"
													className="-mx-2 mt-2 space-y-1 rounded-md bg-zinc-800 p-2"
												>
													<FreindList userData={userData} />
												</ul>
											</li>
											<li className="mb-4 mt-auto">
												<button
													type="button"
													className="text-md flex items-center justify-center font-bold text-zinc-400 hover:text-zinc-200"
													onClick={logout}
												>
													<ArrowLeftOnRectangleIcon className="h-6 w-6" />
													<span className="ml-2">로그아웃</span>
												</button>
											</li>
										</ul>
									</nav>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</Dialog>
			</Transition.Root>
		</>
	);
}
