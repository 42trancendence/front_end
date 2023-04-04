import Link from "next/link";
import clsx from "clsx";

type StyleType = {
	[style: string]: string;
	bright: string;
	dark: string;
};

let variantStyles: StyleType = {
	bright: "bg-white text-zinc-800 shadow",
	dark: "bg-zinc-800 text-white shadow",
};

export function NormalButton({
	children,
	variant = "bright",
	className,
	href,
  onClick,
  ...props
}: {
  children: React.ReactNode,
	variant: string,
	className: string,
	href?: string,
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}) {
	className = clsx(
		"text-md inline-flex items-center gap-2 justify-center whitespace-nowrap rounded px-4 py-2.5 outline-offset-2 transition active:transition-none",
		variantStyles[variant],
		className
	);

	return href ? (
		<Link href={href} className={className} {...props}>
			{children}
		</Link>
	) : (
		<button type="button" className={className} onClick={onClick} {...props}>
			{children}
		</button>
	);
}
