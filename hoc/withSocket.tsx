import React, { useEffect, useState } from "react";
import socket from "../lib/socket";
import { Socket } from "socket.io-client";

const WithSocket = (WrappedComponent) => {

  const WithSocketComponent = (props) => {
    const [socketio, setsocketio] = useState<Socket>();

    useEffect(() => {
      const token = localStorage.getItem("token");
      setsocketio(socket(token, "http://localhost:3000/users"));
      // Connect to the server
      if (socketio) {
        socketio.connect();
        socketio.on("connect", () => {
          console.log("Connected to the server");
        });
      }
      // Disconnect the socket when the component is unmounted

    }, [socketio]);

    return <WrappedComponent {...props} socket={socketio} />;
  };

  return WithSocketComponent;
};

export default WithSocket;
