import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:3000"; // Replace with server URL
const socket = io(SOCKET_SERVER_URL);

export default socket;