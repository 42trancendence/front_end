import { Combobox, Dialog, Transition } from "@headlessui/react";
import {
	ExclamationCircleIcon,
} from "@heroicons/react/20/solid";
import Badge from "@/public/achievement_badge.svg";
import { Fragment, useEffect, useState } from "react";
import { handleRefresh } from "@/lib/auth-client";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Achievements({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: any;
}) {
	const [query, setQuery] = useState("");
	const [items, setItems] = useState<any>([]);
	// 모든 유저 검색
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/users`, {
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
					<div className="fixed inset-0 bg-zinc-500 bg-opacity-25 transition-opacity" />
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
						<Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-zinc-900 shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
							<div className="px-4 py-3.5">
								<div className="relative">
									<div className="font-orbitron text-lg font-bold text-zinc-200 pb-4">
										Achievements
									</div>
								</div>
								{filteredItems.length > 0 && (
									<div className="px-6 py-4 bg-zinc-800">
										<div className="flex w-full">
											<div className="mr-4 flex-shrink-0">
												<Image src={Badge} alt="" className="h-16 w-16" />
											</div>
											<div>
												<h4 className="text-lg font-orbitron font-bold text-zinc-200">최다 승리!</h4>
												<p className="mt-1 text-zinc-400">
												게임 승리 횟수가 가장 많은 유저에게 부여되는 업적입니다.
												</p>
											</div>
										</div>
									</div>
								)}
								{query === "" && filteredItems.length === 0 && (
									<div className="px-6 py-14 text-center text-sm sm:px-14">
										<ExclamationCircleIcon
											type="outline"
											name="exclamation-circle"
											className="mx-auto h-6 w-6 text-zinc-200"
										/>
										<p className="mt-4 font-semibold text-zinc-200">
											달성한 업적이 없습니다.
										</p>
										<p className="mt-2 text-zinc-300">
											게임을 플레이하여 업적을 달성해보세요!
										</p>
									</div>
								)}
							</div>
						</Dialog.Panel>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
}
