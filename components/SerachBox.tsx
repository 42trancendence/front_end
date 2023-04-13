import { Combobox, Dialog, Transition } from "@headlessui/react";
import { ExclamationCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import DefaultAvatarPic from "@/public/default_avatar.svg";
import { Fragment, useEffect, useState } from "react";

export default function SearchBox({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: any;
}) {
	const [query, setQuery] = useState("");
	const [items, setItems] = useState<any>([]);
	useEffect(() => {
		const fetchItems = async () => {
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
				} else {
					setItems([]);
				}
			} catch (error) {
				setItems([]);
				console.log(error);
			}
		};
		fetchItems();
	}, []);
	const filteredItems =
		query === ""
			? []
			: items.filter((item) => {
					return item.name.toLowerCase().includes(query.toLowerCase());
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
							<Combobox>
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
										{filteredItems.map((item) => (
											<Combobox.Option
												key={item.id}
												value={item}
												className={({ active }: {active: boolean}) =>
													clsx(
														"flex cursor-default select-none rounded-xl p-3",
														active && "bg-gray-100"
													)
												}
											>
												{({ active }) => (
													<>
														<div
															className="flex h-10 w-10 flex-none items-center justify-center rounded-full"
														>
															<DefaultAvatarPic
																className="h-6 w-6 text-white"
																aria-hidden="true"
															/>
														</div>
														<div className="ml-4 flex-auto">
															<p
																className={clsx(
																	"text-base font-medium",
																	active ? "text-gray-900" : "text-gray-700"
																)}
															>
																{item.name}
															</p>
														</div>
													</>
												)}
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
											No results found
										</p>
										<p className="mt-2 text-gray-500">
											No components found for this search term. Please try
											again.
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
