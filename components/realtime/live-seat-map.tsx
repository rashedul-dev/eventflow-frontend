"use client";

import { useEffect, useState, useCallback } from "react";
import { useAvailableSeats, useSeatingChart } from "@/lib/api/hooks";
import { wsClient } from "@/lib/api/websocket";
import { cn } from "@/lib/utils";
import type { Seat, SeatStatus } from "@/lib/types";

interface LiveSeatMapProps {
  eventId: string;
  onSeatSelect?: (seat: Seat) => void;
  selectedSeats?: string[];
  maxSelectable?: number;
}

const seatStatusColors: Record<SeatStatus, string> = {
  AVAILABLE: "bg-primary hover:bg-primary/80 cursor-pointer",
  RESERVED: "bg-yellow-500/50 cursor-not-allowed",
  SOLD: "bg-secondary cursor-not-allowed",
  BLOCKED: "bg-muted cursor-not-allowed",
};

export function LiveSeatMap({ eventId, onSeatSelect, selectedSeats = [], maxSelectable = 10 }: LiveSeatMapProps) {
  const { data: seatingData, isLoading: chartLoading } = useSeatingChart(eventId);
  const { data: seatsData, isLoading: seatsLoading, refetch } = useAvailableSeats(eventId);
  const [localSeats, setLocalSeats] = useState<Map<string, Seat>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  // Initialize local seats from API data
  useEffect(() => {
    if (seatsData?.data) {
      const seatMap = new Map<string, Seat>();
      seatsData.data.forEach((seat) => seatMap.set(seat.id, seat));
      setLocalSeats(seatMap);
    }
  }, [seatsData]);

  // WebSocket subscription for real-time updates
  useEffect(() => {
    const unsubConnect = wsClient.onConnect(() => setIsConnected(true));
    const unsubDisconnect = wsClient.onDisconnect(() => setIsConnected(false));

    // Subscribe to seat updates
    const unsubSeatUpdate = wsClient.on("seat_update", (payload: { seatId: string; status: SeatStatus }) => {
      setLocalSeats((prev) => {
        const newMap = new Map(prev);
        const seat = newMap.get(payload.seatId);
        if (seat) {
          newMap.set(payload.seatId, { ...seat, status: payload.status });
        }
        return newMap;
      });
    });

    // Subscribe to bulk seat updates
    const unsubBulkUpdate = wsClient.on("seats_bulk_update", (payload: { eventId: string }) => {
      if (payload.eventId === eventId) {
        refetch();
      }
    });

    // Join event room
    wsClient.send("join_event", { eventId });

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubSeatUpdate();
      unsubBulkUpdate();
      wsClient.send("leave_event", { eventId });
    };
  }, [eventId, refetch]);

  const handleSeatClick = useCallback(
    (seat: Seat) => {
      if (seat.status !== "AVAILABLE") return;
      if (selectedSeats.includes(seat.id) || selectedSeats.length < maxSelectable) {
        onSeatSelect?.(seat);
      }
    },
    [onSeatSelect, selectedSeats, maxSelectable]
  );

  if (chartLoading || seatsLoading) {
    return (
      <div className="bg-background border border-secondary/30 rounded-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  const chart = seatingData?.data;
  const seats = Array.from(localSeats.values());

  // Group seats by section and row
  const sectionedSeats = seats.reduce((acc, seat) => {
    const sectionId = seat.sectionId || "default";
    if (!acc[sectionId]) acc[sectionId] = {};
    if (!acc[sectionId][seat.row]) acc[sectionId][seat.row] = [];
    acc[sectionId][seat.row].push(seat);
    return acc;
  }, {} as Record<string, Record<string, Seat[]>>);

  return (
    <div className="bg-background border border-secondary/30 rounded-xl p-6 space-y-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Select Your Seats</h3>
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", isConnected ? "bg-primary animate-pulse" : "bg-red-500")} />
          <span className="text-xs text-muted-foreground">{isConnected ? "Live updates" : "Reconnecting..."}</span>
        </div>
      </div>

      {/* Stage indicator */}
      <div className="relative">
        <div className="bg-secondary/50 rounded-lg py-3 px-6 text-center">
          <span className="text-sm text-foreground font-medium tracking-wider uppercase">Stage</span>
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-secondary/50" />
      </div>

      {/* Seat grid */}
      <div className="space-y-6 pt-4">
        {Object.entries(sectionedSeats).map(([sectionId, rows]) => (
          <div key={sectionId} className="space-y-2">
            {chart?.sections?.find((s) => s.id === sectionId) && (
              <h4 className="text-sm font-medium text-primary">
                {chart.sections.find((s) => s.id === sectionId)?.name}
              </h4>
            )}
            {Object.entries(rows)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([row, rowSeats]) => (
                <div key={row} className="flex items-center gap-2">
                  <span className="w-6 text-xs text-muted-foreground font-mono">{row}</span>
                  <div className="flex gap-1 flex-wrap">
                    {rowSeats
                      .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
                      .map((seat) => {
                        const isSelected = selectedSeats.includes(seat.id);
                        return (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status !== "AVAILABLE"}
                            className={cn(
                              "w-7 h-7 rounded text-xs font-medium transition-all duration-200",
                              seat.status === "AVAILABLE" && !isSelected && seatStatusColors.AVAILABLE,
                              isSelected && "bg-primary ring-2 ring-primary/50 scale-110",
                              seat.status !== "AVAILABLE" && seatStatusColors[seat.status],
                              seat.isAccessible && "ring-1 ring-blue-400"
                            )}
                            title={`${row}${seat.number}${seat.isAccessible ? " (Accessible)" : ""}`}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-secondary/30">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary ring-2 ring-primary/50" />
          <span className="text-xs text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/50" />
          <span className="text-xs text-muted-foreground">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary" />
          <span className="text-xs text-muted-foreground">Sold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <span className="text-xs text-muted-foreground">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary ring-1 ring-blue-400" />
          <span className="text-xs text-muted-foreground">Accessible</span>
        </div>
      </div>

      {/* Selected summary */}
      {selectedSeats.length > 0 && (
        <div className="bg-secondary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <span className="text-primary font-semibold">{selectedSeats.length}</span> seat
            {selectedSeats.length !== 1 ? "s" : ""} selected
            {maxSelectable && ` (max ${maxSelectable})`}
          </p>
        </div>
      )}
    </div>
  );
}
