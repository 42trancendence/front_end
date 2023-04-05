import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { XCircleIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

type AlertType = {
	[style: string]: {color: string; icon: typeof CheckCircleIcon};
	success: {color: string; icon: typeof CheckCircleIcon};
	fail: {color: string; icon: typeof XCircleIcon};
};

let alertStyles: AlertType = {
	success: {
		color: "text-green-500",
		icon: CheckCircleIcon,
	},
	fail: {
		color: "text-red-500",
		icon: XCircleIcon,
	},
};

export default function OneLineInform({
	type,
	message,
}: {
	type: string;
	message: string;
}) {
	const Icon = alertStyles[type].icon;
	return (
		<div className="w-full max-w-lg rounded-md bg-zinc-800 p-4 shadow-lg">
			<div className="flex">
				<div className="flex-shrink-0">
					<Icon
						className={clsx("h-5 w-5", alertStyles[type].color)}
						aria-hidden="true"
					/>
				</div>
				<div className="ml-3">
					<p className={clsx("text-sm font-medium", alertStyles[type].color)}>
						{message}
					</p>
				</div>
			</div>
		</div>
	);
}
