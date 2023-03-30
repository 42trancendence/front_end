import NavBar from "./NavBar";

export default function Layout({children}: {children:React.ReactNode}) {
	return (
		<div className="flex bg-zinc-800">
			<NavBar />
			<div className="">
				{children}
			</div>
		</div>
	)
}
