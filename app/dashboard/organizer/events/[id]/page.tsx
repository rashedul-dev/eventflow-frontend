"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  BarChart3,
  Users,
  DollarSign,
  Grid3X3,
  ListChecks,
  Settings,
  Eye,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Send,
  Copy,
  ScanLine,
} from "lucide-react";
import { ApiResponse, eventApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CapacityManager } from "@/components/events/capacity-manager";
import type { CloneEventResponse, Event, EventStatus } from "@/lib/types";

export default function EventManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    setIsLoading(true);
    try {
      const response = await eventApi.getById(eventId);
      if (response.data) {
        setEvent(response.data);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load event",
        variant: "destructive",
      });
      router.push("/dashboard/organizer/events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      await eventApi.submitForApproval(eventId);
      toast({
        title: "Event submitted",
        description: "Your event has been submitted for admin approval.",
      });
      fetchEvent();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit event",
        variant: "destructive",
      });
    }
  };

  const handleClone = async () => {
    try {
      const response: ApiResponse<CloneEventResponse> = await eventApi.clone(eventId, {
        title: `${event?.title} (Copy)`,
      });
      toast({
        title: "Event cloned",
        description: "Your event has been cloned successfully.",
      });
      if (response.data?.id) {
        router.push(`/dashboard/organizer/events/${response.data.id}/edit`);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to clone event",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "PENDING_APPROVAL":
        return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "DRAFT":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "REJECTED":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "CANCELLED":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "COMPLETED":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const totalTickets = event.ticketTypes?.reduce((sum, t) => sum + t.quantity, 0) || 0;
  const soldTickets = event.ticketTypes?.reduce((sum, t) => sum + t.quantitySold, 0) || 0;
  const revenue = event.ticketTypes?.reduce((sum, t) => sum + (t.price / 1) * t.quantitySold, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/organizer/events">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
              <Badge className={getStatusColor(event.status)}>{event.status.replace("_", " ")}</Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(event.startDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(event.startDate)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.isVirtual ? "Online Event" : event.city || event.venueName || "TBD"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="default" asChild>
            <Link href={`/dashboard/organizer/events/${eventId}/check-in`}>
              <ScanLine className="w-4 h-4 mr-2" />
              Check-In
            </Link>
          </Button>
          {event.status === "DRAFT" && (
            <Button onClick={handleSubmitForApproval}>
              <Send className="w-4 h-4 mr-2" />
              Submit for Approval
            </Button>
          )}
          <Button variant="outline" onClick={handleClone}>
            <Copy className="w-4 h-4 mr-2" />
            Clone
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/organizer/events/${eventId}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          {event.status === "APPROVED" && (
            <Button variant="outline" asChild>
              <Link href={`/events/${event.slug}`} target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                View Public Page
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{soldTickets}</p>
                <p className="text-xs text-muted-foreground mt-1">of {totalTickets} total</p>
              </div>
              <Users className="w-8 h-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">${(revenue / 1).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">total sales</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{event.capacity || totalTickets}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((soldTickets / (event.capacity || totalTickets)) * 100).toFixed(0)}% filled
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Days Until Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {Math.max(0, Math.ceil((new Date(event.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}{" "}
                </p>
                <p className="text-xs text-muted-foreground mt-1">countdown</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="seating">Seating</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
          {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </div>

              {event.shortDescription && (
                <div>
                  <h3 className="font-medium mb-2">Short Description</h3>
                  <p className="text-muted-foreground">{event.shortDescription}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h3 className="font-medium mb-2">Event Type</h3>
                  <p className="text-muted-foreground capitalize">{event.category || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Timezone</h3>
                  <p className="text-muted-foreground">{event.timezone}</p>
                </div>
                {!event.isVirtual && (
                  <>
                    <div>
                      <h3 className="font-medium mb-2">Venue</h3>
                      <p className="text-muted-foreground">{event.venueName || "TBD"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Address</h3>
                      <p className="text-muted-foreground">
                        {event.venueAddress || "TBD"}
                        {event.city && `, ${event.city}`}
                        {event.state && `, ${event.state}`}
                      </p>
                    </div>
                  </>
                )}
                {event.isVirtual && (
                  <>
                    <div>
                      <h3 className="font-medium mb-2">Platform</h3>
                      <p className="text-muted-foreground capitalize">{event.virtualPlatform || "Not specified"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Event Link</h3>
                      <p className="text-muted-foreground break-all">{event.virtualLink || "Will be provided"}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Types</CardTitle>
            </CardHeader>
            <CardContent>
              {event.ticketTypes && event.ticketTypes.length > 0 ? (
                <div className="space-y-3">
                  {event.ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div>
                        <h4 className="font-medium">{ticket.name}</h4>
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${(ticket.price / 1).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.quantitySold} / {ticket.quantity} sold
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No ticket types configured yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <CapacityManager
            eventId={eventId}
            currentCapacity={event.capacity || totalTickets}
            soldTickets={soldTickets}
          />
        </TabsContent>

        <TabsContent value="seating" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5" />
                  Seating Chart Management
                </span>
                <Button asChild>
                  <Link href={`/dashboard/organizer/events/${eventId}/seating`}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Seating
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>Set up and manage seating arrangements for your event</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create sections, rows, and individual seats. Block specific seats or configure pricing per section.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5" />
                  Waitlist Management
                </span>
                <Button asChild>
                  <Link href={`/dashboard/organizer/events/${eventId}/waitlist`}>
                    <Users className="w-4 h-4 mr-2" />
                    Manage Waitlist
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>View and notify people waiting for tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                When your event is sold out, interested attendees can join the waitlist. Notify them when tickets become
                available.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Attendee Management
                </span>
                <Button asChild>
                  <Link href={`/dashboard/organizer/events/${eventId}/attendees`}>View All Attendees</Link>
                </Button>
              </CardTitle>
              <CardDescription>Manage attendees and check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  View attendee list, manage check-ins, and communicate with ticket holders.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Event Analytics
                </span>
                <Button asChild>
                  <Link href={`/dashboard/organizer/events/${eventId}/analytics`}>View Full Analytics</Link>
                </Button>
              </CardTitle>
              <CardDescription>Track performance and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  View detailed analytics including ticket sales over time, revenue breakdown, and attendee
                  demographics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
