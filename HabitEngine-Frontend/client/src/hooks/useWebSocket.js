import { useEffect, useState, useCallback, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// The backend WS URL
const SOCKET_URL = "http://localhost:8080/ws";

export default function useWebSocket(topic, onMessageReceived) {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  // Store the latest callback in a ref so we can call it without
  // making it a useEffect dependency (which would cause reconnect on every render).
  const onMessageRef = useRef(onMessageReceived);
  useEffect(() => {
    onMessageRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {
        Authorization: token ? "Bearer " + token : "",
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      setConnected(true);
      console.log("[WS] Connected:", frame.headers["user-name"]);

      if (topic) {
        client.subscribe(topic, (message) => {
          if (message.body && onMessageRef.current) {
            // Always call the latest version of the callback via ref
            onMessageRef.current(JSON.parse(message.body));
          }
        });
        console.log("[WS] Subscribed to:", topic);
      }
    };

    client.onStompError = (frame) => {
      console.error("[WS] STOMP Error:", frame.headers["message"], frame.body);
    };

    client.onDisconnect = () => {
      setConnected(false);
      console.warn("[WS] Disconnected from server");
    };

    client.activate();
    clientRef.current = client;

    return () => {
      // Cleanup: deactivate when topic changes or component unmounts
      if (client.active) {
        client.deactivate();
      }
    };
  }, [topic]); // ← ONLY topic here. onMessageReceived is read via ref, not as a dependency.

  const sendMessage = useCallback((destination, body) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error("[WS] Cannot send — not connected.");
    }
  }, []);

  return { connected, sendMessage };
}
