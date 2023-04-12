import Link from "next/link";
import Image from "next/image";
import FreindList from "./FriendList";
import {
	PlayIcon,
	IdentificationIcon,
	UsersIcon,
} from "@heroicons/react/24/outline";
import logoPic from "@/public/42_Logo.svg";

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

const navigation = [
	{
		name: "내 정보",
		href: "/lobby/overview",
		icon: IdentificationIcon,
		current: true,
	},
	{ name: "채팅", href: "/lobby/chat", icon: UsersIcon, current: false },
	{ name: "게임", href: "/lobby/game", icon: PlayIcon, current: false },
];

export default function NavBar(userData: any) {
	return (
		<div className="flex flex-col w-72 h-screen sticky top-0 border-r border-zinc-700">
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
										<Link
											href={item.href}
											className={classNames(
												item.current
													? "bg-white text-zinc-800"
													: "text-indigo-200 hover:text-white hover:bg-zinc-700",
												"group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
											)}
										>
											<item.icon
												className={classNames(
													item.current
														? "text-zinc-800"
														: "text-indigo-200 group-hover:text-white",
													"h-6 w-6 shrink-0"
												)}
												aria-hidden="true"
											/>
											{item.name}
										</Link>
									</li>
								))}
							</ul>
						</li>
						<li>
							<div className="text-xs font-semibold leading-6 text-indigo-200">
								친구
							</div>
							<ul role="list" className="-mx-2 mt-2 space-y-1 p-2 bg-zinc-800 rounded-md">
								<FreindList userData={userData} />
							</ul>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	);
}
