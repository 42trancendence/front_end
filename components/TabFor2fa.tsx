import { Tab } from "@headlessui/react";
function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

export default function TabFor2fa({
	tapnames,
	children,
}: {
	tapnames: string[];
	children: React.ReactNode;
}) {
	return (
		<div className="m-auto w-full max-w-lg px-2 py-16 sm:px-0">
			<Tab.Group>
				<Tab.List className="flex space-x-2">
					{Object.keys(tapnames).map((tapIndex) => (
						<Tab
							key={tapIndex}
							className={({ selected }) =>
								classNames(
									"text-md w-full py-2.5 font-medium leading-5 text-zinc-800 shadow-dual",
									selected
										? "bg-white shadow"
										: "bg-zinc-500 text-white hover:bg-white/[0.12]"
								)
							}
						>
							{tapnames[parseInt(tapIndex)]}
						</Tab>
					))}
				</Tab.List>
				<Tab.Panels className="mt-4">{children}</Tab.Panels>
			</Tab.Group>
		</div>
	);
}
