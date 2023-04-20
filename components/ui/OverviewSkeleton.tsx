export default function OverviewSkeleton() {
	return (
			<div className="-mt-6 bg-zinc-800 rounded z-10 h-18 grid w-3/4 grid-cols-1 gap-3 self-center shadow-neumreverse lg:grid-cols-3 p-6">
				<div className="animate-pulse h-10 w-full bg-zinc-700 rounded"></div>
				<div className="animate-pulse m-auto h-10 w-2/3 bg-zinc-700 rounded"></div>
				<div className="animate-pulse ml-auto h-10 w-full bg-zinc-700 rounded"></div>
			</div>
	);
}
