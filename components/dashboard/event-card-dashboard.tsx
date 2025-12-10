"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, MapPin, Users, MoreHorizontal, Edit, Eye, Trash2, Copy, Send, XCircle, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { eventApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Event, EventStatus } from "@/lib/types";

interface EventCardDashboardProps {
  event: Event;
  onDelete?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  onClone?: () => void;
}

export function EventCardDashboard({ event, onDelete, onCancel, onSubmit, onClone }: EventCardDashboardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [cloneDialog, setCloneDialog] = useState(false);
  const [cloneTitle, setCloneTitle] = useState(`${event.title} (Copy)`);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate ticket stats
  const totalTickets = event.ticketTypes?.reduce((sum, t) => sum + t.quantity, 0) || 0;
  const soldTickets = event.ticketTypes?.reduce((sum, t) => sum + t.quantitySold, 0) || 0;
  const soldPercentage = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-500";
      case "PENDING_APPROVAL":
        return "bg-amber-500/20 text-amber-500";
      case "DRAFT":
        return "bg-gray-500/20 text-gray-400";
      case "REJECTED":
        return "bg-red-500/20 text-red-500";
      case "CANCELLED":
        return "bg-red-500/20 text-red-500";
      case "COMPLETED":
        return "bg-blue-500/20 text-blue-500";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete?.();
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
      setDeleteDialog(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await onCancel?.();
      toast({
        title: "Event cancelled",
        description: "The event has been cancelled successfully.",
      });
      setCancelDialog(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to cancel event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit?.();
      toast({
        title: "Event submitted",
        description: "The event has been submitted for approval.",
      });
      setSubmitDialog(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClone = async () => {
    setIsLoading(true);
    try {
      const response = await eventApi.clone(event.id, { title: cloneTitle });
      toast({
        title: "Event cloned",
        description: "The event has been cloned successfully. Redirecting to edit...",
      });
      setCloneDialog(false);
      
      // Refresh the list or redirect to the new event
      if (onClone) {
        onClone();
      } else if (response.data?.id) {
        router.push(`/dashboard/organizer/events/${response.data.id}/edit`);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to clone event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="bg-background border-primary/20 hover:border-primary/40 transition-all duration-200 group overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-secondary/50 shrink-0">
              {event.coverImage ? (
                <Image src={event.coverImage || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-foreground/20" />
                </div>
              )}
              {/* Status badge overlay */}
              <div className="absolute top-2 left-2">
                <Badge className={getStatusColor(event.status)}>{event.status.replace("_", " ")}</Badge>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-secondary border-foreground/10">
                      <DropdownMenuItem asChild className="gap-2">
                        <Link href={`/events/${event.slug}`}>
                          <Eye className="h-4 w-4" /> View Event
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="gap-2">
                        <Link href={`/dashboard/organizer/events/${event.id}/edit`}>
                          <Edit className="h-4 w-4" /> Edit Event
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCloneDialog(true)} className="gap-2">
                        <Copy className="h-4 w-4" /> Clone Event
                      </DropdownMenuItem>
                      {event.status === "DRAFT" && onSubmit && (
                        <DropdownMenuItem onClick={() => setSubmitDialog(true)} className="gap-2 text-primary">
                          <Send className="h-4 w-4" /> Submit for Approval
                        </DropdownMenuItem>
                      )}
                      {event.status === "APPROVED" && onCancel && (
                        <DropdownMenuItem onClick={() => setCancelDialog(true)} className="gap-2 text-amber-500">
                          <XCircle className="h-4 w-4" /> Cancel Event
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-foreground/10" />
                      {onDelete && event.status === "DRAFT" && (
                        <DropdownMenuItem onClick={() => setDeleteDialog(true)} className="gap-2 text-red-400">
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/60 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(event.startDate)} at {formatTime(event.startDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.isVirtual ? "Online" : event.city || event.venueName || "TBD"}
                  </span>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between pt-3 border-t border-foreground/10">
                <div className="flex items-center gap-4">
                  {/* Tickets progress */}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-foreground/40" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {soldTickets} / {totalTickets}
                      </span>
                      <div className="w-20 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${soldPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/organizer/events/${event.id}`}>Manage</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this event? Ticket holders will be notified and refunds will be processed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)} disabled={isLoading}>
              No, Keep Event
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Cancel Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Dialog */}
      <Dialog open={submitDialog} onOpenChange={setSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit for Approval</DialogTitle>
            <DialogDescription>
              Submit this event for admin review? Once approved, it will be visible to the public.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone Dialog */}
      <Dialog open={cloneDialog} onOpenChange={setCloneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Event</DialogTitle>
            <DialogDescription>
              Create a duplicate of this event. You can customize the title and edit other details later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clone-title">New Event Title</Label>
              <Input
                id="clone-title"
                value={cloneTitle}
                onChange={(e) => setCloneTitle(e.target.value)}
                placeholder="Enter title for cloned event"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleClone} disabled={isLoading || !cloneTitle.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Clone Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}