// socketContext.tsx
import { createContext, useEffect, useState, ReactNode, Dispatch } from "react";
import { Manager, Socket, io } from "socket.io-client";
import { handleRefresh } from "./auth-client";
import router from "next/router";
import { UsersProvider } from "./userContext";

interface SocketContextValue {
	friendSocket: Socket | null;
	chatSocket: Socket | null;
	gameSocket: Socket | null;
	notifySocket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({
	friendSocket: null,
	chatSocket: null,
	gameSocket: null,
	notifySocket: null,
});
//const ChatSocketContext = createContext<SocketContextValue>({ socket: null });
//const GameSocketContext = createContext<SocketContextValue>({ socket: null });
//const FriendSocketContext = createContext<SocketContextValue>({ socket: null });

interface SocketProviderProps {
	children: ReactNode;
}

const reconnectSocket = async (socketApi: string, socketSetter: any) => {
	const newAccessToken = await handleRefresh();
	if (!newAccessToken) {
		router.push("/");
	} else {
		const newSocket = io(socketApi, {
			extraHeaders: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
		socketSetter(newSocket);
	}
};

const SocketProvider = ({ children }: SocketProviderProps) => {
	const [friendSocket, setFriendSocket] = useState<Socket | null>(null);
	const [chatSocket, setChatSocket] = useState<Socket | null>(null);
	const [gameSocket, setGameSocket] = useState<Socket | null>(null);
	const [notifySocket, setNotifySocket] = useState<Socket | null>(null);

	useEffect(() => {
		const manager = new Manager("http://localhost:3000", {
			extraHeaders: {
			  Authorization: `Bearer ${localStorage.getItem("token")}`,
			  }
		});

		const newFriendSocket =manager.socket("/friend", {
		});
		const newChatSocket =manager.socket("/chat-room", {
		});
		const newGameSocket =manager.socket("/game", {
		});

		// 토큰 만료시 재발급
		newFriendSocket.on("tokenError", () => {
			reconnectSocket("http://localhost:3000/friend", setFriendSocket);
		});
		newChatSocket.on("tokenError", () => {
			reconnectSocket("http://localhost:3000/chat-room", setChatSocket);
		});
		newGameSocket.on("tokenError", () => {
			reconnectSocket("http://localhost:3000/game", setGameSocket);
		});

		setFriendSocket(newFriendSocket);
		setChatSocket(newChatSocket);
		setGameSocket(newGameSocket);

		return () => {
			newFriendSocket.close();
			newChatSocket.close();
			newGameSocket.close();
		};
	}, []);

	return (
		<UsersProvider>
			<SocketContext.Provider
				value={{ friendSocket, chatSocket, gameSocket, notifySocket }}
			>
				{children}
			</SocketContext.Provider>
		</UsersProvider>
	);
};

/*
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
		<GameSocketContext.Provider value={{ gameSocket }}>
			{children}
		</GameSocketContext.Provider>
	);
};
*/
export {
	SocketContext,
	SocketProvider,
	/*
	ChatSocketContext,
	ChatSocketProvider,
	GameSocketContext,
	GameSocketProvider,
	*/
};
