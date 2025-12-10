"use client";

import type React from "react";

import { useState, useEffect, use } from "react";
import { ticketApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, CheckCircle, Users, Ticket, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

let QRScanner: React.ComponentType<{ onScan: (ticketNumber: string) => Promise<any> }> | null = null;
try {
  QRScanner = require("@/components/organizer/qr-scanner").QRScanner;
} catch {
  QRScanner = null;
}

export default function AttendeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const { toast } = useToast();

  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [eventId]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await ticketApi.getEventTickets(eventId);
      if (response.data) {
        setTickets(response.data);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load attendees",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckInScan = async (ticketNumber: string) => {
    try {
      const response = await ticketApi.checkIn(eventId, { ticketNumber });
      fetchTickets();
      return {
        success: response.success !== false,
        message: response.data?.message ?? response.message ?? "Check-in successful!",
        ticket: response.data,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to check in attendee";
      return { success: false, message };
    }
  };

  const handleQuickCheckIn = async (ticketNumber: string) => {
    setCheckingInId(ticketNumber);
    try {
      await ticketApi.checkIn(eventId, { ticketNumber });
      toast({
        title: "Success",
        description: "Attendee checked in successfully",
      });
      fetchTickets();
    } catch (err: any) {
      toast({
        title: "Check-in Failed",
        description: err.message || "Failed to check in",
        variant: "destructive",
      });
    } finally {
      setCheckingInId(null);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.attendeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.attendeeEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tickets.length,
    checkedIn: tickets.filter((t) => t.checkedInAt !== null).length,
    pending: tickets.filter((t) => t.checkedInAt === null && (t.status === "ACTIVE" || t.status === "VALID")).length,
  };

  const isCheckedIn = (ticket: any): boolean => {
    return ticket.checkedInAt !== null;
  };

  const canCheckIn = (ticket: any): boolean => {
    return ticket.checkedInAt === null && (ticket.status === "ACTIVE" || ticket.status === "VALID");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendees</h1>
          <p className="text-muted-foreground">Manage check-ins and view attendee list</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/organizer/events`}>Back to Events</Link>
          </Button>
          {QRScanner && <QRScanner onScan={handleCheckInScan} />}
        </div>
      </div>

      {/* Stats - Now shows accurate data using checkedInAt */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-secondary bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tickets</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-secondary bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Checked In</p>
              <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? `${((stats.checkedIn / stats.total) * 100).toFixed(1)}%` : "0%"}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-secondary bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Users className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? `${((stats.pending / stats.total) * 100).toFixed(1)}%` : "0%"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or ticket number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="VALID">Valid</SelectItem>
            <SelectItem value="CHECKED_IN">Checked In</SelectItem>
            <SelectItem value="USED">Used</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-secondary overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket #</TableHead>
              <TableHead>Attendee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Purchased</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "No attendees found matching your filters"
                    : "No attendees yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-sm">{ticket.ticketNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {ticket.attendeeName ||
                          `${ticket.user?.firstName || ""} ${ticket.user?.lastName || ""}`.trim() ||
                          "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">{ticket.attendeeEmail || ticket.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{ticket.ticketType?.name || "General"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        isCheckedIn(ticket) ? "default" : ticket.status === "CANCELLED" ? "destructive" : "secondary"
                      }
                      className={isCheckedIn(ticket) ? "bg-green-100 text-green-800 border-green-200" : ""}
                    >
                      {isCheckedIn(ticket) ? "Checked In" : ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {isCheckedIn(ticket) ? (
                      <div className="flex items-center justify-end gap-2 text-green-600">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-medium">Checked In</span>
                      </div>
                    ) : canCheckIn(ticket) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickCheckIn(ticket.ticketNumber)}
                        disabled={checkingInId === ticket.ticketNumber}
                      >
                        {checkingInId === ticket.ticketNumber ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Checking In...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Check In
                          </>
                        )}
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
