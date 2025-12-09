"use client";

type MessageHandler = (data: any) => void;
type ConnectionHandler = () => void;

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

class EventFlowWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private onConnectHandlers: Set<ConnectionHandler> = new Set();
  private onDisconnectHandlers: Set<ConnectionHandler> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;

  constructor(baseUrl?: string) {
    const wsBase = baseUrl || process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
    this.url = `${wsBase}/ws`;
  }

  connect(token?: string) {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;

    this.isConnecting = true;
    const url = token ? `${this.url}?token=${token}` : this.url;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log("[WebSocket] Connected");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.onConnectHandlers.forEach((handler) => handler());
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          const handlers = this.messageHandlers.get(message.type);
          if (handlers) {
            handlers.forEach((handler) => handler(message.payload));
          }
          // Also notify "all" handlers
          const allHandlers = this.messageHandlers.get("*");
          if (allHandlers) {
            allHandlers.forEach((handler) => handler(message));
          }
        } catch (err) {
          console.error("[WebSocket] Failed to parse message:", err);
        }
      };

      this.ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        this.isConnecting = false;
        this.stopHeartbeat();
        this.onDisconnectHandlers.forEach((handler) => handler());
        this.attemptReconnect(token);
      };

      this.ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
        this.isConnecting = false;
      };
    } catch (err) {
      console.error("[WebSocket] Connection failed:", err);
      this.isConnecting = false;
      this.attemptReconnect(token);
    }
  }

  private attemptReconnect(token?: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[WebSocket] Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => this.connect(token), delay);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send("ping", {});
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
    }
  }

  // Subscribe to message types
  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.onConnectHandlers.add(handler);
    return () => this.onConnectHandlers.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.onDisconnectHandlers.add(handler);
    return () => this.onDisconnectHandlers.delete(handler);
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const wsClient = new EventFlowWebSocket();

// React hook for WebSocket
export function useWebSocket() {
  return wsClient;
}
