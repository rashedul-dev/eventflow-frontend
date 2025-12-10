"use client";

import { useState, useEffect } from "react";
import { ticketApi } from "@/lib/api";
import { TicketCard } from "@/components/dashboard/ticket-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Ticket } from "lucide-react";
import Link from "next/link";
import type { Ticket as TicketType } from "@/lib/types";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ticketApi.getMyTickets();
      if (response.data) {
        setTickets(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const activeTickets = tickets.filter((t) => t.status === "ACTIVE");
  const usedTickets = tickets.filter((t) => t.status === "USED");
  const cancelledTickets = tickets.filter((t) => t.status === "CANCELLED");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchTickets} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Tickets</h1>
        <p className="text-foreground/60 mt-1">Manage your event tickets and access QR codes for entry.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
          <p className="text-muted-foreground mb-4">Browse events and purchase tickets to see them here.</p>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-secondary/30">
            <TabsTrigger value="active">Active ({activeTickets.length})</TabsTrigger>
            <TabsTrigger value="used">Past ({usedTickets.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledTickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6 space-y-4">
            {activeTickets.length > 0 ? (
              activeTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onUpdate={fetchTickets} />)
            ) : (
              <div className="text-center py-12 text-foreground/60">
                <p>No active tickets</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="used" className="mt-6 space-y-4">
            {usedTickets.length > 0 ? (
              usedTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onUpdate={fetchTickets} />)
            ) : (
              <div className="text-center py-12 text-foreground/60">
                <p>No past tickets</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6 space-y-4">
            {cancelledTickets.length > 0 ? (
              cancelledTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onUpdate={fetchTickets} />)
            ) : (
              <div className="text-center py-12 text-foreground/60">
                <p>No cancelled tickets</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
