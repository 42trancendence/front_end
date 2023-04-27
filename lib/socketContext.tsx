// socketContext.tsx
import { createContext, useEffect, useState, ReactNode } from "react";
import { Socket, io } from "socket.io-client";
import { handleRefresh } from "./auth-client";
import router from "next/router";

interface SocketContextValue {
	socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });
const ChatSocketContext = createContext<SocketContextValue>({ socket: null });
const GameSocketContext = createContext<SocketContextValue>({ socket: null });
const FriendSocketContext = createContext<SocketContextValue>({ socket: null });

interface SocketProviderProps {
	children: ReactNode;
}

const SocketProvider = ({ children }: SocketProviderProps) => {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const newSocket = io("http://localhost:3000/friend", {
			extraHeaders: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});

		// 토큰 만료시 재발급
		newSocket.on("tokenError", () => {
			const reconnectSocket = async() => {
				const newAccessToken = await handleRefresh();
				if (!newAccessToken) {
					router.push("/");
				}
				else {
					const newSocket = io("http://localhost:3000/friend", {
						extraHeaders: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					});
					setSocket(newSocket);
				}
			}
			reconnectSocket();
		});

		setSocket(newSocket);

		return () => {
			newSocket.close();
		};
	}, []);

	return (
		<SocketContext.Provider value={{ socket }}>
			{children}
		</SocketContext.Provider>
	);
};

const ChatSocketProvider = ({
	isOpen,
	children,
}: {
	isOpen: boolean;
	children: ReactNode;
}) => {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		if (isOpen === false) return;
		else {
			const newSocket = io("http://localhost:3000/chat-room", {
				extraHeaders: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			// 토큰 만료시 재발급
			newSocket.on("tokenError", () => {
				const reconnectSocket = async() => {
					const newAccessToken = await handleRefresh();
					if (!newAccessToken) {
						router.push("/");
					}
					else {
						const newSocket = io("http://localhost:3000/chat-room", {
							extraHeaders: {
								Authorization: `Bearer ${localStorage.getItem("token")}`,
							},
						});
						setSocket(newSocket);
					}
				}
				reconnectSocket();
			});

			setSocket(newSocket);

			return () => {
				newSocket.close();
			};
		}
	}, [isOpen]);

	return (
		<ChatSocketContext.Provider value={{ socket }}>
			{children}
		</ChatSocketContext.Provider>
	);
};

const GameSocketProvider = ({
	isOpen,
	children,
}: {
	isOpen: boolean;
	children: ReactNode;
}) => {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		if (isOpen === false) return;
		else {
			const newSocket = io("http://localhost:3000/game", {
				extraHeaders: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			// 토큰 만료시 재발급
			newSocket.on("tokenError", () => {
				const reconnectSocket = async() => {
					const newAccessToken = await handleRefresh();
					if (!newAccessToken) {
						router.push("/");
					}
					else {
						const newSocket = io("http://localhost:3000/game", {
							extraHeaders: {
								Authorization: `Bearer ${localStorage.getItem("token")}`,
							},
						});
						setSocket(newSocket);
					}
				}
				reconnectSocket();
			});

			setSocket(newSocket);

			return () => {
				newSocket.close();
			};
		}
	}, [isOpen]);

	return (
		<GameSocketContext.Provider value={{ socket }}>
			{children}
		</GameSocketContext.Provider>
	);
};

export {
	SocketContext,
	SocketProvider,
	ChatSocketContext,
	ChatSocketProvider,
	GameSocketContext,
	GameSocketProvider,
};
