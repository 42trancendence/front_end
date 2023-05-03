import Layout from "@/components/Layout";
import Image from "next/image";
import DefaultAvatar from "@/public/default_avatar.svg";
import ProfileBackground from "@/public/profile_background.jpg";
import { NormalButton } from "@/components/ui/NormalButton";
import { ReactElement, useContext, useEffect, useState } from "react";
import { handleRefresh } from "@/lib/auth-client";
import {
	SocketContext,
	SocketProvider,
} from "@/lib/socketContext";
import { NextPageWithLayout } from "../../_app";
import OverviewSkeleton from "@/components/ui/OverviewSkeleton";
import router, { useRouter } from "next/router";
import Seo from "@/components/Seo";
import EditProfilePallet from "@/components/EditProfilePallet";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

const UserInfo: NextPageWithLayout = () => {
	const [username, setUsername] = useState("");
	const [avatar, setavatarUrl] = useState(DefaultAvatar);
	const [userData, setuserData] = useState({});
	const [isEditOpen, setisEditOpen] = useState(false);
	const [isUserDataLoaded, setisUserDataLoaded] = useState(false);

	const router = useRouter();
	const { id } = router.query;

	const { friendSocket } = useContext(SocketContext);
	useEffect(() => {
		if (friendSocket) {
			friendSocket.emit("updateActiveStatus", 1);
		}
	}, [friendSocket]);

	return (
		<>
			<Seo title="UserInfo" />
			<div className="relative flex flex-1 flex-col">
				<div>
					<Image
						className="h-48 w-full rounded-lg object-cover brightness-95 drop-shadow lg:h-56"
						src={ProfileBackground}
						alt=""
					/>
				</div>
				<div className="-mt-12 flex space-x-5 self-center sm:-mt-16">
					<div className="z-20 flex">
						<Image
							className="h-24 w-24 rounded-full bg-zinc-800 shadow ring-8 ring-zinc-800 sm:h-32 sm:w-32"
							src={avatar}
							alt=""
							width={300}
							height={300}
						/>
					</div>
				</div>
				{!isUserDataLoaded ? (
					<OverviewSkeleton /> // 로딩중일때
				) : (
					<div className="z-10 -mt-6 grid w-full sm:w-3/4 grid-cols-1 gap-3 self-center rounded bg-zinc-800 p-6 text-center shadow-neumreverse lg:grid-cols-3">
						<div className="flex divide-x divide-zinc-400">
							<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
								<p className="text-zinc-400">Total games</p>
								<p className="text-lg font-semibold">100</p>
							</div>
							<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
								<p className="text-zinc-400">Win</p>
								<p className="text-lg font-semibold">50</p>
							</div>
							<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
								<p className="text-zinc-400">Lose</p>
								<p className="text-lg font-semibold">50</p>
							</div>
						</div>
						<div className="m-auto flex">
							<div className="text-2xl font-bold">
								<p className="text-white">{username}</p>
							</div>
						</div>
						<div className="ml-auto gap-2 flex divide-x divide-zinc-400">
							<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm">
								<p className="text-zinc-400">Achievement</p>
								<p className="text-lg font-semibold">1</p>
							</div>
							<div className="flex w-24 flex-col items-center justify-center space-y-3 text-sm"></div>
						</div>
					</div>
				)}
				<div className="mt-8 flex flex-grow flex-col items-center justify-center rounded-lg border border-zinc-500 px-6 py-14 text-center text-sm sm:px-14">
					<ExclamationCircleIcon
						type="outline"
						name="exclamation-circle"
						className="mx-auto h-6 w-6 text-gray-400"
					/>
					<p className="mt-4 font-semibold text-zinc-400">
						전적이 존재하지 않습니다.
					</p>
					<p className="mt-2 text-zinc-500">
						게임을 플레이 하여 전적을 확인할 수 있습니다!
					</p>
				</div>
			</div>
		</>
	);
};

UserInfo.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
			<Layout>{page}</Layout>
		</SocketProvider>
	);
};

export default UserInfo;
