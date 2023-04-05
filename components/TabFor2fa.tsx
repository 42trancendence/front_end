import { Tab } from "@headlessui/react";
import { EnvelopeIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

export default function TabFor2fa({
	className,
	tapnames,
	children,
}: {
	className?: string;
	tapnames: string[];
	children: React.ReactNode;
}) {
	className = clsx("m-auto w-full max-w-lg", className);
	return (
		<div className={className}>
			<Tab.Group>
				<Tab.List className="flex space-x-2">
					{Object.keys(tapnames).map((tapIndex) => (
						<Tab
							key={tapIndex}
							className={({ selected }) =>
								classNames(
									"text-md inline-flex w-full items-center justify-center py-2.5 font-medium leading-5 text-zinc-800 shadow-dual",
									selected
										? "bg-white shadow"
										: "bg-zinc-500 text-white hover:bg-white/[0.12]"
								)
							}
						>
							{tapnames[parseInt(tapIndex)] === "Email" ? (
								<EnvelopeIcon className="mr-3 h-5 w-5" />
							) : (
								<QrCodeIcon className="mr-3 h-5 w-5" />
							)}
							{tapnames[parseInt(tapIndex)]} 인증
						</Tab>
					))}
				</Tab.List>
				<Tab.Panels className="relative mt-8">{children}</Tab.Panels>
			</Tab.Group>
		</div>
	);
}
