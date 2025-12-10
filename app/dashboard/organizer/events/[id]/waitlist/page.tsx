"use client";

import { useState, useEffect, use } from "react";
import { eventApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, Mail, Trash2, Users, ArrowLeft, Download, Info, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function WaitlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const { toast } = useToast();

  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchWaitlist();
  }, [eventId]);

  const fetchWaitlist = async () => {
    setIsLoading(true);
    try {
      const response = await eventApi.getWaitlist(eventId);
      if (response.data) {
        setEntries(response.data);
      }
    } catch (err) {
      console.error("Failed to load waitlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (entryId: string) => {
    try {
      await eventApi.removeFromWaitlist(eventId, entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      setSelectedEntries((prev) => prev.filter((id) => id !== entryId));
      toast({
        title: "Success",
        description: "Entry removed from waitlist",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to remove entry",
        variant: "destructive",
      });
    }
  };

  const handleNotify = async () => {
    if (!notifyMessage.trim() || selectedEntries.length === 0) return;

    setIsSending(true);
    try {
      await eventApi.notifyWaitlist(eventId, {
        entryIds: selectedEntries,
        message: notifyMessage,
      });
      toast({
        title: "Success",
        description: `Notification sent to ${selectedEntries.length} ${
          selectedEntries.length === 1 ? "entry" : "entries"
        }`,
      });
      setIsNotifyOpen(false);
      setNotifyMessage("");
      setSelectedEntries([]);
      fetchWaitlist();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send notifications",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const toggleEntry = (id: string) => {
    setSelectedEntries((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selectedEntries.length === filteredEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredEntries.map((e) => e.id));
    }
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const notifiedCount = entries.filter((e) => e.status === "NOTIFIED").length;
  const waitingCount = entries.filter((e) => e.status === "WAITING" || !e.status).length;

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
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/dashboard/organizer/events/${eventId}`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Waitlist Management</h1>
            <p className="text-muted-foreground">{entries.length} total entries</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={entries.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsNotifyOpen(true)} disabled={selectedEntries.length === 0}>
            <Mail className="w-4 h-4 mr-2" />
            Notify ({selectedEntries.length})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{entries.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Entries</p>
              </div>
              <Users className="w-8 h-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{waitingCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Waiting</p>
              </div>
              <Users className="w-8 h-8 text-amber-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{notifiedCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Notified</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Waitlist entries are automatically created when tickets sell out. Notify interested attendees when tickets
          become available.
        </AlertDescription>
      </Alert>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries</CardTitle>
          <CardDescription>Manage and notify people waiting for tickets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No waitlist entries</h3>
              <p className="text-muted-foreground">When people join the waitlist, they'll appear here.</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No entries match your search.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-secondary overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0}
                        onChange={toggleAll}
                        className="rounded border-secondary"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedEntries.includes(entry.id)}
                          onChange={() => toggleEntry(entry.id)}
                          className="rounded border-secondary"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{entry.name || "-"}</TableCell>
                      <TableCell>{entry.email}</TableCell>
                      <TableCell className="text-center">{entry.quantity || 1}</TableCell>
                      <TableCell>
                        <Badge variant={entry.status === "NOTIFIED" ? "default" : "secondary"}>
                          {entry.status || "WAITING"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => handleRemove(entry.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notify Dialog */}
      <Dialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notify Waitlist Entries</DialogTitle>
            <DialogDescription>
              Send a notification to {selectedEntries.length} selected{" "}
              {selectedEntries.length === 1 ? "entry" : "entries"}. Let them know that tickets are now available.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Example: Great news! Tickets are now available for [Event Name]. Click the link below to purchase before they sell out again..."
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              This message will be sent via email to all selected entries.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotifyOpen(false)} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={handleNotify} disabled={isSending || !notifyMessage.trim()}>
              {isSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Mail className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
