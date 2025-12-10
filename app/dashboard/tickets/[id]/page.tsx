"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ticketApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  Download,
  Share2,
  Send,
  Loader2,
  QrCode as QrCodeIcon,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";
import type { Ticket } from "@/lib/types";
import { createEventFromTicket, downloadICS } from "@/lib/calender";

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ticketApi.getById(id);
      if (response.data) {
        setTicket(response.data);
      } else {
        setError("Ticket not found");
      }
    } catch (err: any) {
      console.error("Failed to load ticket:", err);
      setError(err.message || "Failed to load ticket");
      toast({
        title: "Error",
        description: err.message || "Failed to load ticket",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("main-qr-code");
    if (!svg) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");

        const downloadLink = document.createElement("a");
        downloadLink.download = `ticket-${ticket?.ticketNumber}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();

        toast({
          title: "QR Code Downloaded",
          description: "Your QR code has been saved",
        });
      };

      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTicket = async () => {
    if (!ticket) return;

    setDownloadLoading(true);
    try {
      toast({
        title: "Preparing Download",
        description: "Generating your ticket PDF...",
      });

      const blob = await ticketApi.downloadTicket(ticket.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-${ticket.ticketNumber || ticket.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: "Your ticket has been downloaded successfully",
      });
    } catch (err: any) {
      console.error("Download error:", err);
      toast({
        title: "Download Failed",
        description: err.message || "Failed to download ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!ticket) return;

    try {
      const calendarEvent = createEventFromTicket(ticket);
      downloadICS(calendarEvent);
      toast({
        title: "Calendar Event Added",
        description: "Event has been added to your calendar",
      });
    } catch (err: any) {
      console.error("Failed to add to calendar:", err);
      toast({
        title: "Error",
        description: "Failed to add to calendar",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: ticket?.event?.title || "Event Ticket",
          text: `My ticket for ${ticket?.event?.title}`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy link
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Ticket link copied to clipboard",
        });
      }
    } catch (err: any) {
      // User cancelled share or error occurred
      if (err.name !== "AbortError") {
        toast({
          title: "Error",
          description: "Failed to share ticket",
          variant: "destructive",
        });
      }
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
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "VALID":
        return "bg-primary/20 text-primary border-primary/30";
      case "USED":
      case "CHECKED_IN":
        return "bg-foreground/20 text-foreground/60 border-foreground/30";
      case "CANCELLED":
      case "REFUNDED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "TRANSFERRED":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error || "Ticket not found"}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/tickets">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Link>
        </Button>
      </div>
    );
  }

  const qrCodeData = ticket.qrCode || ticket.ticketNumber || ticket.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/tickets">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadTicket} disabled={downloadLoading}>
            {downloadLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info Card */}
          <Card>
            <CardContent className="p-6">
              {/* Event Image */}
              <div className="relative h-48 rounded-lg overflow-hidden mb-6">
                <img
                  src={ticket.event?.coverImage || "/placeholder.svg?height=300&width=600&query=event"}
                  alt={ticket.event?.title || "Event"}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                    <h1 className="text-2xl font-bold mt-2">{ticket.event?.title}</h1>
                    <p className="text-muted-foreground">
                      {ticket.ticketType?.name} • ${ticket.pricePaid} {ticket.currency}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.event?.startDate ? formatDate(ticket.event.startDate) : "TBD"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.event?.startDate ? formatTime(ticket.event.startDate) : "TBD"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.event?.isVirtual ? "Online Event" : ticket.event?.venueName || "TBD"}
                      </p>
                      {!ticket.event?.isVirtual && ticket.event?.city && (
                        <p className="text-sm text-muted-foreground">
                          {ticket.event.city}, {ticket.event.state}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {ticket.event?.virtualLink && ticket.event.isVirtual && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary">Virtual Event Link</p>
                        <p className="text-sm text-muted-foreground">Available after check-in</p>
                      </div>
                      <Button size="sm" asChild>
                        <a href={ticket.event.virtualLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Join
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendee Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attendee Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {ticket.attendeeName && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{ticket.attendeeName}</p>
                    </div>
                  </div>
                )}

                {ticket.attendeeEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{ticket.attendeeEmail}</p>
                    </div>
                  </div>
                )}

                {ticket.attendeePhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{ticket.attendeePhone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <QrCodeIcon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ticket Number</p>
                    <p className="font-medium font-mono">{ticket.ticketNumber}</p>
                  </div>
                </div>
              </div>

              {ticket.checkedInAt && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm font-medium text-green-500">
                    ✓ Checked in on {formatDate(ticket.checkedInAt)} at {formatTime(ticket.checkedInAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QR Code Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-xl">
                  <QRCode id="main-qr-code" value={qrCodeData} size={200} level="H" />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Present this QR code at the event entrance for check-in
                </p>
              </div>

              <Button onClick={handleDownloadQR} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>

              <Button onClick={handleAddToCalendar} variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/events/${ticket.event?.slug}`}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Event Details
                </Link>
              </Button>
              <Button variant="outline" disabled className="w-full justify-start">
                <Send className="w-4 h-4 mr-2" />
                Transfer Ticket
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
