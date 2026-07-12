import { useEffect, useState, useCallback, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// The backend WS URL
const SOCKET_URL = "http://localhost:8080/ws";

export default function useWebSocket(topic, onMessageReceived) {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // We use SockJS if standard WS is not ideal, but STOMP JS 
    // recommends using standard WebSocket if possible. 
    // Based on the instructions: "use @stomp/stompjs and sockjs-client"
    
    const client = new Client({
      // brokerURL: "ws://localhost:8080/ws", // if we used raw websockets
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {
        Authorization: token ? "Bearer " + token : "",
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      setConnected(true);
      console.log("Connected: " + frame);

      if (topic && onMessageReceived) {
        client.subscribe(topic, (message) => {
          if (message.body) {
            onMessageReceived(JSON.parse(message.body));
          }
        });
      }
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [topic, onMessageReceived]);

  const sendMessage = useCallback((destination, body) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error("Cannot send message, WebSocket is not connected.");
    }
  }, []);

  return { connected, sendMessage };
}
