import { io } from "socket.io-client";

const socket = (token: string | null, SOCKET_SERVER_URL: string) => {
	const socketio = io(SOCKET_SERVER_URL, {
		extraHeaders: {
			Authorization: `Bearer ${token}`,
		}
	});
	return socketio;
}

export default socket;
