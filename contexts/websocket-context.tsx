"use client";

import type React from "react";
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import type {
  WebSocketMessage,
  WebSocketMessageType,
  ConnectionStatus,
  WebSocketConfig,
  NotificationPayload,
} from "@/lib/websocket-types";

interface WebSocketContextValue {
  status: ConnectionStatus;
  lastMessage: WebSocketMessage | null;
  notifications: NotificationPayload[];
  send: (message: WebSocketMessage) => void;
  subscribe: (type: WebSocketMessageType, callback: (message: WebSocketMessage) => void) => () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

const DEFAULT_CONFIG: Required<Omit<WebSocketConfig, "url">> = {
  reconnectAttempts: 5,
  reconnectInterval: 3000,
  heartbeatInterval: 30000,
  debug: process.env.NODE_ENV === "development",
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  config?: Partial<WebSocketConfig>;
}

export function WebSocketProvider({ children, config }: WebSocketProviderProps) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const subscribersRef = useRef<Map<WebSocketMessageType, Set<(message: WebSocketMessage) => void>>>(new Map());
  const messageQueueRef = useRef<WebSocketMessage[]>([]);

  const wsUrl = config?.url || process.env.NEXT_PUBLIC_WS_URL || "";
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const log = useCallback(
    (...args: unknown[]) => {
      if (mergedConfig.debug) {
        console.log("[WebSocket]", ...args);
      }
    },
    [mergedConfig.debug]
  );

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const notifySubscribers = useCallback((message: WebSocketMessage) => {
    const subscribers = subscribersRef.current.get(message.type);
    if (subscribers) {
      subscribers.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          console.error("[WebSocket] Subscriber error:", error);
        }
      });
    }
  }, []);

  const processMessageQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      while (messageQueueRef.current.length > 0) {
        const message = messageQueueRef.current.shift();
        if (message) {
          wsRef.current.send(JSON.stringify(message));
          log("Sent queued message:", message.type);
        }
      }
    }
  }, [log]);

  const startHeartbeat = useCallback(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const pingMessage: WebSocketMessage = {
          type: "ping",
          payload: null,
          timestamp: new Date().toISOString(),
        };
        wsRef.current.send(JSON.stringify(pingMessage));
        log("Sent heartbeat ping");
      }
    }, mergedConfig.heartbeatInterval);
  }, [mergedConfig.heartbeatInterval, log]);

  const connect = useCallback(() => {
    if (!wsUrl) {
      log("No WebSocket URL configured");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log("Already connected");
      return;
    }

    clearTimers();
    setStatus("connecting");
    log("Connecting to:", wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        log("Connected successfully");
        setStatus("connected");
        reconnectAttemptsRef.current = 0;
        startHeartbeat();
        processMessageQueue();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          log("Received message:", message.type, message);

          if (message.type === "pong") {
            log("Received heartbeat pong");
            return;
          }

          setLastMessage(message);
          notifySubscribers(message);

          // Handle notifications specially
          if (message.type === "notification") {
            const notification = message.payload as NotificationPayload;
            setNotifications((prev) => {
              // Avoid duplicates
              if (prev.some((n) => n.id === notification.id)) {
                return prev;
              }
              return [notification, ...prev].slice(0, 50); // Keep last 50
            });
          }
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
        }
      };

      ws.onclose = (event) => {
        log("Connection closed:", event.code, event.reason);
        clearTimers();

        if (event.code !== 1000 && reconnectAttemptsRef.current < mergedConfig.reconnectAttempts) {
          setStatus("reconnecting");
          reconnectAttemptsRef.current++;
          log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}/${mergedConfig.reconnectAttempts}`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, mergedConfig.reconnectInterval * reconnectAttemptsRef.current);
        } else {
          setStatus("disconnected");
        }
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
        setStatus("error");
      };
    } catch (error) {
      console.error("[WebSocket] Failed to create connection:", error);
      setStatus("error");
    }
  }, [wsUrl, clearTimers, startHeartbeat, processMessageQueue, notifySubscribers, log]);

  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close(1000, "Client disconnect");
      wsRef.current = null;
    }
    setStatus("disconnected");
    log("Disconnected");
  }, [clearTimers, log]);

  const send = useCallback(
    (message: WebSocketMessage) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
        log("Sent message:", message.type);
      } else {
        // Queue message for when connection is restored
        messageQueueRef.current.push(message);
        log("Queued message:", message.type);
      }
    },
    [log]
  );

  const subscribe = useCallback(
    (type: WebSocketMessageType, callback: (message: WebSocketMessage) => void) => {
      if (!subscribersRef.current.has(type)) {
        subscribersRef.current.set(type, new Set());
      }
      subscribersRef.current.get(type)!.add(callback);
      log("Subscribed to:", type);

      // Return unsubscribe function
      return () => {
        subscribersRef.current.get(type)?.delete(callback);
        log("Unsubscribed from:", type);
      };
    },
    [log]
  );

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    disconnect();
    connect();
  }, [disconnect, connect]);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reconnect on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && status === "disconnected") {
        log("Page visible, reconnecting...");
        reconnect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, reconnect, log]);

  const value: WebSocketContextValue = {
    status,
    lastMessage,
    notifications,
    send,
    subscribe,
    clearNotification,
    clearAllNotifications,
    reconnect,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
