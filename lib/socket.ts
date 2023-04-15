import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:3000"; // Replace with your server URL

const getToken = () => {
  return localStorage.getItem("token");
};

const createSocketConnection = (): Socket => {
  const token = getToken();
  return io(SOCKET_SERVER_URL, {
    query: {
      token,
    },
  });
};

const socket = createSocketConnection();

export default socket;
