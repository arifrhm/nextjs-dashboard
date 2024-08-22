// src/app/services/websocket.ts
export const connectWebSocket = (
  url: string,
  onMessage: (data: any) => void,
  onOpen?: () => void,
  onError?: (error: Event) => void
): WebSocket => {
  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('WebSocket is open now.');
    if (onOpen) onOpen();
  };

  ws.onmessage = (event) => {
    // Handle raw data directly, without JSON parsing
    onMessage(event.data);
  };

  ws.onclose = () => {
    console.log('WebSocket is closed now.');
  };

  ws.onerror = (error) => {
    console.log('WebSocket error:', error);
    if (onError) onError(error);
  };

  return ws;
};

export const sendData = (ws: WebSocket, data: number | string) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(data.toString()); // Send data as a string
  } else {
    console.error('WebSocket is not open. Cannot send data.');
  }
};
