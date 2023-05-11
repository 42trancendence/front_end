export default function MiniLoading() {
	return (
		<>
			<div className="absolute inset-0 z-10 bg-zinc-900 bg-opacity-75 transition-opacity rounded-full" />
			<div className="absolute inset-0 z-10 flex items-center justify-center">
				<div className="h-1 w-1 rounded-full bg-zinc-100 p-1 animate-[bounce_1s_infinite] delay-100"></div>
				<div className="h-1 w-1 rounded-full bg-zinc-100 p-1 animate-[bounce_1.2s_infinite] delay-200"></div>
				<div className="h-1 w-1 rounded-full bg-zinc-100 p-1 animate-[bounce_1.3s_infinite] delay-300"></div>
			</div>
		</>
	);
}
