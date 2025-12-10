"use client";

import { useState, useEffect } from "react";
import { notificationApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bell, BellOff, Check, Trash2, Ticket, Calendar, CreditCard, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const notificationIcons: Record<string, any> = {
  EMAIL: Bell,
  SMS: CreditCard,
  PUSH: Bell,
  IN_APP: Info,
  TICKET_PURCHASE: Ticket,
  EVENT_REMINDER: Calendar,
  PAYMENT_SUCCESS: CreditCard,
  PAYMENT_FAILED: AlertCircle,
};

interface NotificationPreferences {
  emailNotifications: {
    ticketPurchase: boolean;
    eventReminders: boolean;
    eventUpdates: boolean;
    paymentUpdates: boolean;
    marketing: boolean;
  };
  inAppNotifications: {
    ticketPurchase: boolean;
    eventReminders: boolean;
    eventUpdates: boolean;
    paymentUpdates: boolean;
  };
  smsNotifications: {
    eventReminders: boolean;
    urgentUpdates: boolean;
  };
  reminderTiming: {
    oneDayBefore: boolean;
    oneHourBefore: boolean;
    atEventTime: boolean;
  };
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data } = await notificationApi.getAll();
      setNotifications(data!.notifications);
      setUnreadCount(data!.unreadCount);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await notificationApi.getPreferences();
      if (response.data) {
        setPreferences(response.data);
      }
    } catch (err) {
      console.error("Failed to load preferences:", err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to mark as read",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to mark all as read",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePreferences = async (section: keyof NotificationPreferences, key: string, value: boolean) => {
    if (!preferences) return;

    const updated = {
      ...preferences,
      [section]: {
        ...preferences[section],
        [key]: value,
      },
    };
    setPreferences(updated);
    setIsSavingPrefs(true);

    try {
      await notificationApi.updatePreferences(updated);
      toast({
        title: "Success",
        description: "Preferences updated",
      });
    } catch (err: any) {
      setPreferences(preferences); // Revert
      toast({
        title: "Error",
        description: err.message || "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setIsSavingPrefs(false);
    }
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
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">You'll see notifications here when you have them.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-6 space-y-2">
          {notifications.filter((n) => !n.readAt).length === 0 ? (
            <div className="text-center py-12">
              <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No unread notifications</h3>
              <p className="text-muted-foreground">You've read all your notifications.</p>
            </div>
          ) : (
            notifications
              .filter((n) => !n.readAt)
              .map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))
          )}
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          {!preferences ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Email Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Choose which emails you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ticket Purchase</Label>
                      <p className="text-sm text-muted-foreground">Confirmation when you purchase tickets</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications.ticketPurchase}
                      onCheckedChange={(checked) =>
                        handleUpdatePreferences("emailNotifications", "ticketPurchase", checked)
                      }
                      disabled={isSavingPrefs}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Event Reminders</Label>
                      <p className="text-sm text-muted-foreground">Reminders before your events</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications.eventReminders}
                      onCheckedChange={(checked) =>
                        handleUpdatePreferences("emailNotifications", "eventReminders", checked)
                      }
                      disabled={isSavingPrefs}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Event Updates</Label>
                      <p className="text-sm text-muted-foreground">Updates about events you're attending</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications.eventUpdates}
                      onCheckedChange={(checked) =>
                        handleUpdatePreferences("emailNotifications", "eventUpdates", checked)
                      }
                      disabled={isSavingPrefs}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Payment Updates</Label>
                      <p className="text-sm text-muted-foreground">Receipts and payment confirmations</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications.paymentUpdates}
                      onCheckedChange={(checked) =>
                        handleUpdatePreferences("emailNotifications", "paymentUpdates", checked)
                      }
                      disabled={isSavingPrefs}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing</Label>
                      <p className="text-sm text-muted-foreground">News and promotional updates</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications.marketing}
                      onCheckedChange={(checked) => handleUpdatePreferences("emailNotifications", "marketing", checked)}
                      disabled={isSavingPrefs}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* In-App Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>In-App Notifications</CardTitle>
                  <CardDescription>Notifications you see in the app</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ticket Purchase</Label>
                      <p className="text-sm text-muted-foreground">Show notification when tickets are purchased</p>
                    </div>
                    <Switch
                      checked={preferences.inAppNotifications.ticketPurchase}
                      onCheckedChange={(checked) =>
                        handleUpdatePreferences("inAppNotifications", "ticketPurchase", checked)
                      }
                      disabled={isSavingPrefs}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Event Reminders</Label>
                      <p className="text-sm text-muted-foreground">Show upcoming event reminders</p>
                    </div>
                    <Switch
                      checked={preferences.inAppNotifications.eventReminders}
                      onCheckedChange={(checked) =>
                        handleUpdatePreferences("inAppNotifications", "eventReminders", checked)
                      }
                      disabled={isSavingPrefs}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Event Updates</Label>
                      <p className="text-sm text-muted-foreground">Show when events are updated</p>
                    </div>
                    <Switch
                      checked={preferences.inAppNotifications.eventUpdates}
                      onCheckedChange={(checked) =>
                        handleUpdatePreferences("inAppNotifications", "eventUpdates", checked)
                      }
                      disabled={isSavingPrefs}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Payment Updates</Label>
                      <p className="text-sm text-muted-foreground">Show payment status updates</p>
                    </div>
                    <Switch
                      checked={preferences.inAppNotifications.paymentUpdates}
                      onCheckedChange={(checked) =>
                        handleUpdatePreferences("inAppNotifications", "paymentUpdates", checked)
                      }
                      disabled={isSavingPrefs}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SMS Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>SMS Notifications</CardTitle>
                  <CardDescription>Text message notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Event Reminders</Label>
                      <p className="text-sm text-muted-foreground">SMS reminders before events</p>
                    </div>
                    <Switch
                      checked={preferences.smsNotifications.eventReminders}
                      onCheckedChange={(checked) =>
                        handleUpdatePreferences("smsNotifications", "eventReminders", checked)
                      }
                      disabled={isSavingPrefs}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Urgent Updates</Label>
                      <p className="text-sm text-muted-foreground">Critical event changes and cancellations</p>
                    </div>
                    <Switch
                      checked={preferences.smsNotifications.urgentUpdates}
                      onCheckedChange={(checked) =>
                        handleUpdatePreferences("smsNotifications", "urgentUpdates", checked)
                      }
                      disabled={isSavingPrefs}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Reminder Timing */}
              <Card>
                <CardHeader>
                  <CardTitle>Reminder Timing</CardTitle>
                  <CardDescription>When to receive event reminders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>One Day Before</Label>
                      <p className="text-sm text-muted-foreground">Reminder 24 hours before event</p>
                    </div>
                    <Switch
                      checked={preferences.reminderTiming.oneDayBefore}
                      onCheckedChange={(checked) => handleUpdatePreferences("reminderTiming", "oneDayBefore", checked)}
                      disabled={isSavingPrefs}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>One Hour Before</Label>
                      <p className="text-sm text-muted-foreground">Reminder 1 hour before event</p>
                    </div>
                    <Switch
                      checked={preferences.reminderTiming.oneHourBefore}
                      onCheckedChange={(checked) => handleUpdatePreferences("reminderTiming", "oneHourBefore", checked)}
                      disabled={isSavingPrefs}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>At Event Time</Label>
                      <p className="text-sm text-muted-foreground">Reminder when event starts</p>
                    </div>
                    <Switch
                      checked={preferences.reminderTiming.atEventTime}
                      onCheckedChange={(checked) => handleUpdatePreferences("reminderTiming", "atEventTime", checked)}
                      disabled={isSavingPrefs}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = notificationIcons[notification.type] || Info;
  const isUnread = !notification.readAt;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-secondary flex items-start gap-4 transition-colors",
        isUnread && "bg-primary/5 border-primary/20"
      )}
    >
      <div className={cn("p-2 rounded-lg", isUnread ? "bg-primary/10" : "bg-secondary")}>
        <Icon className={cn("w-5 h-5", isUnread ? "text-primary" : "text-muted-foreground")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium", isUnread && "text-foreground")}>{notification.title}</p>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
      </div>
      <div className="flex gap-2">
        {isUnread && (
          <Button size="icon" variant="ghost" onClick={() => onMarkAsRead(notification.id)} title="Mark as read">
            <Check className="w-4 h-4" />
          </Button>
        )}
        <Button size="icon" variant="ghost" onClick={() => onDelete(notification.id)} title="Delete">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
