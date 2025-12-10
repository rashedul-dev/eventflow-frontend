"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ticketApi, eventApi } from "@/lib/api";
import { Ticket, Loader2 } from "lucide-react";

export function RecentSales() {
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentSales();
  }, []);

  const fetchRecentSales = async () => {
    setIsLoading(true);
    try {
      // Get my events first
      const eventsRes = await eventApi.getMyEvents();
      const events = eventsRes.data || [];

      // Fetch tickets from first few events
      let allSales: any[] = [];
      for (const event of events.slice(0, 3)) {
        try {
          const ticketsRes = await ticketApi.getEventTickets(event.id, { limit: 10 });
          if (ticketsRes.data) {
            allSales = [...allSales, ...ticketsRes.data.map((t: any) => ({ ...t, event }))];
          }
        } catch {
          // Skip if no access
        }
      }

      // Sort by creation date and take first 5
      allSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSales(allSales.slice(0, 5));
    } catch (err) {
      console.error("Failed to load recent sales:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return past.toLocaleDateString();
  };

  return (
    <Card className="bg-secondary/30 border-foreground/10">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-8">
            <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No sales yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                  {(sale.attendeeName || sale.user?.firstName || "A").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {sale.attendeeName || sale.user?.firstName || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{sale.event?.title || "Unknown Event"}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">${Number.parseFloat(sale.pricePaid || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(sale.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
