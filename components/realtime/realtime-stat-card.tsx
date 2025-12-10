"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface RealtimeStatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: (value: number) => string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  isLive?: boolean;
  className?: string;
}

export function RealtimeStatCard({
  title,
  value,
  previousValue,
  format = (v) => v.toLocaleString(),
  icon: Icon,
  trend,
  isLive = false,
  className,
}: RealtimeStatCardProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);

      // Animate value change
      const startValue = displayValue;
      const endValue = value;
      const duration = 500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOutQuad = (t: number) => t * (2 - t);
        const easedProgress = easeOutQuad(progress);

        const currentValue = Math.round(startValue + (endValue - startValue) * easedProgress);
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, displayValue]);

  const calculatedTrend =
    trend ||
    (previousValue !== undefined
      ? value > previousValue
        ? "up"
        : value < previousValue
        ? "down"
        : "neutral"
      : undefined);

  const changePercent =
    previousValue !== undefined && previousValue !== 0
      ? (((value - previousValue) / previousValue) * 100).toFixed(1)
      : null;

  const TrendIcon = calculatedTrend === "up" ? ArrowUp : calculatedTrend === "down" ? ArrowDown : Minus;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {isLive && (
        <div className="absolute top-2 right-2">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold tabular-nums transition-all", isAnimating && "text-primary")}>
              {format(displayValue)}
            </p>
            {calculatedTrend && changePercent && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  calculatedTrend === "up" && "text-green-500",
                  calculatedTrend === "down" && "text-red-500",
                  calculatedTrend === "neutral" && "text-muted-foreground"
                )}
              >
                <TrendIcon className="h-3 w-3" />
                <span>{Math.abs(Number(changePercent))}%</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
