import { Dialog } from "@headlessui/react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import DefaultAvatarPic from "@/public/default_avatar.svg";

type AlertType = {
	[style: string]: {color: string; icon: typeof CheckCircleIcon};
	success: {color: string; icon: typeof CheckCircleIcon};
	fail: {color: string; icon: typeof ExclamationTriangleIcon};
};

let alertStyles: AlertType = {
	success: {
		color: "bg-green-500",
		icon: CheckCircleIcon,
	},
	fail: {
		color: "bg-red-500",
		icon: ExclamationTriangleIcon,
	},
};

export default function ResultDialog({
	type,
	user1,
	user2,
	score,
	isOpen,
	setIsOpen,
	closeCallback,
}: {
	type?: string,
	user1: string,
	user2: string,
	score: number[],
	isOpen: boolean;
	setIsOpen: any;
	closeCallback?: any;
}) {
	return (
		<Dialog
			open={isOpen}
			onClose={() => {
				setIsOpen(false);
				if (closeCallback) {
					closeCallback();
				}
			}}
			className="relative z-100"
		>
			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div
				className="fixed inset-0 bg-zinc-900 bg-opacity-90 transition-opacity"
				aria-hidden="true"
			/>
			<div className="fixed inset-0 z-10 overflow-y-auto font-orbitron">
				<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<Dialog.Panel className="relative overflow-hidden rounded-lg flex flex-col items-center justify-center bg-zinc-800 p-4 shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
						<div className="flex flex-col gap-4 items-center justify-center">
							<Dialog.Title
								as="h3"
								className="text-base font-semibold leading-6 text-white"
							>
								Result
							</Dialog.Title>
							<div className="flex flex-row gap-4 items-center justify-center text-zinc-200">
								<div className="flex flex-col gap-2 justify-center items-center">
									<Image src={DefaultAvatarPic} className="h-8 w-8" alt="" />
									<p className="text-lg">{user1}</p>
									<p className="text-xl mt-2">{score[0]}</p>
								</div>
								<p className="text-lg">:</p>
								<div className="flex flex-col gap-2 justify-center items-center">
									<Image src={DefaultAvatarPic} className="h-8 w-8" alt="" />
									<p className="text-lg">{user2}</p>
									<p className="text-xl mt-2">{score[1]}</p>
								</div>
							</div>
						</div>
						<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
							<button
								className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
								onClick={() => {
									setIsOpen(false);
									if (closeCallback) {
										closeCallback();
									}
								}}
							>
								Close
							</button>
						</div>
					</Dialog.Panel>
				</div>
			</div>
		</Dialog>
	);
}
