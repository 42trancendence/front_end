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
				/*
				const isValidated2fa = await isTwoFactorAuthEnabled(token);
				if (isValidated2fa !== 409) {
					alert("2FA 인증이 필요합니다.");
					router.push("/");
				}
				else {
					setLoading(false);
				}
				*/
				setLoading(false);
			}
		};

		checkLoginStatus();
	}, [router]);

	// 소켓 연결
	const { socket } = useContext(SocketContext);
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
			const alteredCopy = copy.map((user) => {
				if (user.id === data.id) {
					return ;
				} else {
					return user;
				}
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

	// 친구 요청 수락
	const acceptFriend = (event: React.MouseEvent<HTMLElement>, item: any) => {
		socket?.emit("accept-friend", { friendId: item.id });
	};

	return (
		<>
			{loading ? (
				<>
					<Loading />
				</>
			) : (
				<div className="flex bg-zinc-800 text-white">
					<FriendNotification />
					<NavBar userData={userData} />
					<div className="relative flex w-full flex-1 px-8 py-6">
						{pageProps}
						{children}
					</div>
				</div>
			)}
		</>
	);
}
