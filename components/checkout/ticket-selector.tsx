"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus, Ticket, Check, AlertCircle } from "lucide-react";
import type { TicketType } from "@/lib/types";

interface TicketSelectorProps {
  ticketTypes: TicketType[];
  initialSelection?: { ticketTypeId: string; quantity: number }[];
  onSelectionChange: (selection: { ticketTypeId: string; quantity: number }[]) => void;
  className?: string;
}

export function TicketSelector({ ticketTypes, initialSelection, onSelectionChange, className }: TicketSelectorProps) {
  const [selections, setSelections] = useState<Record<string, number>>(() => {
    if (initialSelection && initialSelection.length > 0) {
      return initialSelection.reduce((acc, item) => {
        acc[item.ticketTypeId] = item.quantity;
        return acc;
      }, {} as Record<string, number>);
    }
    return {};
  });

  useEffect(() => {
    if (initialSelection && initialSelection.length > 0) {
      const initial = initialSelection.reduce((acc, item) => {
        acc[item.ticketTypeId] = item.quantity;
        return acc;
      }, {} as Record<string, number>);
      setSelections(initial);
    }
  }, []);

  const updateQuantity = (ticketTypeId: string, delta: number, max: number, min: number) => {
    setSelections((prev) => {
      const current = prev[ticketTypeId] || 0;
      const newQuantity = Math.max(0, Math.min(current + delta, max));
      const newSelections = { ...prev, [ticketTypeId]: newQuantity };

      // Remove if 0
      if (newQuantity === 0) {
        delete newSelections[ticketTypeId];
      }

      // Convert to array format for parent
      const selectionArray = Object.entries(newSelections)
        .filter(([_, qty]) => qty > 0)
        .map(([id, quantity]) => ({ ticketTypeId: id, quantity }));

      onSelectionChange(selectionArray);
      return newSelections;
    });
  };

  const formatPrice = (price: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price);
  };

  const getAvailability = (ticketType: TicketType) => {
    const available = ticketType.quantity - ticketType.quantitySold;
    if (available <= 0) return { text: "Sold Out", color: "text-red-500", urgent: true };
    if (available <= 5) return { text: `Only ${available} left!`, color: "text-red-500", urgent: true };
    if (available <= 10) return { text: `${available} remaining`, color: "text-yellow-500", urgent: false };
    return { text: `${available} available`, color: "text-muted-foreground", urgent: false };
  };

  if (!ticketTypes || ticketTypes.length === 0) {
    return (
      <div className={cn("p-8 text-center rounded-xl border-2 border-dashed border-secondary", className)}>
        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No tickets available for this event.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {ticketTypes.map((ticketType) => {
        const quantity = selections[ticketType.id] || 0;
        const isSelected = quantity > 0;
        const available = ticketType.quantity - ticketType.quantitySold;
        const isSoldOut = available <= 0;
        const availability = getAvailability(ticketType);

        // Safely get category as string
        const categoryStr = ticketType.category ?? ""; // already a string
        const isFreeTicket = categoryStr.toUpperCase() === "FREE" || ticketType.price === 0;

        return (
          <div
            key={ticketType.id}
            className={cn(
              "relative p-5 rounded-xl border-2 transition-all duration-200",
              "bg-black",
              isSoldOut && "opacity-60 cursor-not-allowed",
              isSelected ? "border-primary shadow-lg shadow-primary/10" : "border-secondary hover:border-primary/50"
            )}
          >
            {/* Selected Indicator */}
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-black" />
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              {/* Ticket Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                  <h3 className="font-semibold text-foreground">{ticketType.name}</h3>
                  {isFreeTicket && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">
                      FREE
                    </span>
                  )}
                  {isSoldOut && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-500">
                      SOLD OUT
                    </span>
                  )}
                </div>
                {ticketType.description && (
                  <p className="text-sm text-muted-foreground mb-3">{ticketType.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <span className={cn(availability.color, availability.urgent && "font-medium")}>
                    {availability.text}
                  </span>
                  {ticketType.maxPerOrder > 1 && (
                    <span className="text-muted-foreground">Max {ticketType.maxPerOrder} per order</span>
                  )}
                </div>
              </div>

              {/* Price & Quantity */}
              <div className="text-right flex flex-col items-end gap-3">
                <div>
                  {ticketType.originalPrice && ticketType.originalPrice > ticketType.price && (
                    <span className="text-sm text-muted-foreground line-through mr-2">
                      {formatPrice(ticketType.originalPrice, ticketType.currency)}
                    </span>
                  )}
                  <span className="text-xl font-bold text-primary">
                    {isFreeTicket ? "Free" : formatPrice(ticketType.price, ticketType.currency)}
                  </span>
                </div>

                {/* Quantity Controls */}
                {!isSoldOut && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          ticketType.id,
                          -1,
                          Math.min(ticketType.maxPerOrder, available),
                          ticketType.minPerOrder
                        )
                      }
                      disabled={quantity <= 0}
                      className={cn(
                        "p-2 rounded-lg border transition-all",
                        quantity > 0
                          ? "border-primary text-primary hover:bg-primary/10"
                          : "border-secondary text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-semibold text-foreground">{quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          ticketType.id,
                          1,
                          Math.min(ticketType.maxPerOrder, available),
                          ticketType.minPerOrder
                        )
                      }
                      disabled={quantity >= Math.min(ticketType.maxPerOrder, available)}
                      className={cn(
                        "p-2 rounded-lg border transition-all",
                        quantity < Math.min(ticketType.maxPerOrder, available)
                          ? "border-primary text-primary hover:bg-primary/10"
                          : "border-secondary text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Subtotal */}
            {isSelected && !isFreeTicket && (
              <div className="mt-4 pt-4 border-t border-secondary flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(ticketType.price * quantity, ticketType.currency)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
