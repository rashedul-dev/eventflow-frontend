"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, ScanLine, Users, Calendar, Clock } from "lucide-react";
import { eventApi, ticketApi, authApi } from "@/lib/api";
import { toast } from "sonner";
import type { CheckInRecord, CheckInResponse, Event } from "@/lib/types";

export default function EventCheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<CheckInResponse | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);
  const [totalCheckIns, setTotalCheckIns] = useState(0);

  useEffect(() => {
    initializePage();
  }, [eventId]);

  const initializePage = async () => {
    await fetchEvent();
    await fetchCheckInHistory();
  };

  const fetchEvent = async () => {
    setIsLoading(true);
    try {
      const response = await eventApi.getById(eventId);
      if (response.data) {
        setEvent(response.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load event");
      router.push("/dashboard/organizer/events");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCheckInHistory = async () => {
    try {
      // Fetch all tickets for this event with checked-in status
      const response = await ticketApi.getEventTickets(eventId, {
        status: "ACTIVE",
        limit: 100,
      });

      // Filter tickets that have been checked in
      const tickets = Array.isArray(response.data) ? response.data : [];
      const checkedInTickets = tickets.filter((ticket: any) => ticket.checkedInAt !== null);

      // Transform tickets to check-in records format matching CheckInRecord interface
      const checkIns: CheckInRecord[] = checkedInTickets.map((ticket: any) => ({
        id: ticket.id,
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        checkedInAt: ticket.checkedInAt,
        checkedInBy: ticket.checkedInBy || "Unknown",
        attendeeName: ticket.attendeeName || ticket.attendee?.name || null,
        pricePaid: ticket.pricePaid || ticket.price || 0,
        ticketType: ticket.ticketType || { name: "General Admission" },
        seat: ticket.seat || null,
      }));

      setCheckInHistory(checkIns);
      setTotalCheckIns(checkIns.length);
    } catch (err: any) {
      console.error("Failed to load check-in history:", err);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      toast.error("Please enter a ticket number or QR code");
      return;
    }

    setIsCheckingIn(true);
    setLastCheckIn(null);

    try {
      // Determine if input is ticketId (UUID), QR code, or ticket number
      let checkInData: { ticketId?: string; ticketNumber?: string; qrCode?: string };

      if (identifier.startsWith("QR-")) {
        // It's a QR code (starts with QR-)
        checkInData = { qrCode: identifier };
      } else if (
        identifier.length === 36 &&
        identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      ) {
        // It's a UUID ticketId (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
        checkInData = { ticketId: identifier };
      } else {
        // It's a ticket number (format: EVT-1-A3F9K2M7 or similar)
        checkInData = { ticketNumber: identifier };
      }

      const response = await ticketApi.checkIn(eventId, checkInData);

      if (!response.data) {
        throw new Error("Check-in response data is undefined");
      }

      // response.data contains the raw Prisma ticket object
      // Transform it to match CheckInResponse format
      const ticketData = response.data as any;

      const checkInResult: CheckInResponse = {
        success: response.success ?? true,
        message: response.message || "Ticket checked in successfully!",
        ticket: {
          id: ticketData.id,
          ticketNumber: ticketData.ticketNumber,
          status: ticketData.status,
          checkedInAt: ticketData.checkedInAt,
          ticketType: {
            name: ticketData.ticketType?.name || "General Admission",
          },
          seat: ticketData.seat
            ? {
                seatNumber: ticketData.seat.seatNumber,
                section: {
                  name: ticketData.seat.section?.name || "General",
                },
              }
            : null,
        },
        // Include event info if available in the response
        ...(ticketData.event && {
          event: {
            id: ticketData.event.id,
            title: ticketData.event.title,
          },
        }),
      };

      setLastCheckIn(checkInResult);
      toast.success(response.message || "Ticket checked in successfully!");
      setIdentifier(""); // Clear input

      // Refresh check-in history
      await fetchCheckInHistory();
    } catch (err: any) {
      const errorMessage = err.message?.toLowerCase() || "";

      if (errorMessage.includes("already been checked in")) {
        toast.error("This ticket has already been checked in");
      } else if (errorMessage.includes("not found")) {
        toast.error("Ticket not found");
      } else if (errorMessage.includes("cancelled") || errorMessage.includes("refunded")) {
        toast.error("This ticket is no longer valid");
      } else if (errorMessage.includes("forbidden") || errorMessage.includes("not authorized")) {
        toast.error("You are not authorized to check in tickets for this event");
      } else {
        toast.error(err.message || "Failed to check in ticket");
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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

  if (!event) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/dashboard/organizer/events/${eventId}`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Check-In</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Check-Ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold">{totalCheckIns}</p>
              <Users className="w-8 h-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Event Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm">
                {new Date(event.startDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Event Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm">
                {new Date(event.startDate).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="check-in" className="space-y-4">
        <TabsList>
          <TabsTrigger value="check-in">Check-In</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="check-in" className="space-y-4">
          {/* Check-In Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="w-5 h-5" />
                Scan Ticket
              </CardTitle>
              <CardDescription>Enter ticket number or QR code to check in attendees</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckIn} className="space-y-4">
                <div>
                  <label htmlFor="identifier" className="block text-sm font-medium mb-2">
                    Ticket Number or QR Code
                  </label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="e.g., EVT-1-A3F9K2M7 or QR-UUID"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isCheckingIn}
                    className="font-mono"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste or type the ticket identifier and press Enter
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isCheckingIn || !identifier.trim()}>
                  {isCheckingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking In...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Check In Ticket
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Last Check-In Result */}
          {lastCheckIn && (
            <Card>
              <CardContent className="pt-6">
                {lastCheckIn.success ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                      <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
                      <div>
                        <h3 className="font-semibold text-green-500">Check-In Successful</h3>
                        <p className="text-sm text-muted-foreground">{lastCheckIn.message}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Ticket Number</p>
                        <p className="font-mono font-medium">{lastCheckIn.ticket.ticketNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          {lastCheckIn.ticket.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Checked In At</p>
                        <p className="text-sm">{formatDate(lastCheckIn.ticket.checkedInAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ticket Type</p>
                        <p className="text-sm">{lastCheckIn.ticket.ticketType.name}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <XCircle className="w-8 h-8 text-red-500 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-500">Check-In Failed</h3>
                      <p className="text-sm text-muted-foreground">{lastCheckIn.message}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Check-In History</CardTitle>
              <CardDescription>Recent ticket check-ins for this event</CardDescription>
            </CardHeader>
            <CardContent>
              {checkInHistory.length > 0 ? (
                <div className="space-y-3">
                  {checkInHistory.map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-mono text-sm font-medium">{checkIn.ticketNumber}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {checkIn.ticketType.name}
                          {checkIn.attendeeName && ` • ${checkIn.attendeeName}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDate(checkIn.checkedInAt)}</p>
                        <Badge variant="outline" className="mt-1">
                          ${(checkIn.pricePaid / 1).toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No check-ins yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
