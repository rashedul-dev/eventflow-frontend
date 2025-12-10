"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Ticket, Calendar, MapPin, DollarSign, AlertCircle } from "lucide-react";
import { ticketApi } from "@/lib/api";
import { toast } from "sonner";

export default function ValidateTicketPage() {
  const [identifier, setIdentifier] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleValidate = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();

    if (!identifier.trim()) {
      toast.error("Please enter a ticket number or QR code");
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response: any = await ticketApi.validate({ ticketNumber: identifier.trim() });

      if (!response) {
        toast.error("Failed to validate ticket");
        setIsValidating(false);
        return;
      }

      // Handle both wrapped and unwrapped responses
      const validationData = response.data || response;
      setValidationResult(validationData);

      if (validationData.valid) {
        toast.success("Ticket is valid!");
      } else if (validationData.error === "Check-in is not yet available") {
        toast.warning(
          <div className="flex flex-col ml-2">
            Ticket is valid
            <br />
            <i>Note: Check-in is not yet available</i>
          </div>
        );
      } else {
        toast.error(validationData.error || validationData.message || "Ticket is not valid");
      }
    } catch (err: any) {
      if (err.status === 404) {
        setValidationResult({ valid: false, message: "Ticket not found" });
        toast.error("Ticket not found");
      } else {
        toast.error(err.message || "Failed to validate ticket");
      }
    } finally {
      setIsValidating(false);
    }
    setIdentifier("");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  const formatEventStart = (utcDateStr: string) => {
    const d = new Date(utcDateStr);
    d.setHours(d.getHours() - 2); // UTC – 2h
    return d.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="min-h-screen pt-20 pb-12">
        <div className="absolute inset-0 bg-background">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(8,203,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(8,203,0,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />
        <div className="relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto mt-12">
            {/* Header */}
            <div className="text-center mb-8">
              <Ticket className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                Validate <span className="gradient-text">Ticket</span>
              </h1>
              <p className="text-muted-foreground">Enter a ticket number or QR code to verify its authenticity</p>
            </div>

            {/* Validation Form */}
            <Card>
              <CardHeader>
                <CardTitle>Check Ticket Status</CardTitle>
                <CardDescription>
                  This is a public tool. Anyone can verify if a ticket is valid without needing to log in.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="identifier" className="block text-sm font-medium mb-2">
                      Ticket Number or QR Code
                    </label>
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="e.g., TKT-1-A3F9K2M7 or QR Code"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      disabled={isValidating}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the ticket number (e.g., TKT-1-ABC12345) or paste the QR code value
                    </p>
                  </div>

                  <Button onClick={handleValidate} className="w-full" disabled={isValidating || !identifier.trim()}>
                    {isValidating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      "Validate Ticket"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Validation Result */}
            {validationResult && (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  {validationResult.valid ? (
                    <div className="space-y-6">
                      {/* Valid Status */}
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
                        <div>
                          <h3 className="font-semibold text-green-500">Valid Ticket</h3>
                          <p className="text-sm text-muted-foreground">This ticket is authentic and active</p>
                        </div>
                      </div>

                      {/* Ticket Details - Only show if ticket exists */}
                      {validationResult.ticket && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Ticket Information</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Ticket Number</span>
                                <span className="font-mono text-sm font-medium">
                                  {validationResult.ticket.ticketNumber}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                                  {validationResult.ticket.status}
                                </Badge>
                              </div>
                              {validationResult.ticket.checkedInAt && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Checked In</span>
                                  <span className="text-sm">{formatDate(validationResult.ticket.checkedInAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Event Details - Only show if event exists */}
                          {validationResult.ticket.event && (
                            <div className="pt-4 border-t">
                              <h4 className="text-sm font-medium text-muted-foreground mb-3">Event Details</h4>
                              <div className="space-y-3">
                                <div>
                                  <h5 className="font-semibold text-lg">{validationResult.ticket.event.title}</h5>
                                  {validationResult.ticket.event.venueName && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {validationResult.ticket.event.venueName}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span>{formatDate(validationResult.ticket.event.startDate)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span>{validationResult.ticket.event.venueName || "Location TBD"}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Ticket Type - Only show if ticketType exists */}
                          {validationResult.ticket.ticketType && (
                            <div className="pt-4 border-t">
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Ticket Type</h4>
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{validationResult.ticket.ticketType.name}</p>
                                  {validationResult.ticket.ticketType.category && (
                                    <p className="text-sm text-muted-foreground">
                                      {validationResult.ticket.ticketType.category}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 text-lg font-bold">
                                    <DollarSign className="w-4 h-4" />
                                    <span>
                                      {typeof validationResult.ticket.pricePaid === "string"
                                        ? parseFloat(validationResult.ticket.pricePaid).toFixed(2)
                                        : (validationResult.ticket.pricePaid / 100).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Check if it's an "already checked in" or "not yet available" warning */}
                      {validationResult.error === "Ticket has already been checked in" ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                          <AlertCircle className="w-8 h-8 text-yellow-500 shrink-0" />
                          <div>
                            <h3 className="font-semibold text-yellow-600">Already Checked In</h3>
                            <p className="text-sm text-muted-foreground">
                              This ticket was already checked in on{" "}
                              {validationResult.checkedInAt && formatDate(validationResult.checkedInAt)}
                            </p>
                          </div>
                        </div>
                      ) : validationResult.error === "Check-in is not yet available" ||
                        validationResult.message === "Check-in is not yet available" ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <AlertCircle className="w-8 h-8 text-blue-500 shrink-0" />
                          <div>
                            <h3 className="font-semibold text-blue-600">Check-in Not Available</h3>
                            <p className="text-sm text-muted-foreground">
                              This ticket is valid but check-in is not yet available for this event <br />
                              Check-in will available {" "}
                              {validationResult?.event?.startDate
                                ? formatEventStart(validationResult.event.startDate)
                                : "before 2hr from the event starts"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                          <XCircle className="w-8 h-8 text-red-500 shrink-0" />
                          <div>
                            <h3 className="font-semibold text-red-500">Invalid Ticket</h3>
                            <p className="text-sm text-muted-foreground">
                              {validationResult.error || validationResult.message || "This ticket is not valid"}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Info Alert */}
            <Alert className="mt-6">
              <AlertDescription className="text-sm">
                <strong>Note:</strong> This tool only validates the ticket's authenticity. For check-in at the event,
                please present your ticket to the event organizer or security staff.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
