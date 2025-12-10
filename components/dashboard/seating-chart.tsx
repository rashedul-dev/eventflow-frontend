"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut, RotateCcw, Grid3X3 } from "lucide-react";

interface Seat {
  id: string;
  row: string;
  number: number;
  status: "available" | "reserved" | "sold" | "selected";
  price?: number;
  category?: string;
}

interface SeatingChartProps {
  eventId?: string;
  editable?: boolean;
  onSeatSelect?: (seats: Seat[]) => void;
}

// Generate sample seating data
const generateSeats = (): Seat[] => {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seats: Seat[] = [];

  rows.forEach((row) => {
    const seatsInRow = row <= "C" ? 12 : row <= "F" ? 14 : 16;
    for (let i = 1; i <= seatsInRow; i++) {
      const random = Math.random();
      seats.push({
        id: `${row}${i}`,
        row,
        number: i,
        status: random < 0.3 ? "sold" : random < 0.5 ? "reserved" : "available",
        price: row <= "C" ? 150 : row <= "F" ? 100 : 75,
        category: row <= "C" ? "VIP" : row <= "F" ? "Premium" : "Standard",
      });
    }
  });

  return seats;
};

export function SeatingChart({ editable = false, onSeatSelect }: SeatingChartProps) {
  const [seats, setSeats] = useState<Seat[]>(generateSeats);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [zoom, setZoom] = useState(1);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "sold") return;

    const isSelected = selectedSeats.find((s) => s.id === seat.id);

    if (isSelected) {
      const newSelected = selectedSeats.filter((s) => s.id !== seat.id);
      setSelectedSeats(newSelected);
      onSeatSelect?.(newSelected);
    } else {
      const newSelected = [...selectedSeats, { ...seat, status: "selected" as const }];
      setSelectedSeats(newSelected);
      onSeatSelect?.(newSelected);
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.find((s) => s.id === seat.id)) {
      return "bg-primary text-secondary";
    }
    switch (seat.status) {
      case "sold":
        return "bg-foreground/20 text-foreground/30 cursor-not-allowed";
      case "reserved":
        return "bg-secondary border-primary/50 text-foreground/50";
      case "available":
        return "bg-secondary/50 border-foreground/20 hover:border-primary hover:bg-primary/20 cursor-pointer";
      default:
        return "bg-secondary/50";
    }
  };

  const rows = [...new Set(seats.map((s) => s.row))];

  const resetZoom = () => setZoom(1);
  const zoomIn = () => setZoom((z) => Math.min(z + 0.2, 2));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));

  return (
    <Card className="bg-secondary/30 border-foreground/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-primary" />
          Seating Chart
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={zoomOut} className="h-8 w-8 bg-transparent">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-foreground/60 min-w-3rem text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={zoomIn} className="h-8 w-8 bg-transparent">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={resetZoom} className="h-8 w-8 bg-transparent">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-secondary/50 border border-foreground/20" />
            <span className="text-foreground/60">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span className="text-foreground/60">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-secondary border border-primary/50" />
            <span className="text-foreground/60">Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-foreground/20" />
            <span className="text-foreground/60">Sold</span>
          </div>
        </div>

        {/* Stage */}
        <div className="relative overflow-auto">
          <div
            className="min-w-[600px] transition-transform duration-200"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          >
            {/* Stage indicator */}
            <div className="w-2/3 mx-auto mb-8 py-3 px-6 rounded-lg bg-linear-to-b from-primary/20 to-transparent border border-primary/30 text-center">
              <span className="text-sm font-medium text-primary">STAGE</span>
            </div>

            {/* Seats */}
            <div className="space-y-2">
              {rows.map((row) => {
                const rowSeats = seats.filter((s) => s.row === row);
                return (
                  <div key={row} className="flex items-center justify-center gap-1">
                    <span className="w-6 text-sm font-medium text-foreground/50">{row}</span>
                    <div className="flex gap-1">
                      {rowSeats.map((seat, idx) => (
                        <div key={seat.id} className="flex items-center">
                          {/* Aisle gap in the middle */}
                          {idx === Math.floor(rowSeats.length / 2) && <div className="w-6" />}
                          <button
                            type="button"
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === "sold" && !editable}
                            className={cn(
                              "w-6 h-6 rounded text-xs font-medium border transition-all duration-150",
                              getSeatColor(seat)
                            )}
                            title={`Row ${seat.row}, Seat ${seat.number} - $${seat.price} (${seat.category})`}
                          >
                            {seat.number}
                          </button>
                        </div>
                      ))}
                    </div>
                    <span className="w-6 text-sm font-medium text-foreground/50">{row}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selection summary */}
        {selectedSeats.length > 0 && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} selected
                </p>
                <p className="text-xs text-foreground/60">{selectedSeats.map((s) => s.id).join(", ")}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  ${selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0)}
                </p>
                <p className="text-xs text-foreground/60">Total</p>
              </div>
            </div>
          </div>
        )}

        {/* Category pricing */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-foreground/10">
          <div className="text-center p-3 rounded-lg bg-background/50">
            <p className="text-xs text-foreground/50 mb-1">VIP (Rows A-C)</p>
            <p className="text-lg font-bold text-primary">$150</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <p className="text-xs text-foreground/50 mb-1">Premium (D-F)</p>
            <p className="text-lg font-bold text-foreground">$100</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <p className="text-xs text-foreground/50 mb-1">Standard (G-H)</p>
            <p className="text-lg font-bold text-foreground">$75</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
