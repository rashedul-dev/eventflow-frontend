"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Calendar, DollarSign, Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/api";

// Helper to safely convert BigInt values
const safeNumber = (val: any): number => {
  if (typeof val === "bigint") return Number(val);
  if (typeof val === "string") return Number.parseFloat(val) || 0;
  return val || 0;
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [analyticsRes, userStatsRes, pendingRes, verifyStatsRes] = await Promise.all([
        adminApi.getPlatformAnalytics().catch((err: any) => {
          console.error("Analytics API error:", err);
          return { data: null };
        }),
        adminApi.getUserStatistics().catch((err: any) => {
          console.error("User stats API error:", err);
          return { data: null };
        }),
        adminApi.getPendingEvents().catch((err: any) => {
          console.error("Pending events API error:", err);
          return { data: [] };
        }),
        adminApi.getVerificationStats().catch((err: any) => {
          console.error("Verification stats API error:", err);
          return { data: null };
        }),
      ]);

      setStats({
        // Platform analytics
        totalUsers: safeNumber(analyticsRes.data?.overview?.totalUsers),
        totalEvents: safeNumber(analyticsRes.data?.overview?.totalEvents),
        totalRevenue: safeNumber(analyticsRes.data?.overview?.totalRevenue),
        totalCommission: safeNumber(analyticsRes.data?.overview?.totalCommission),
        activeEvents: safeNumber(analyticsRes.data?.overview?.activeEvents),
        pendingEvents: safeNumber(analyticsRes.data?.overview?.pendingEvents),

        // User stats
        organizerCount: safeNumber(userStatsRes.data?.byRole?.find((r: any) => r.role === "ORGANIZER")?.count) || 0,
        attendeeCount: safeNumber(userStatsRes.data?.byRole?.find((r: any) => r.role === "ATTENDEE")?.count) || 0,
        verifiedUsers: safeNumber(userStatsRes.data?.overview?.verified),

        // Verification stats
        pendingCount: safeNumber(verifyStatsRes.data?.counts?.pending),
        approvedCount: safeNumber(verifyStatsRes.data?.counts?.approved),
        rejectedCount: safeNumber(verifyStatsRes.data?.counts?.rejected),
        approvalRate: safeNumber(verifyStatsRes.data?.percentages?.approvalRate),
      });

      setPendingEvents(pendingRes.data || []);
    } catch (err: any) {
      console.error("Failed to load admin data:", err);
      setError(err.message || "Failed to load dashboard data");
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string, approved: boolean) => {
    try {
      await adminApi.verifyEvent(id, {
        status: approved ? "APPROVED" : "REJECTED",
        ...(approved ? {} : { rejectionReason: "Quick rejection from dashboard" }),
      });
      setPendingEvents((prev) => prev.filter((e) => e.id !== id));
      toast({
        title: "Success",
        description: `Event ${approved ? "approved" : "rejected"} successfully`,
      });
      fetchData(); // Refresh stats
    } catch (err: any) {
      console.error("Failed to verify event:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to verify event",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-foreground/60 mt-1">Platform overview and management tools.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-secondary/30 border-foreground/10 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{stats?.totalUsers?.toLocaleString() || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold text-foreground">{stats?.totalEvents?.toLocaleString() || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/20">
              <Shield className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
              <p className="text-2xl font-bold text-foreground">{stats?.pendingCount || pendingEvents.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${(stats?.totalRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <Card className="bg-secondary/30 border-foreground/10 p-6">
          <h3 className="font-semibold text-foreground mb-4">User Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Organizers</span>
              <span className="font-medium">{stats?.organizerCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Attendees</span>
              <span className="font-medium">{stats?.attendeeCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Events</span>
              <span className="font-medium text-primary">{stats?.activeEvents || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Verified Users</span>
              <span className="font-medium">{stats?.verifiedUsers || 0}</span>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full mt-4 bg-transparent">
            <Link href="/dashboard/admin/users">Manage Users</Link>
          </Button>
        </Card>

        {/* Pending Event Approvals */}
        <Card className="bg-secondary/30 border-foreground/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Pending Event Approvals</h3>
            <Badge variant="outline">{pendingEvents.length} pending</Badge>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="text-muted-foreground">All caught up! No pending events.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="p-3 rounded-lg bg-background/50 border border-secondary">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        by {event.organizer?.organizationName || event.organizer?.firstName || "Unknown"}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(event.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        onClick={() => handleVerify(event.id, true)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleVerify(event.id, false)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button asChild variant="outline" className="w-full mt-4 bg-transparent">
            <Link href="/dashboard/admin/events">View All Pending</Link>
          </Button>
        </Card>
      </div>

      {/* Verification Stats */}
      <Card className="bg-secondary/30 border-foreground/10 p-6">
        <h3 className="font-semibold text-foreground mb-4">Event Verification Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-background/50 text-center">
            <p className="text-2xl font-bold text-green-500">{stats?.approvedCount || 0}</p>
            <p className="text-sm text-muted-foreground">Approved</p>
          </div>
          <div className="p-4 rounded-lg bg-background/50 text-center">
            <p className="text-2xl font-bold text-red-500">{stats?.rejectedCount || 0}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </div>
          <div className="p-4 rounded-lg bg-background/50 text-center">
            <p className="text-2xl font-bold text-amber-500">{stats?.pendingCount || 0}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="p-4 rounded-lg bg-background/50 text-center">
            <p className="text-2xl font-bold text-primary">{stats?.approvalRate ? `${stats.approvalRate}%` : "N/A"}</p>
            <p className="text-sm text-muted-foreground">Approval Rate</p>
          </div>
        </div>
      </Card>

      {/* Commission Overview */}
      <Card className="bg-secondary/30 border-foreground/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Commission Overview</h3>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/admin/reports">View Reports</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-background/50">
            <p className="text-sm text-muted-foreground mb-1">Total Commission</p>
            <p className="text-2xl font-bold text-primary">${(stats?.totalCommission || 0).toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-background/50">
            <p className="text-sm text-muted-foreground mb-1">Gross Revenue</p>
            <p className="text-2xl font-bold text-foreground">${(stats?.totalRevenue || 0).toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-background/50">
            <p className="text-sm text-muted-foreground mb-1">Commission Rate</p>
            <p className="text-2xl font-bold text-foreground">5%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
