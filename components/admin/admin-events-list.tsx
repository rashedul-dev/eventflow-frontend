"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { adminApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, MapPin, User, Loader2, CheckCircle, XCircle, Eye, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/lib/types";

export function AdminEventsList() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dialog state
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; eventId: string | null }>({
    open: false,
    eventId: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminApi.getPendingEvents();
      if (response.data) {
        setEvents(response.data);
      }
    } catch (err: any) {
      console.error("Fetch pending events error:", err);
      setError(err.message || "Failed to load pending events");
      toast({
        title: "Error",
        description: err.message || "Failed to load pending events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (eventId: string) => {
    setActionLoading(eventId);

    try {
      await adminApi.verifyEvent(eventId, { status: "APPROVED" });
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast({
        title: "Event Approved",
        description: "The event has been approved and is now live.",
      });
    } catch (err: any) {
      console.error("Approve event error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to approve event",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.eventId || !rejectionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(rejectDialog.eventId);

    try {
      await adminApi.verifyEvent(rejectDialog.eventId, {
        status: "REJECTED",
        rejectionReason: rejectionReason,
      });
      setEvents((prev) => prev.filter((e) => e.id !== rejectDialog.eventId));
      toast({
        title: "Event Rejected",
        description: "The event has been rejected and the organizer has been notified.",
      });
      setRejectDialog({ open: false, eventId: null });
      setRejectionReason("");
    } catch (err: any) {
      console.error("Reject event error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to reject event",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
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
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchPendingEvents} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="bg-secondary/30 border-foreground/10 p-8 text-center">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
        <p className="text-muted-foreground">No events pending verification.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="bg-secondary/30 border-foreground/10 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="relative w-full md:w-64 h-48 md:h-auto bg-muted shrink-0">
                {event.coverImage ? (
                  <Image src={event.coverImage || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge className="bg-amber-500/20 text-amber-500 mb-2">Pending Review</Badge>
                    <h3 className="text-xl font-semibold text-foreground">{event.title}</h3>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {event.shortDescription || event.description}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.startDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.isVirtual ? "Online" : event.city || event.venueName}
                  </span>
                  {event.organizer && (
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {event.organizer.organizationName || `${event.organizer.firstName} ${event.organizer.lastName}`}
                    </span>
                  )}
                </div>

                {/* Ticket Types Info */}
                {event.ticketTypes && event.ticketTypes.length > 0 && (
                  <div className="mb-4 text-sm">
                    <span className="text-muted-foreground">Ticket Types: </span>
                    <span className="text-foreground font-medium">
                      {event.ticketTypes.length} type{event.ticketTypes.length > 1 ? 's' : ''} 
                      {' '}(${Math.min(...event.ticketTypes.map(t => t.price))} - ${Math.max(...event.ticketTypes.map(t => t.price))})
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/events/${event.slug}`} target="_blank">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Link>
                  </Button>
                  <Button size="sm" onClick={() => handleApprove(event.id)} disabled={actionLoading === event.id}>
                    {actionLoading === event.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setRejectDialog({ open: true, eventId: event.id })}
                    disabled={actionLoading === event.id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => !actionLoading && setRejectDialog({ open, eventId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Event</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this event. This will be shared with the organizer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Rejection Reason *</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Explain why this event is being rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              disabled={actionLoading !== null}
              className="min-h-[100px]"
            />
            {rejectionReason.length < 10 && rejectionReason.length > 0 && (
              <p className="text-xs text-muted-foreground">Minimum 10 characters required</p>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setRejectDialog({ open: false, eventId: null });
                setRejectionReason("");
              }}
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={!rejectionReason.trim() || rejectionReason.length < 10 || actionLoading !== null}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Reject Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}