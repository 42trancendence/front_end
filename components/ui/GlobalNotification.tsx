import { Fragment, useContext, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { NotifyContext } from '@/lib/notifyContext';
import clsx from 'clsx';

export default function GlobalNotification() {
	// Context 사용
	const { show, isSuccessed, header, message, close } = useContext(NotifyContext);

	// 3초 후 알림창 닫기
	useEffect(() => {
		if (show) {
			setTimeout(() => {
				close();
			}, 3000);
		}
	}, [close, show]);

	return (
		<>
			{/* Global notification live region, render this permanently at the end of the document */}
			<div
				aria-live="assertive"
				className="pointer-events-none fixed inset-0 z-100 flex items-end px-4 py-6 sm:items-start sm:p-6"
			>
				<div className="flex w-full flex-col items-center space-y-4 sm:items-end">
					{/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
					<Transition
						show={show}
						as={Fragment}
						enter="transform ease-out duration-300 transition"
						enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
						enterTo="translate-y-0 opacity-100 sm:translate-x-0"
						leave="transition ease-in duration-0"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
							<div className="p-4">
								<div className="flex items-start">
									<div className="flex-shrink-0">
										<CheckCircleIcon className={clsx("h-6 w-6", isSuccessed ? "text-green-500" : "text-red-500")} aria-hidden="true" />
									</div>
									<div className="ml-3 w-0 flex-1 pt-0.5">
										<p className="text-sm font-medium text-gray-900">{header}</p>
										<p className="mt-1 text-sm text-gray-500">{message}</p>
									</div>
									<div className="ml-4 flex flex-shrink-0">
										<button
											type="button"
											className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
											onClick={close}
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
	)
}
