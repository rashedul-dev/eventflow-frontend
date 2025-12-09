import Link from "next/link";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
  variant?: "default" | "compact" | "horizontal";
}

export function EventCard({ event, variant = "default" }: EventCardProps) {
  const formattedDate = new Date(event.startDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = new Date(event.startDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  // FIXED: Better price calculation with proper fallbacks
  const lowestPrice = (() => {
    // Check if ticketTypes exists and has items
    if (!event.ticketTypes || event.ticketTypes.length === 0) {
      return null; // No ticket info available
    }

    // Find the minimum price from all ticket types
    const prices = event.ticketTypes.map((t) => t.price).filter((p) => typeof p === "number");
    if (prices.length === 0) return null;

    return Math.min(...prices);
  })();

  if (variant === "horizontal") {
    return (
      <Link href={`/events/${event.slug}`}>
        <div className="group flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
          <div className="relative w-32 h-24 rounded-lg overflow-hidden shrink-0">
            <img
              src={event.coverImage || "/placeholder.svg?height=96&width=128&query=event"}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                  <span>•</span>
                  <span>{formattedTime}</span>
                </div>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {lowestPrice === null ? "TBA" : lowestPrice === 0 ? "Free" : `From $${lowestPrice}`}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="truncate">
                {event.isVirtual ? "Virtual Event" : `${event.city}, ${event.state || event.country}`}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/events/${event.slug}`}>
        <div className="group p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
              <span className="text-xs text-primary font-medium uppercase">
                {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
              </span>
              <span className="text-xl font-bold text-foreground">{new Date(event.startDate).getDate()}</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {event.isVirtual ? "Virtual" : event.venueName || event.city}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/events/${event.slug}`}>
      <div className="group rounded-2xl bg-card border border-border hover:border-primary/50 overflow-hidden transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-16/10 overflow-hidden">
          <img
            src={event.coverImage || "/placeholder.svg?height=240&width=384&query=event concert"}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          {/* Category Badge */}
          {event.category && (
            <Badge className="absolute top-4 left-4 bg-primary/90 hover:bg-primary">{event.category}</Badge>
          )}

          {/* Date Badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/90 backdrop-blur-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{formattedDate}</span>
          </div>

          {/* Virtual Badge */}
          {event.isVirtual && (
            <Badge variant="outline" className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm">
              Virtual
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {event.isVirtual
                ? event.virtualPlatform || "Online"
                : `${event.venueName || event.city}${event.state ? `, ${event.state}` : ""}`}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formattedTime}</span>
            </div>
            {event.capacity && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{event.capacity} spots</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                {event.organizer?.avatar ? (
                  <img
                    src={event.organizer.avatar || "/placeholder.svg"}
                    alt={event.organizer.organizationName || "Organizer"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-secondary-foreground">
                    {(event.organizer?.organizationName || event.organizer?.firstName || "O")[0]}
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                {event.organizer?.organizationName || `${event.organizer?.firstName} ${event.organizer?.lastName}`}
              </span>
            </div>
            <div className="text-right">
              {lowestPrice === null ? (
                <span className="text-sm text-muted-foreground">Price TBA</span>
              ) : lowestPrice === 0 ? (
                <span className="text-lg font-bold text-primary">Free</span>
              ) : (
                <>
                  <span className="text-xs text-muted-foreground">From</span>
                  <span className="text-lg font-bold text-foreground ml-1">${lowestPrice.toFixed(2)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
