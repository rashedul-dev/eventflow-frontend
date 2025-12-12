"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { eventApi } from "@/lib/api";
import type { Event } from "@/lib/types";
import Loading from "@/app/dashboard/admin/reports/loading";

export default function Page() {
  return (
    <Suspense fallback={<div>{<Loading />}</div>}>
      <EventList />
    </Suspense>
  );
}

export function EventList() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Get filter params from URL - use correct parameter names
  const searchTerm = searchParams.get("searchTerm") || undefined;
  const category = searchParams.get("category") || undefined;
  const city = searchParams.get("city") || undefined;
  const startDateFrom = searchParams.get("startDateFrom") || undefined;
  const isVirtual = searchParams.get("isVirtual") === "true" ? true : undefined;

  useEffect(() => {
    fetchEvents(1, true);
  }, [searchTerm, category, city, startDateFrom, isVirtual]);

  const fetchEvents = async (pageNum: number, reset = false) => {
    if (reset) {
      setIsLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const response = await eventApi.getAll({
        page: pageNum,
        limit: 12,
        searchTerm,
        category,
        city,
        startDateFrom,
        isVirtual,
        status: "APPROVED", // Only show approved events publicly
        sortBy: "startDate",
        sortOrder: "asc",
        include: "ticketTypes,organizer", // FIXED: Include ticket types to fetch prices
      });

      if (response.data) {
        if (reset) {
          setEvents(response.data);
        } else {
          setEvents((prev) => [...prev, ...response.data!]);
        }

        // Check if there are more events
        setHasMore(response.meta ? pageNum < response.meta.totalPages : false);
        setPage(pageNum);
      }
    } catch (err: any) {
      console.error("Fetch events error:", err);
      setError(err.message || "Failed to load events");
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchEvents(page + 1, false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load events</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => fetchEvents(1, true)}>Try Again</Button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No events found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={loadMore} variant="outline" disabled={loadingMore}>
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Events"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
