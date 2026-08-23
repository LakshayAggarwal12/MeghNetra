import { useEffect, useState } from "react";
import { getSocket } from "../sockets/socket";

/**
 * Tracks the existing Socket.IO connection's status only — does not open a
 * second connection and does not call any new endpoint. Used by the app
 * shell (Topbar) to show a global live/reconnecting indicator regardless of
 * which page is active.
 */
export function useConnectionStatus() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return connected;
}
