"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, FileText, AlertTriangle, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock audit log type
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  createdAt: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function AuditLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, entityFilter]);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call when backend endpoint is available
      // const response = await adminApi.getAuditLogs({ action: actionFilter, entity: entityFilter })

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLogs([
        {
          id: "1",
          userId: "user-1",
          action: "APPROVE_EVENT",
          entity: "Event",
          entityId: "event-123",
          oldValues: { status: "PENDING_APPROVAL" },
          newValues: { status: "APPROVED" },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: {
            email: "admin@eventflow.com",
            firstName: "Admin",
            lastName: "User",
          },
        },
        {
          id: "2",
          userId: "user-1",
          action: "SUSPEND",
          entity: "User",
          entityId: "user-456",
          oldValues: { isActive: true },
          newValues: { isActive: false },
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          user: {
            email: "admin@eventflow.com",
            firstName: "Admin",
            lastName: "User",
          },
        },
        {
          id: "3",
          userId: "user-1",
          action: "REJECT_EVENT",
          entity: "Event",
          entityId: "event-789",
          oldValues: { status: "PENDING_APPROVAL" },
          newValues: { status: "REJECTED", rejectionReason: "Incomplete information" },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            email: "admin@eventflow.com",
            firstName: "Admin",
            lastName: "User",
          },
        },
      ]);
    } catch (err: any) {
      console.error("Failed to load audit logs:", err);
      setError(err.message || "Failed to load audit logs");
      toast({
        title: "Error",
        description: "Failed to load audit logs. This feature may not be fully implemented yet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAuditLogs();
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("APPROVE")) return "bg-green-500/20 text-green-500";
    if (action.includes("REJECT") || action.includes("SUSPEND")) return "bg-red-500/20 text-red-500";
    if (action.includes("UPDATE")) return "bg-blue-500/20 text-blue-500";
    return "bg-gray-500/20 text-gray-400";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground">Track administrative actions and system changes</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchAuditLogs}>
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-secondary/30 border-foreground/10 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by entity ID, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="APPROVE_EVENT">Approve Event</SelectItem>
              <SelectItem value="REJECT_EVENT">Reject Event</SelectItem>
              <SelectItem value="SUSPEND">Suspend User</SelectItem>
              <SelectItem value="ACTIVATE">Activate User</SelectItem>
              <SelectItem value="UPDATE_ROLE">Update Role</SelectItem>
            </SelectContent>
          </Select>

          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="Event">Events</SelectItem>
              <SelectItem value="User">Users</SelectItem>
              <SelectItem value="Payment">Payments</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit">Search</Button>
        </form>
      </Card>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-sm">
                Note: Audit logs feature is currently showing mock data. Backend integration pending.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Audit Logs Table */}
      <Card className="bg-secondary/30 border-foreground/10">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No audit logs found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-foreground/10 hover:bg-transparent">
                <TableHead>Date & Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-foreground/10">
                  <TableCell className="text-sm text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {log.user?.firstName} {log.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{log.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionBadgeColor(log.action)}>{log.action.replace(/_/g, " ")}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.entity}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.entityId.slice(0, 12)}...
                  </TableCell>
                  <TableCell>
                    <details className="cursor-pointer">
                      <summary className="text-sm text-primary hover:underline">View</summary>
                      <div className="mt-2 p-2 rounded bg-background/50 border border-foreground/10 text-xs">
                        {log.oldValues && (
                          <div className="mb-2">
                            <span className="text-muted-foreground">Old: </span>
                            <code>{JSON.stringify(log.oldValues, null, 2)}</code>
                          </div>
                        )}
                        {log.newValues && (
                          <div>
                            <span className="text-muted-foreground">New: </span>
                            <code>{JSON.stringify(log.newValues, null, 2)}</code>
                          </div>
                        )}
                      </div>
                    </details>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
