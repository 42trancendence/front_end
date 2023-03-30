import { Dialog } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function MyDialog({
	dialogText,
	isOpen,
	setIsOpen,
}: {
	dialogText: string;
	isOpen: boolean;
	setIsOpen: any;
}) {
	return (
		<Dialog
			open={isOpen}
			onClose={() => setIsOpen(false)}
			className="relative z-50"
		>
			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div
				className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
				aria-hidden="true"
			/>
			<div className="fixed inset-0 z-10 overflow-y-auto">
				<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
						<div className="sm:flex sm:items-start">
							<div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
								<ExclamationTriangleIcon
									className="h-6 w-6 text-red-600"
									aria-hidden="true"
								/>
							</div>
							<div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
								<Dialog.Title
									as="h3"
									className="text-base font-semibold leading-6 text-gray-900"
								>
									뭐야 왜 안돼
								</Dialog.Title>
								<div className="mt-2">
									<p className="text-sm text-gray-500">{dialogText}</p>
								</div>
							</div>
						</div>
						<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
							<button
								className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
								onClick={() => setIsOpen(false)}
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
