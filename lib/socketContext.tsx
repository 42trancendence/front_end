// socketContext.tsx
import { createContext, useEffect, useState, ReactNode } from 'react';
import { Socket, io } from 'socket.io-client';

interface SocketContextValue {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });

interface SocketProviderProps {
  children: ReactNode;
}

const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000/users', {
		extraHeaders: {
			Authorization: `Bearer ${localStorage.getItem('token')}`
		}
	}); // Replace with your server URL
    setSocket(newSocket);

	if (socket) {
		socket.connect();
	}
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };
