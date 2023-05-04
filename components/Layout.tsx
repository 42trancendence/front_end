import {
	checkIsLoggedIn,
	isTwoFactorAuthEnabled,
} from "@/utils/Authentication";
import { useRouter } from "next/router";
import { useState, useEffect, useLayoutEffect, useContext } from "react";
import NavBar from "./NavBar";
import Loading from "./ui/Loading";
import { SocketContext } from "@/lib/socketContext";
import FriendNotification from "./ui/FriendNotification";
import { handleRefresh } from "@/lib/auth-client";
import { NotifyContext, NotifyProvider } from "@/lib/notifyContext";
import GlobalNotification from "@/components/ui/GlobalNotification";
import ChatNotification from "./ui/ChatNotification";

export const Notifications = () => {
	return (
		<>
			<GlobalNotification />
			<ChatNotification />
			<FriendNotification />
		</>
	)
}

export default function Layout({
	pageProps,
	children,
}: {
	pageProps?: any;
	children: React.ReactNode;
}) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [userData, setuserData] = useState<any>([]);

	useEffect(() => {
		const checkLoginStatus = async () => {
			// 로그인 상태 확인하는 비동기 함수
			const token = await checkIsLoggedIn();

			if (!token) {
				router.push("/");
			} else {
				const res = await fetch("http://localhost:3000/users/me", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
				if (res.ok) {
					setLoading(false);
				} else if (res.status === 401) {
					// Unauthorized, try to refresh the access token
					const newAccessToken = await handleRefresh();
					if (!newAccessToken) {
						router.push("/");
					}
					router.reload();
				} else {
					return null;
				}
				setLoading(false);
			}
		};

		checkLoginStatus();
	}, [router]);

	// 소켓 연결
	const { friendSocket: socket } = useContext(SocketContext);
	useEffect(() => {
		function changeUserStatus(data: any) {
			let copy = [...userData];
			const alteredCopy = copy.map((user) => {
				if (user.id === data.id) {
					return data;
				} else {
					return user;
				}
			});
			setuserData(alteredCopy);
		}
		function RenewFriend(data: any) {
			let copy = [...userData];
			let alteredCopy = copy.filter((user) => {
				return user.id !== data.id;
			});
			if (copy.length === alteredCopy.length) {
				alteredCopy.push(data);
			}
			setuserData(alteredCopy);
		}

		if (socket) {
			socket.on("friendList", (data) => {
				setuserData(data);
			});
			socket.on("friendActive", (data) => {
				changeUserStatus(data);
			});
			socket.on("friendRenew", (data) => {
				RenewFriend(data);
			});
		}
	}, [socket, userData]);
	return (
		<>
			{loading ? (
				<>
					<Loading />
				</>
			) : (
				<NotifyProvider>
					<Notifications />
					<div className="lg:flex bg-zinc-800 text-white">

						<NavBar userData={userData} />
						<div className="relative flex w-full flex-1 px-8 py-6">
							{pageProps}
							{children}
						</div>
					</div>
				</NotifyProvider>
			)}
		</>
	);
}
