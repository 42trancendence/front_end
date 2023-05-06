import { Fragment, useContext, useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { SocketContext } from "@/lib/socketContext";
import usePersistentState from "@/components/canvas/usePersistentState";
import { useRouter } from "next/router";

interface UserData {
	id: string;
	name: string;
	avatar: string;
}

export default function GameNotification() {
	const [showGameNotification, setShowGameNotification] = useState(false);
	const [userData, setuserData] = useState<any>({});
	// 소켓 연결
	const { gameSocket } = useContext(SocketContext);
	const [onGame, setOnGame] = usePersistentState('onGame', false);
	const router = useRouter();

	useEffect(() => {
		if (gameSocket) {
			gameSocket.on("requestMatching", (data) => {
				console.log("requestMatching", data);
				setShowGameNotification(true);
				setuserData(data);
			});
		}
	}, [gameSocket]);

	// 게임 요청 수락
	const acceptGame = (event: React.MouseEvent<HTMLElement>) => {
		gameSocket?.emit("acceptGameRequest");
		setOnGame(true);
		setShowGameNotification(false);
		router.push(`/`);
	};
	// 게임 요청 거절
	const rejectGame = (event: React.MouseEvent<HTMLElement>) => {
		gameSocket?.emit("rejectGameRequest");
		setOnGame(false);
		setShowGameNotification(false);
	};
	return (
		<>
			<div
				aria-live="assertive"
				className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6"
			>
				<div className="flex w-full flex-col items-center space-y-4 sm:items-end">
					{/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
					<Transition
						show={showGameNotification}
						as={Fragment}
						enter="transform ease-out duration-300 transition"
						enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
						enterTo="translate-y-0 opacity-100 sm:translate-x-0"
						leave="transition ease-in duration-100"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="pointer-events-auto w-full max-w-sm rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
							<div className="p-4">
								<div className="flex items-start">
									<div className="flex-shrink-0 pt-0.5">
										<Image
											className="h-10 w-10 rounded-full"
											src="/default-avatar.svg"
											width={160}
											height={160}
											alt=""
										/>
									</div>
									<div className="ml-3 w-0 flex-1">
										<p className="text-sm font-medium text-gray-900">
											{userData?.name}
										</p>
										<p className="mt-1 text-sm text-gray-500">
											1:1게임 요청을 수락하시겠습니까?
										</p>
										<div className="mt-4 flex">
											<button
												type="button"
												className="inline-flex items-center rounded-md bg-indigo-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
												onClick={acceptGame}
											>
												수락
											</button>
											<button
												type="button"
												className="ml-3 inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
												onClick={rejectGame}
											>
												거절
											</button>
										</div>
									</div>
									<div className="ml-4 flex flex-shrink-0">
										<button
											type="button"
											className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
											onClick={() => {
												setShowGameNotification(false);
											}}
										>
											<span className="sr-only">Close</span>
											<XMarkIcon className="h-5 w-5" aria-hidden="true" />
										</button>
									</div>
								</div>
							</div>
						</div>
					</Transition>
				</div>
			</div>
		</>
	);
}
