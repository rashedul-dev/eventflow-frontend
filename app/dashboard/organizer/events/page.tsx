"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { eventApi } from "@/lib/api";
import { EventCardDashboard } from "@/components/dashboard/event-card-dashboard";
import type { Event } from "@/lib/types";

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await eventApi.getMyEvents();
      if (response.data) {
        setEvents(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await eventApi.delete(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err: any) {
      console.error("Failed to delete event:", err);
    }
  };

  const handleCancel = async (eventId: string) => {
    try {
      await eventApi.cancel(eventId);
      fetchEvents(); // Refresh list
    } catch (err: any) {
      console.error("Failed to cancel event:", err);
    }
  };

  const handleSubmit = async (eventId: string) => {
    try {
      await eventApi.submitForApproval(eventId);
      fetchEvents(); // Refresh list
    } catch (err: any) {
      console.error("Failed to submit event:", err);
    }
  };

  const handleClone = () => {
    fetchEvents(); // Refresh list after cloning
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Events</h1>
          <p className="text-foreground/60 mt-1">Manage and monitor all your events.</p>
        </div>
        {events.length === 0 && (
          <Button asChild>
            <Link href="/dashboard/organizer/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchEvents} variant="outline">
            Try Again
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven't created any events yet.</p>
          <Button asChild>
            <Link href="/dashboard/organizer/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Event
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => (
            <EventCardDashboard
              key={event.id}
              event={event}
              onDelete={() => handleDelete(event.id)}
              onCancel={() => handleCancel(event.id)}
              onSubmit={() => handleSubmit(event.id)}
              onClone={handleClone}
            />
          ))}
        </div>
      )}
    </div>
  );
}
