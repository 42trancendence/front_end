import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ConnectionIndicator = ({ socketServerURL }: {socketServerURL : string}) => {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const newSocket = io(socketServerURL);
    setSocket(newSocket);

    newSocket.on('users', (connectedUsers) => {
      setUsers(connectedUsers.filter((user) => user.id !== newSocket.id));
    });

    return () => {
      newSocket.close();
    };
  }, [socketServerURL]);

  return (
    <div>
      <div className="connected-users">
        <h3>Other connected users:</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.id}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConnectionIndicator;
