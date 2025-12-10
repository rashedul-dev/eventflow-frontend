"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { eventApi } from "@/lib/api";
import { MoreHorizontal, Edit, Eye, Trash2, Users, Loader2, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function EventsTable() {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await eventApi.getMyEvents();
      setEvents(response.data || []);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await eventApi.delete(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
    > = {
      PUBLISHED: { variant: "default", className: "bg-primary/20 text-primary hover:bg-primary/30" },
      DRAFT: { variant: "secondary", className: "bg-foreground/20 text-foreground/60" },
      PENDING_APPROVAL: { variant: "outline", className: "bg-yellow-500/20 text-yellow-500" },
      APPROVED: { variant: "default", className: "bg-green-500/20 text-green-500" },
      REJECTED: { variant: "destructive", className: "" },
      CANCELLED: { variant: "destructive", className: "" },
    };
    const config = variants[status] || variants.DRAFT;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <Card className="bg-secondary/30 border-foreground/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Your Events</CardTitle>
        <Button size="sm" asChild>
          <Link href="/dashboard/organizer/create">Create Event</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">Create your first event to get started.</p>
            <Button asChild>
              <Link href="/dashboard/organizer/create">Create Event</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Event</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Tickets</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-foreground/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 5).map((event) => (
                  <tr key={event.id} className="border-b border-foreground/5 hover:bg-foreground/5">
                    <td className="py-4 px-4">
                      <span className="font-medium text-foreground">{event.title}</span>
                    </td>
                    <td className="py-4 px-4 text-foreground/70">{new Date(event.startDate).toLocaleDateString()}</td>
                    <td className="py-4 px-4">{getStatusBadge(event.status)}</td>
                    <td className="py-4 px-4 text-foreground/70">
                      {event._count?.tickets || 0} / {event.capacity || "∞"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-secondary border-foreground/10">
                          <DropdownMenuItem asChild>
                            <Link href={`/events/${event.slug}`} className="gap-2">
                              <Eye className="h-4 w-4" /> View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/organizer/events/${event.id}/attendees`} className="gap-2">
                              <Users className="h-4 w-4" /> Attendees
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/organizer/events/${event.id}/edit`} className="gap-2">
                              <Edit className="h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-red-400" onClick={() => handleDelete(event.id)}>
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
