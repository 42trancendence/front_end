import Link from "next/link";
import Image from "next/image";
import FreindList from "./FriendList";
import {
	PlayIcon,
	IdentificationIcon,
	UsersIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import logoPic from "@/public/42_Logo.svg";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "@/lib/socketContext";
import { Dialog } from "@headlessui/react";
import SearchBox from "./SerachBox";

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
		name: "내 정보",
		href: "/lobby/overview",
		icon: IdentificationIcon,
	},
	{ name: "채팅", href: "/lobby/chat", icon: UsersIcon },
	{ name: "게임", href: "/lobby/game", icon: PlayIcon },
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
	function SearchUsers() {
		setIsSerchBoxOpen(true);
	}

	return (
		<>
			<SearchBox isOpen={isSerchBoxOpen} setIsOpen={setIsSerchBoxOpen} />
			<div className="sticky top-0 flex h-screen w-72 flex-col border-r border-zinc-700">
				<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-zinc-900 px-6">
					<div className="flex h-16 shrink-0 items-center">
						<Image className="h-8 w-auto" src={logoPic} alt="Your Company" />
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
								<button
									type="button"
									className="-mx-2 flex w-full cursor-pointer flex-row items-center rounded-md bg-zinc-800 py-2 pl-2 pr-3 text-center text-sm leading-6 text-slate-300"
									onClick={SearchUsers}
								>
									<MagnifyingGlassIcon className="mr-3 h-5 w-5" />
									<p>유저 검색...</p>
								</button>
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
						</ul>
					</nav>
				</div>
			</div>
		</>
	);
}
