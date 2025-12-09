"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { eventApi } from "@/lib/api";
import { EventDetailHero } from "./event-detail-hero";
import { EventDetailContent } from "./event-detail-content";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import type { Event } from "@/lib/types";

interface EventDetailClientProps {
  slug: string;
}

export function EventDetailClient({ slug }: EventDetailClientProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  const fetchEvent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await eventApi.getBySlug(slug);
      if (response.data) {
        setEvent(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load event");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Event Not Found</h1>
          <p className="text-foreground/60 mb-4">{error || "The event you're looking for doesn't exist."}</p>
          <Button asChild>
            <Link href="/events">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Events
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EventDetailHero event={event} />
      <EventDetailContent event={event} />
    </div>
  );
}
