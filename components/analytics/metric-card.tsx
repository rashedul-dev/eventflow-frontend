"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
  valueClassName?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  valueClassName,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend.value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value > 0) return "text-green-500";
    if (trend.value < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <Card className={cn("bg-secondary/30 border-foreground/10", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold text-foreground", valueClassName)}>{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {getTrendIcon()}
            <p className={cn("text-xs", getTrendColor())}>
              {trend.value > 0 ? "+" : ""}
              {trend.value.toFixed(1)}% {trend.label || "from last period"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
