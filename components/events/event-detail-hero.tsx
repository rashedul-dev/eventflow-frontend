"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Share2, Heart, ExternalLink, Video } from "lucide-react";
import type { Event } from "@/lib/types";

interface EventDetailHeroProps {
  event: Event;
}

export function EventDetailHero({ event }: EventDetailHeroProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const formattedDate = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedStartTime = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const formattedEndTime = endDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const lowestPrice =
    event.ticketTypes?.reduce((min, t) => (t.price < min ? t.price : min), event.ticketTypes[0]?.price || 0) || 0;

  const totalCapacity = event.capacity || 0;
  const ticketsSold = event.ticketTypes?.reduce((sum, t) => sum + t.quantitySold, 0) || 0;
  const spotsLeft = totalCapacity - ticketsSold;

  const isSoldOut = event.ticketTypes?.every((t) => t.quantity - t.quantitySold <= 0) || false;

  const isEventStarted =
    event.status === "APPROVED" &&
    !isSoldOut &&
    new Date() >= new Date(event.startDate) &&
    new Date() <= new Date(event.endDate);

  const isEventEnded = new Date() > new Date(event.endDate);
  const isAvailable = event.status === "APPROVED" && !isSoldOut && new Date(event.startDate) > new Date();

  const handleGetTickets = () => {
    // Scroll to tickets tab
    const ticketsSection = document.querySelector('[data-tab="tickets"]');
    if (ticketsSection) {
      ticketsSection.scrollIntoView({ behavior: "smooth" });
      // Trigger tab click
      const ticketsTab = document.querySelector('[data-value="tickets"]') as HTMLElement;
      ticketsTab?.click();
    }
  };

  return (
    <section className="relative">
      {/* Cover Image */}
      <div className="relative h-75 md:h-100 lg:h-125 overflow-hidden">
        <img
          src={event.coverImage || "/placeholder.svg?height=500&width=1200&query=event banner"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-32 md:-mt-40 lg:-mt-48 pb-8">
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {event.category && <Badge className="bg-primary hover:bg-primary">{event.category}</Badge>}
                  {event.isVirtual && (
                    <Badge variant="outline" className="gap-1">
                      <Video className="w-3 h-3" />
                      Virtual Event
                    </Badge>
                  )}
                  {event.ageRestriction && <Badge variant="secondary">{event.ageRestriction}+ Only</Badge>}
                  {isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-balance">{event.title}</h1>

                {/* Organizer */}
                <Link href={`/organizers/${event.organizerId}`} className="inline-flex items-center gap-3 mb-6 group">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {event.organizer?.avatar ? (
                      <img
                        src={event.organizer.avatar || "/placeholder.svg"}
                        alt={event.organizer.organizationName || "Organizer"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-secondary-foreground">
                        {(event.organizer?.organizationName || event.organizer?.firstName || "O")[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Organized by</div>
                    <div className="font-medium group-hover:text-primary transition-colors">
                      {event.organizer?.organizationName ||
                        `${event.organizer?.firstName} ${event.organizer?.lastName}`}
                    </div>
                  </div>
                </Link>

                {/* Event Details */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{formattedDate}</div>
                      <div className="text-sm text-muted-foreground">
                        {formattedStartTime} - {formattedEndTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {event.isVirtual ? (
                        <Video className="w-5 h-5 text-primary" />
                      ) : (
                        <MapPin className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      {event.isVirtual ? (
                        <>
                          <div className="font-medium">Virtual Event</div>
                          <div className="text-sm text-muted-foreground">{event.virtualPlatform || "Online"}</div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium">{event.venueName || "Venue TBA"}</div>
                          <div className="text-sm text-muted-foreground">
                            {event.city}
                            {event.state ? `, ${event.state}` : ""}
                            {event.country ? `, ${event.country}` : ""}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsLiked(!isLiked)}
                    className={isLiked ? "text-red-500 border-red-500" : ""}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  {!event.isVirtual && event.latitude && event.longitude && (
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <ExternalLink className="w-4 h-4" />
                      Get Directions
                    </Button>
                  )}
                </div>
              </div>

              {/* Ticket Card */}
              <div className="lg:w-80 shrink-0">
                <div className="sticky top-24 p-6 rounded-xl bg-muted/50 border border-border">
                  <div className="text-center mb-6">
                    {lowestPrice === 0 ? (
                      <div className="text-3xl font-bold text-primary">Free</div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground">Starting from</div>
                        <div className="text-3xl font-bold">${lowestPrice}</div>
                      </>
                    )}
                  </div>

                  {totalCapacity > 0 && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Available spots</span>
                        <span className="font-medium">
                          {spotsLeft} / {totalCapacity}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(ticketsSold / totalCapacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full mb-3 glow-primary"
                    size="lg"
                    onClick={handleGetTickets}
                    disabled={!isAvailable && !isEventStarted}
                  >
                    {isSoldOut
                      ? "Sold Out"
                      : isEventEnded
                      ? "Event Ended"
                      : isEventStarted
                      ? "Event Already Started"
                      : "Get Tickets"}{" "}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">Secure checkout powered by Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
