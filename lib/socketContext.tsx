// socketContext.tsx
import { createContext, useEffect, useState, ReactNode } from "react";
import { Socket, io } from "socket.io-client";

interface SocketContextValue {
	socket: Socket | null,
}

interface GameSocketContextValue {
	gameSocket: Socket | null,
}

const SocketContext = createContext<SocketContextValue>({ socket: null });
const ChatSocketContext = createContext<SocketContextValue>({ socket: null });
const GameSocketContext = createContext<GameSocketContextValue>({ gameSocket: null });
const FriendSocketContext = createContext<SocketContextValue>({ socket: null });

interface SocketProviderProps {
	children: ReactNode;
}

const SocketProvider = ({ children }: SocketProviderProps) => {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {

		const newSocket = io('http://localhost:3000/friend', {
			extraHeaders: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		}); // Replace with your server URL
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
			}); // Replace with your server URL
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

const GameSocketProvider = ({ children }: SocketProviderProps) => {
	const [gameSocket, setGameSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const newSocket = io("http://localhost:3000/game", {
			extraHeaders: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			reconnection: true,
			reconnectionAttempts: Infinity,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
		}); // Replace with your server URL
		setGameSocket(newSocket);

		return () => {
			newSocket.close();
		};
	}, []);

	return (
		<GameSocketContext.Provider value={{ gameSocket }}>
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