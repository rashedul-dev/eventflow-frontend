"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Download, QrCode, Share2, Send, Loader2, ExternalLink, X } from "lucide-react";
import { ticketApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import QRCodeReact from "react-qr-code";
import type { Ticket } from "@/lib/types";
import { createEventFromTicket, downloadICS } from "@/lib/calender";

interface TicketCardProps {
  ticket: Ticket;
  onUpdate?: () => void;
}

export function TicketCard({ ticket, onUpdate }: TicketCardProps) {
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);
  const [showFullQR, setShowFullQR] = useState(false);
  const [transferDialog, setTransferDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [transferData, setTransferData] = useState({ email: "", name: "" });

  const handleTransfer = async () => {
    if (!transferData.email || !transferData.name) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setTransferLoading(true);
    try {
      await ticketApi.transfer(ticket.id, { recipientEmail: transferData.email, recipientName: transferData.name });
      toast({
        title: "Ticket Transferred",
        description: `Ticket has been transferred to ${transferData.email}`,
      });
      setTransferDialog(false);
      setTransferData({ email: "", name: "" });
      onUpdate?.();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to transfer ticket",
        variant: "destructive",
      });
    } finally {
      setTransferLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await ticketApi.cancel(ticket.id, "User requested cancellation");
      toast({
        title: "Ticket Cancelled",
        description: "Your ticket has been cancelled successfully",
      });
      setCancelDialog(false);
      onUpdate?.();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to cancel ticket",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById(`qr-code-${ticket.id}`);
    if (!svg) return;

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
      downloadLink.download = `ticket-${ticket.ticketNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast({
        title: "QR Code Downloaded",
        description: "Your QR code has been saved",
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleDownloadPDF = async () => {
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
    try {
      const calendarEvent = createEventFromTicket(ticket);
      downloadICS(calendarEvent);
      toast({
        title: "Calendar Event Added",
        description: "Event has been added to your calendar",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to add to calendar",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "VALID":
        return "bg-primary/20 text-primary";
      case "USED":
      case "CHECKED_IN":
        return "bg-foreground/20 text-foreground/60";
      case "CANCELLED":
      case "REFUNDED":
        return "bg-red-500/20 text-red-400";
      case "TRANSFERRED":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const isTransferable = ticket.ticketType?.isTransferable && ticket.status === "ACTIVE";
  const isCancellable = ticket.status === "ACTIVE";
  const qrCodeData = ticket.qrCode || ticket.ticketNumber || ticket.id;

  return (
    <>
      <Card className="bg-secondary/30 border-foreground/10 overflow-hidden hover:border-primary/50 transition-colors">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Event Image */}
            <div className="md:w-48 h-32 md:h-auto relative">
              <img
                src={ticket.event?.coverImage || "/placeholder.svg?height=200&width=200&query=event"}
                alt={ticket.event?.title || "Event"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-r from-transparent to-secondary/50" />
            </div>

            {/* Ticket Details */}
            <div className="flex-1 p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                    {ticket.ticketType?.name || "General"}
                  </span>
                  <Link href={`/dashboard/tickets/${ticket.id}`}>
                    <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                      {ticket.event?.title || "Event Title"}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {ticket.event?.startDate ? formatDate(ticket.event.startDate) : "Date TBD"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {ticket.event?.isVirtual
                        ? "Online"
                        : ticket.event?.city || ticket.event?.venueName || "Location TBD"}
                    </span>
                  </div>
                  {ticket.ticketNumber && (
                    <p className="text-xs text-muted-foreground font-mono">#{ticket.ticketNumber}</p>
                  )}
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center gap-2">
                  {showQR ? (
                    <div className="relative p-2 bg-white rounded-lg group">
                      <QRCodeReact id={`qr-code-${ticket.id}`} value={qrCodeData} size={96} level="H" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setShowFullQR(true)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setShowQR(true)} className="gap-2">
                      <QrCode className="h-4 w-4" />
                      Show QR
                    </Button>
                  )}
                  <span className="text-xs text-foreground/40 font-mono">
                    {ticket.ticketNumber?.slice(0, 8).toUpperCase() || ticket.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-foreground/10 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={handleDownloadPDF}
                  disabled={downloadLoading}
                >
                  {downloadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleAddToCalendar}>
                  <Calendar className="h-4 w-4" />
                  Calendar
                </Button>
                {isTransferable && (
                  <Button variant="ghost" size="sm" className="gap-2" onClick={() => setTransferDialog(true)}>
                    <Send className="h-4 w-4" />
                    Transfer
                  </Button>
                )}
                {isCancellable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-red-500 hover:text-red-600"
                    onClick={() => setCancelDialog(true)}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
                <span className={`ml-auto px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full QR Code Dialog */}
      <Dialog open={showFullQR} onOpenChange={setShowFullQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket QR Code</DialogTitle>
            <DialogDescription>Present this QR code at the event entrance for check-in.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-4 bg-white rounded-xl">
              <QRCodeReact value={qrCodeData} size={256} level="H" />
            </div>
            <div className="text-center">
              <p className="font-mono text-sm text-muted-foreground">{ticket.ticketNumber}</p>
              <p className="text-xs text-muted-foreground mt-1">{ticket.event?.title}</p>
            </div>
            <Button onClick={handleDownloadQR} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialog} onOpenChange={setTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Ticket</DialogTitle>
            <DialogDescription>
              Transfer this ticket to someone else. They will receive an email with the ticket details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="transferName">Recipient Name</Label>
              <Input
                id="transferName"
                placeholder="John Doe"
                value={transferData.name}
                onChange={(e) => setTransferData({ ...transferData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transferEmail">Recipient Email</Label>
              <Input
                id="transferEmail"
                type="email"
                placeholder="john@example.com"
                value={transferData.email}
                onChange={(e) => setTransferData({ ...transferData, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransfer} disabled={transferLoading}>
              {transferLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Transfer Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this ticket? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
              Keep Ticket
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelLoading}>
              {cancelLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Cancel Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
