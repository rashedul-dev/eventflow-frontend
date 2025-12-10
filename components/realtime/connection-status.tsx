"use client";

import { useWebSocket } from "@/contexts/websocket-context";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Loader2, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface ConnectionStatusProps {
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  connecting: {
    icon: Loader2,
    label: "Connecting...",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    animate: true,
  },
  connected: {
    icon: Wifi,
    label: "Connected",
    color: "text-green-500",
    bgColor: "bg-green-500",
    animate: false,
  },
  disconnected: {
    icon: WifiOff,
    label: "Disconnected",
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground",
    animate: false,
  },
  reconnecting: {
    icon: Loader2,
    label: "Reconnecting...",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    animate: true,
  },
  error: {
    icon: AlertCircle,
    label: "Connection Error",
    color: "text-destructive",
    bgColor: "bg-destructive",
    animate: false,
  },
};

const sizeConfig = {
  sm: { icon: "h-3 w-3", dot: "h-1.5 w-1.5", text: "text-xs" },
  md: { icon: "h-4 w-4", dot: "h-2 w-2", text: "text-sm" },
  lg: { icon: "h-5 w-5", dot: "h-2.5 w-2.5", text: "text-base" },
};

export function ConnectionStatus({ showLabel = false, className, size = "md" }: ConnectionStatusProps) {
  const { status, reconnect } = useWebSocket();
  const config = statusConfig[status];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-2 px-2", className)}
            onClick={status === "disconnected" || status === "error" ? reconnect : undefined}
          >
            <div className="relative">
              <Icon className={cn(sizes.icon, config.color, config.animate && "animate-spin")} />
              {status === "connected" && (
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 rounded-full",
                    sizes.dot,
                    config.bgColor,
                    "animate-pulse"
                  )}
                />
              )}
            </div>
            {showLabel && <span className={cn(sizes.text, config.color)}>{config.label}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
          {(status === "disconnected" || status === "error") && (
            <p className="text-xs text-muted-foreground">Click to reconnect</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
