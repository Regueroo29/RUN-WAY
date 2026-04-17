import { createContext, useContext } from 'react';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  // Return null socket for now - we'll fix real-time later
  return (
    <SocketContext.Provider value={null}>
      {children}
    </SocketContext.Provider>
  );
};