import React, { useEffect, useState } from "react";
import socket from "../lib/socket";
import { Socket } from "socket.io-client";

const WithSocket = (WrappedComponent) => {
  let socketio: Socket;

  const WithSocketComponent = (props) => {
    useEffect(() => {
      const token = localStorage.getItem("token");
      socketio = socket(token, "http://localhost:3000/users");
      // Connect to the server
      if (socketio) {
        socketio.connect();
      }
      // Disconnect the socket when the component is unmounted

    }, []);

    return <WrappedComponent {...props} socket={socketio} />;
  };

  return WithSocketComponent;
};

export default WithSocket;
