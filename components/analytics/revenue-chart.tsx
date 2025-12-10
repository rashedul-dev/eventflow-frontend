"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RevenueChartProps {
  data: Array<{
    period: string;
    revenue: number;
    ticketsSold?: number;
    orderCount?: number;
  }>;
  title?: string;
  type?: "line" | "area";
  showTickets?: boolean;
}

export function RevenueChart({ data, title = "Revenue Trend", type = "area", showTickets = false }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for display
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.period).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-foreground/10 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{payload[0].payload.date}</p>
          <div className="space-y-1">
            <p className="text-sm text-green-500">
              Revenue: <span className="font-bold">${payload[0].value.toLocaleString()}</span>
            </p>
            {showTickets && payload[1] && (
              <p className="text-sm text-purple-500">
                Tickets: <span className="font-bold">{payload[1].value}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const ChartComponent = type === "area" ? AreaChart : LineChart;
  const DataComponent = type === "area" ? Area : Line;

  return (
    <Card className="bg-secondary/30 border-foreground/10">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.2}
              strokeWidth={2}
              name="Revenue"
            />

            {showTickets && (
              <Area
                type="monotone"
                dataKey="ticketsSold"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.2}
                strokeWidth={2}
                name="Tickets Sold"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
