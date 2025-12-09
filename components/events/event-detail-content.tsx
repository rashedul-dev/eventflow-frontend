"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Users, Clock, Info, CheckCircle, AlertCircle, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import type { Event } from "@/lib/types";

interface EventDetailContentProps {
  event: Event;
}

export function EventDetailContent({ event }: EventDetailContentProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("about");

  const updateTicketQuantity = (ticketId: string, delta: number, min: number, max: number, available: number) => {
    setSelectedTickets((prev) => {
      const current = prev[ticketId] || 0;
      const newValue = Math.max(0, Math.min(max, available, current + delta));
      if (newValue === 0) {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ticketId]: newValue };
    });
  };

  const totalAmount = Object.entries(selectedTickets).reduce((sum, [ticketId, qty]) => {
    const ticket = event.ticketTypes?.find((t) => t.id === ticketId);
    return sum + (ticket?.price || 0) * qty;
  }, 0);

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  const isEventEnded = new Date() > new Date(event.endDate);

  const now = new Date();
  const isEnded = now > new Date(event.endDate);
  const isStarted = now >= new Date(event.startDate);
  const isSoldOut = event.ticketTypes?.every((t) => t.quantity - t.quantitySold <= 0) || false;

  const canPurchase = !isEnded && !isSoldOut && isStarted;

  /*  map loop (unchanged except you can drop isSoldOut here) */
  event.ticketTypes?.map((ticket) => {
    const available = ticket.quantity - ticket.quantitySold;
    const isAvailable = available > 0; // still tickets left
  });

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${event.slug}`);
      return;
    }

    // Store selection in sessionStorage for checkout page
    const selection = Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => ({
      ticketTypeId,
      quantity,
    }));
    sessionStorage.setItem(`checkout_${event.id}`, JSON.stringify(selection));

    router.push(`/checkout/${event.id}`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-muted/50 p-1">
              <TabsTrigger value="about" data-value="about">
                About
              </TabsTrigger>
              <TabsTrigger value="tickets" data-value="tickets" data-tab="tickets">
                Tickets
              </TabsTrigger>
              <TabsTrigger value="location" data-value="location">
                Location
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-4">About this event</h2>
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{event.description}</div>

                {event.tags && event.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tickets" className="mt-6 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Select Tickets</h2>

              {event.ticketTypes?.map((ticket) => {
                const available = ticket.quantity - ticket.quantitySold;
                const isAvailable = available > 0;
                const isSoldOut = available <= 0;
                const quantity = selectedTickets[ticket.id] || 0;

                return (
                  <Card
                    key={ticket.id}
                    className={cn("transition-all", quantity > 0 && "border-primary", isSoldOut && "opacity-60")}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{ticket.name}</h3>
                            {ticket.category === "FREE" && <Badge className="bg-primary">Free</Badge>}
                            {isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
                          </div>
                          {ticket.description && (
                            <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{available} available</span>
                            <span>Max {ticket.maxPerOrder} per order</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xl font-bold">{ticket.price === 0 ? "Free" : `$${ticket.price}`}</div>
                            {ticket.originalPrice && ticket.originalPrice > ticket.price && (
                              <div className="text-sm text-muted-foreground line-through">${ticket.originalPrice}</div>
                            )}
                          </div>

                          {isAvailable && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateTicketQuantity(ticket.id, -1, ticket.minPerOrder, ticket.maxPerOrder, available)
                                }
                                disabled={quantity <= 0}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateTicketQuantity(ticket.id, 1, ticket.minPerOrder, ticket.maxPerOrder, available)
                                }
                                disabled={quantity >= Math.min(ticket.maxPerOrder, available)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Checkout Summary */}
              {totalTickets > 0 && (
                <Card className="border-primary mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-muted-foreground">Selected tickets</span>
                      <span className="font-medium">{totalTickets} tickets</span>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
                    </div>{" "}
                    <Button
                      className="w-full glow-primary"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={!canPurchase} // block when ended/sold-out/not-started
                    >
                      <Ticket className="w-5 h-5 mr-2" />
                      {!isAuthenticated
                        ? "Login to Purchase"
                        : isEnded
                        ? "Event Ended"
                        : isSoldOut
                        ? "Sold Out"
                        : "Proceed to Checkout"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="location" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Event Location</h2>

              {event.isVirtual ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Info className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Virtual Event</h3>
                        <p className="text-sm text-muted-foreground">
                          This event will be hosted online via {event.virtualPlatform || "video conference"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You will receive the link to join the event after purchasing your ticket.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">{event.venueName}</h3>
                      <p className="text-muted-foreground">
                        {event.venueAddress}
                        <br />
                        {event.city}
                        {event.state && `, ${event.state}`} {event.postalCode}
                        <br />
                        {event.country}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">Map would be displayed here</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Duration</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(
                      (new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60)
                    )}{" "}
                    hours
                  </div>
                </div>
              </div>

              {event.capacity && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Capacity</div>
                    <div className="text-sm text-muted-foreground">{event.capacity} attendees</div>
                  </div>
                </div>
              )}

              {event.ageRestriction && (
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Age Restriction</div>
                    <div className="text-sm text-muted-foreground">{event.ageRestriction}+ only</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's Included</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Full event access</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Digital ticket with QR code</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Event reminders via email</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Mobile check-in available</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
