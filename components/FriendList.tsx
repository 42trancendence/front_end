import Link from "next/link";
import Image from "next/image";
import DefaultAvatarPic from "@/public/default_avatar.svg";

export default function FreindList(userData: any) {
	return (
		<>
			{userData.map((user: any) => (
			<li key={user.id}>
				<Link
					href="#"
					className="group flex items-center gap-x-4 rounded-md p-2 text-sm font-normal leading-6 text-indigo-200 hover:bg-zinc-700 hover:text-white"
				>
					<Image
						className="inline-block h-7 w-7 flex-none rounded-full"
						src={DefaultAvatarPic}
						alt=""
					/>
					<span className="flex-auto truncate">{user.name}</span>
					<span className="h-2 w-2 flex-none rounded-full bg-green-500"></span>
				</Link>
			</li>
			))}
		</>
	);
}
