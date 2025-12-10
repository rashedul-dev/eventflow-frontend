"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ticketApi } from "@/lib/api";
import { Calendar, MapPin, ArrowRight, Loader2, Ticket } from "lucide-react";

export function UpcomingEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    setIsLoading(true);
    try {
      const response = await ticketApi.getMyTickets({ status: "ACTIVE" });
      const tickets = response.data || [];

      // Filter for future events and take first 3
      const now = new Date();
      const upcomingTickets = tickets
        .filter((t: any) => t.event && new Date(t.event.startDate) > now)
        .sort((a: any, b: any) => new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime())
        .slice(0, 3);

      setEvents(upcomingTickets);
    } catch (err) {
      console.error("Failed to load upcoming events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-secondary/30 border-foreground/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Upcoming Events</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/tickets" className="text-primary hover:text-primary/80">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No upcoming events</p>
            <Button variant="link" size="sm" asChild className="mt-2">
              <Link href="/events">Browse Events</Link>
            </Button>
          </div>
        ) : (
          events.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
            >
              <img
                src={ticket.event?.coverImage || "/placeholder.svg?height=64&width=64&query=event"}
                alt={ticket.event?.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{ticket.event?.title}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-foreground/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(ticket.event?.startDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {ticket.event?.isVirtual ? "Online" : ticket.event?.city || "TBD"}
                  </span>
                </div>
                <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                  {ticket.ticketType?.name || "General"}
                </span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/tickets`}>View Ticket</Link>
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
