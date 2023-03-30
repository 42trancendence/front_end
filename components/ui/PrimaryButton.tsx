import Link from "next/link";

export default function PrimaryButton({
	type,
	link,
	text,
}: {
	type: string;
	link?: string;
	text: string;
}) {
	function MyButton() {
		return (
			<button className="bg-white px-12 py-4 text-lg font-semibold tracking-wider text-zinc-900 shadow-bt shadow-white/40 border hover:bg-zinc-100">
				{text}
			</button>
		);
	}

	function MyLink() {
		return (
			<Link
				href={link || "#"}
				className="bg-white px-12 py-4 text-lg font-semibold tracking-wider text-zinc-900 shadow-bt shadow-white/40 border hover:bg-zinc-100"
			>
				{text}
			</Link>
		);
	}
	return (
	<>
		{(type === "button" && MyButton()) || (type === "link" && MyLink())}
	</>
	);
}

