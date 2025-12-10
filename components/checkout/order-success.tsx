"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Download, Share2, Calendar, MapPin, Clock, ExternalLink, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";
import { ticketApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface OrderSuccessProps {
  orderNumber: string;
  tickets: any[]; // Accept actual API ticket structure
  className?: string;
}

export function OrderSuccess({ orderNumber, tickets, className }: OrderSuccessProps) {
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(true);
  const [downloadingTicket, setDownloadingTicket] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const addToCalendar = (ticket: any) => {
    const eventDate = ticket.event?.startDate || new Date().toISOString();
    const startDate = new Date(eventDate).toISOString().replace(/-|:|\.\d{3}/g, "");
    const endDate = new Date(new Date(eventDate).getTime() + 2 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d{3}/g, "");

    const eventTitle = ticket.event?.title || "Event";
    const eventLocation = ticket.event?.isVirtual
      ? "Online Event"
      : ticket.event?.venueName || ticket.event?.city || "TBD";

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventTitle
    )}&dates=${startDate}/${endDate}&location=${encodeURIComponent(eventLocation)}&details=${encodeURIComponent(
      `Ticket: ${ticket.ticketNumber || ticket.id}`
    )}`;

    window.open(calendarUrl, "_blank");
  };

  const shareTicket = async (ticket: any) => {
    const eventTitle = ticket.event?.title || "Event";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ticket for ${eventTitle}`,
          text: `I'm attending ${eventTitle}!`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Ticket link copied to clipboard",
      });
    }
  };

  const handleDownloadTicket = async (ticket: any) => {
    setDownloadingTicket(ticket.id);
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
      setDownloadingTicket(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-6">
          <Check className="h-10 w-10 text-black" />
          {showConfetti && <div className="absolute inset-0 animate-ping rounded-full bg-primary/50" />}
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">Order #{orderNumber} has been successfully placed.</p>
        <p className="text-sm text-muted-foreground mt-2">A confirmation email has been sent to your email address.</p>
      </div>

      {/* Tickets */}
      <div className="space-y-6">
        {tickets.map((ticket, index) => {
          const eventTitle = ticket.event?.title || "Event";
          const eventDate = ticket.event?.startDate || new Date().toISOString();
          const eventLocation = ticket.event?.isVirtual
            ? "Online Event"
            : ticket.event?.venueName || ticket.event?.city || "TBD";
          const ticketTypeName =
            typeof ticket.ticketType === "string" ? ticket.ticketType : ticket.ticketType?.name || "General";
          const attendeeName =
            ticket.attendeeName || ticket.user?.firstName
              ? `${ticket.user?.firstName} ${ticket.user?.lastName}`
              : "Attendee";
          const qrCodeData = ticket.qrCode || ticket.ticketNumber || ticket.id;

          return (
            <div key={ticket.id} className="relative overflow-hidden rounded-2xl border-2 border-primary bg-black">
              {/* Ticket Stub Cutouts */}
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background" />
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background" />

              {/* Top Section */}
              <div className="p-6 border-b border-dashed border-secondary">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-primary font-medium mb-1">
                      TICKET {index + 1} OF {tickets.length}
                    </p>
                    <h2 className="text-xl font-bold text-foreground mb-3">{eventTitle}</h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{formatDate(eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{formatTime(eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{eventLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="shrink-0 p-3 bg-white rounded-xl">
                    <QRCode value={qrCodeData} size={100} />
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">TICKET TYPE</p>
                    <p className="font-semibold text-foreground">{ticketTypeName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ATTENDEE</p>
                    <p className="font-semibold text-foreground">{ticket.attendeeName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">TICKET #</p>
                    <p className="font-mono text-sm text-primary">
                      {ticket.ticketNumber || ticket.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => addToCalendar(ticket)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-secondary text-foreground hover:bg-secondary/20 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    Add to Calendar
                  </button>
                  <button
                    onClick={() => shareTicket(ticket)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-secondary text-foreground hover:bg-secondary/20 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={() => handleDownloadTicket(ticket)}
                    disabled={downloadingTicket === ticket.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-black font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingTicket === ticket.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <a
          href="/dashboard/tickets"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-secondary text-foreground hover:bg-secondary/20 transition-colors"
        >
          View All Tickets
          <ExternalLink className="h-4 w-4" />
        </a>
        <a
          href="/events"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-black font-semibold hover:bg-primary/90 transition-colors"
        >
          Discover More Events
        </a>
      </div>
    </div>
  );
}
