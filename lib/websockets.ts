import {useEffect, useState} from "react";

type MessageHandler = (message: MessageEvent) => void

export const useWebsocket = (url: string, onMessageReceived?: MessageHandler) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        ws.onclose = (event) => {
            if (event.wasClean) {
                console.log(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
            } else {
                console.error('Connection died');
            }
            setSocket(null)
        };
        ws.onopen = () => {
            setSocket(ws)
        }

        if (onMessageReceived) {
            ws.onmessage = onMessageReceived
        }

        // Cleanup
        return () => {
            ws.close();
        };
    }, []);

    return [socket]
}
