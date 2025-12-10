"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { wsClient } from "@/lib/api/websocket";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "user" | "support" | "system";
  timestamp: Date;
}

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! How can we help you today?",
      sender: "support",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket subscription
  useEffect(() => {
    const unsubConnect = wsClient.onConnect(() => setIsConnected(true));
    const unsubDisconnect = wsClient.onDisconnect(() => setIsConnected(false));

    const unsubMessage = wsClient.on("chat_message", (payload: { content: string; sender: "support" | "system" }) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: payload.content,
          sender: payload.sender,
          timestamp: new Date(),
        },
      ]);
    });

    const unsubTyping = wsClient.on("chat_typing", () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    });

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubMessage();
      unsubTyping();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Send via WebSocket
    wsClient.send("chat_message", { content: newMessage.content });

    // Simulate support response for demo
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content:
            "Thanks for your message! A support agent will respond shortly. In the meantime, you can check our FAQ section for quick answers.",
          sender: "support",
          timestamp: new Date(),
        },
      ]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-background rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 bg-background border border-secondary/30 rounded-xl shadow-2xl overflow-hidden transition-all duration-300",
        isMinimized ? "w-72 h-14" : "w-80 sm:w-96 h-[500px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/20 border-b border-secondary/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-background" />
            </div>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                isConnected ? "bg-primary" : "bg-red-500"
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Support</h3>
            <p className="text-xs text-muted-foreground">{isConnected ? "Online" : "Connecting..."}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-secondary/30 rounded transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Minimize2 className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-secondary/30 rounded transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 h-[380px] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    message.sender === "user"
                      ? "bg-primary text-background rounded-br-sm"
                      : message.sender === "system"
                      ? "bg-secondary/30 text-muted-foreground text-center text-xs"
                      : "bg-secondary/50 text-foreground rounded-bl-sm"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      message.sender === "user" ? "text-background/70" : "text-muted-foreground"
                    )}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary/50 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-secondary/30">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-secondary/20 border border-secondary/30 rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
