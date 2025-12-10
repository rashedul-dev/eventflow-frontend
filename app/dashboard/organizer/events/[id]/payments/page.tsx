"use client";

import { useState, useEffect, use } from "react";
import { paymentApi } from "@/lib/api/payment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, DollarSign, RefreshCw, TrendingUp, Receipt, Percent, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function EventPaymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const { toast } = useToast();

  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refundPayment, setRefundPayment] = useState<any>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [eventId]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await paymentApi.getEventPayments(eventId);
      if (response.data) {
        setPayments(response.data);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!refundPayment || !refundReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for the refund",
        variant: "destructive",
      });
      return;
    }

    setIsRefunding(true);
    try {
      await paymentApi.refund(refundPayment.id, {
        amount: refundAmount ? Number.parseFloat(refundAmount) : undefined,
        reason: refundReason,
      });
      toast({
        title: "Success",
        description: "Refund processed successfully",
      });
      setRefundPayment(null);
      setRefundReason("");
      setRefundAmount("");
      fetchPayments();
    } catch (err: any) {
      toast({
        title: "Refund Failed",
        description: err.message || "Failed to process refund",
        variant: "destructive",
      });
    } finally {
      setIsRefunding(false);
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const stats = {
    totalRevenue: payments.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0),
    platformCommission: payments.reduce((sum, p) => sum + Number(p.platformCommission || 0), 0),
    organizerPayout: payments.reduce((sum, p) => sum + Number(p.organizerPayout || 0), 0),
    completed: payments.filter((p) => p.status === "COMPLETED").length,
    refunded: payments.filter((p) => p.status === "REFUNDED" || p.status === "PARTIALLY_REFUNDED").length,
    pending: payments.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").length,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      COMPLETED: "default",
      PENDING: "secondary",
      PROCESSING: "secondary",
      FAILED: "destructive",
      REFUNDED: "outline",
      PARTIALLY_REFUNDED: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
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
          <h1 className="text-2xl font-bold text-foreground">Event Payments</h1>
          <p className="text-muted-foreground">View and manage event payments and commissions</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/organizer/events/${eventId}`}>Back to Event</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">From {payments.length} payments</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Payout</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(stats.organizerPayout)}</div>
            <p className="text-xs text-muted-foreground mt-1">After platform commission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.platformCommission)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalRevenue > 0 ? ((stats.platformCommission / stats.totalRevenue) * 100).toFixed(1) : "0"}% of
              revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">{stats.completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending:</span>
                <span className="font-medium">{stats.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Refunded:</span>
                <span className="font-medium">{stats.refunded}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Breakdown */}
      <Card className="bg-secondary/5">
        <CardHeader>
          <CardTitle className="text-lg">Commission Breakdown</CardTitle>
          <CardDescription>Detailed breakdown of fees and payouts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Gross Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Platform Commission (5%)</p>
              <p className="text-xl font-bold text-red-500">-{formatCurrency(stats.platformCommission)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Net Payout</p>
              <p className="text-xl font-bold text-green-500">{formatCurrency(stats.organizerPayout)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer name, email, or order number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
          <p className="text-muted-foreground">Payments will appear here when attendees purchase tickets.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-secondary overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Your Payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">{payment.orderNumber}</TableCell>
                  <TableCell className="text-sm">{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {payment.user?.firstName} {payment.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{payment.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(payment.totalAmount || 0))}</TableCell>
                  <TableCell className="text-red-500 text-sm">
                    -{formatCurrency(Number(payment.platformCommission || 0))}
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(Number(payment.organizerPayout || 0))}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-right">
                    {payment.status === "COMPLETED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRefundPayment(payment);
                          setRefundAmount(payment.totalAmount?.toString() || "");
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refund
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Refund Dialog */}
      <Dialog open={!!refundPayment} onOpenChange={() => setRefundPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund payment of {formatCurrency(Number(refundPayment?.totalAmount || 0))} to{" "}
              {refundPayment?.user?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Refund Amount (optional)</label>
              <Input
                type="number"
                step="0.01"
                placeholder={`Max: ${formatCurrency(Number(refundPayment?.totalAmount || 0))}`}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={refundPayment?.totalAmount}
              />
              <p className="text-xs text-muted-foreground mt-1">Leave blank for full refund</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Reason for Refund *</label>
              <Textarea
                placeholder="Enter reason for refund (minimum 10 characters)..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                minLength={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundPayment(null)} disabled={isRefunding}>
              Cancel
            </Button>
            <Button onClick={handleRefund} disabled={isRefunding || !refundReason.trim() || refundReason.length < 10}>
              {isRefunding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
