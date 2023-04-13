import React, { useEffect, useState } from "react";
import socket from "../lib/socket";

const withSocket = (WrappedComponent) => {
  const WithSocketComponent = (props) => {
    useEffect(() => {
      // Connect to the server
      socket.connect();

      // Disconnect the socket when the component is unmounted
      return () => {
        socket.disconnect();
      };
    }, []);

    return <WrappedComponent {...props} socket={socket} />;
  };

  return WithSocketComponent;
};

export default withSocket;