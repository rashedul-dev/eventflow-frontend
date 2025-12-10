"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { eventApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TicketTypeForm {
  id: string;
  name: string;
  description: string;
  category: "FREE" | "PAID" | "DONATION";
  price: string;
  quantity: string;
  maxPerOrder: string;
  minPerOrder: string;
}

const categories = [
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "seminar", label: "Seminar" },
  { value: "concert", label: "Concert" },
  { value: "festival", label: "Festival" },
  { value: "sports", label: "Sports" },
  { value: "networking", label: "Networking" },
  { value: "fundraiser", label: "Fundraiser" },
  { value: "party", label: "Party" },
  { value: "exhibition", label: "Exhibition" },
  { value: "meetup", label: "Meetup" },
  { value: "webinar", label: "Webinar" },
  { value: "class", label: "Class" },
  { value: "retreat", label: "Retreat" },
  { value: "technology", label: "Technology" },
  { value: "business", label: "Business" },
  { value: "music", label: "Music" },
  { value: "arts", label: "Arts" },
  { value: "food & drink", label: "Food & Drink" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
];

export function CreateEventForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    category: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    timezone: "UTC",
    isVirtual: false,
    venueName: "",
    venueAddress: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    virtualLink: "",
    virtualPlatform: "",
    capacity: "",
    isPrivate: false,
    requiresApproval: false,
    ageRestriction: "",
  });

  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    {
      id: "1",
      name: "General Admission",
      description: "",
      category: "PAID",
      price: "",
      quantity: "",
      maxPerOrder: "10",
      minPerOrder: "1",
    },
  ]);

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTicketType = () => {
    setTicketTypes((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        description: "",
        category: "PAID",
        price: "",
        quantity: "",
        maxPerOrder: "10",
        minPerOrder: "1",
      },
    ]);
  };

  const removeTicketType = (id: string) => {
    if (ticketTypes.length > 1) {
      setTicketTypes((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const updateTicketType = (id: string, field: keyof TicketTypeForm, value: string) => {
    setTicketTypes((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleSubmit = async (e: React.FormEvent, submitForApproval = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.description ||
        !formData.startDate ||
        !formData.endDate ||
        !formData.startTime ||
        !formData.endTime
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Combine date and time for datetime-local format
      const startDateTime = formData.startTime ? `${formData.startDate}T${formData.startTime}` : formData.startDate;
      const endDateTime = formData.endTime ? `${formData.endDate}T${formData.endTime}` : formData.endDate;

      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format");
      }

      if (endDate <= startDate) {
        throw new Error("End date must be after start date");
      }

      // Validate location based on event type
      if (!formData.isVirtual) {
        if (!formData.venueName && !formData.city) {
          throw new Error("Physical events must have venue name or city");
        }
      } else {
        if (!formData.virtualLink && !formData.virtualPlatform) {
          throw new Error("Virtual events should have a meeting link or platform");
        }
      }

      // Validate ticket types
      const validTickets = ticketTypes.filter((t) => t.name && t.quantity);
      if (validTickets.length === 0) {
        throw new Error("Please add at least one valid ticket type with name and quantity");
      }

      // Prepare event data matching API schema
      const eventData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || undefined,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        timezone: formData.timezone,
        isVirtual: formData.isVirtual,
        venueName: formData.isVirtual ? undefined : formData.venueName || undefined,
        venueAddress: formData.isVirtual ? undefined : formData.venueAddress || undefined,
        city: formData.isVirtual ? undefined : formData.city || undefined,
        state: formData.isVirtual ? undefined : formData.state || undefined,
        country: formData.isVirtual ? undefined : formData.country || undefined,
        postalCode: formData.isVirtual ? undefined : formData.postalCode || undefined,
        virtualLink: formData.isVirtual ? formData.virtualLink || undefined : undefined,
        virtualPlatform: formData.isVirtual ? formData.virtualPlatform || undefined : undefined,
        capacity: formData.capacity ? Number.parseInt(formData.capacity) : undefined,
        isPrivate: formData.isPrivate,
        requiresApproval: formData.requiresApproval,
        ageRestriction: formData.ageRestriction ? Number.parseInt(formData.ageRestriction) : undefined,
        category: formData.category || undefined,
        ticketTypes: validTickets.map((t, index) => ({
          name: t.name,
          description: t.description || undefined,
          category: t.category,
          price: t.category === "FREE" ? 0 : Number.parseFloat(t.price) || 0,
          quantity: Number.parseInt(t.quantity) || 0,
          maxPerOrder: Number.parseInt(t.maxPerOrder) || 10,
          minPerOrder: Number.parseInt(t.minPerOrder) || 1,
          sortOrder: index,
        })),
      };

      console.log("📤 Submitting event data:", eventData);

      const response = await eventApi.create(eventData);

      console.log("✅ Event created:", response);

      // If submit for approval, also call that endpoint
      if (submitForApproval && response.data?.id) {
        await eventApi.submitForApproval(response.data.id);
      }

      toast({
        title: "Event created!",
        description: submitForApproval
          ? "Your event has been submitted for approval."
          : "Your event has been saved as a draft.",
      });

      router.push("/dashboard/organizer/events");
    } catch (err: any) {
      console.error("❌ Create event error:", err);

      // Handle validation errors
      let errorMessage = "Failed to create event. Please try again.";

      if (err.data?.errors) {
        // Handle field-level errors
        const errors = err.data.errors;
        if (Array.isArray(errors)) {
          errorMessage = errors.map((e: any) => e.message).join(", ");
        } else if (typeof errors === "object") {
          errorMessage = Object.values(errors).flat().join(", ");
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      {/* Basic Info */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="text-foreground">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              placeholder="Brief summary for search results and previews (max 500 characters)"
              value={formData.shortDescription}
              onChange={(e) => updateFormData("shortDescription", e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-foreground/50">{formData.shortDescription.length}/500 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your event in detail..."
              rows={6}
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                placeholder="Maximum attendees (optional)"
                value={formData.capacity}
                onChange={(e) => updateFormData("capacity", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="text-foreground">Date & Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData("startDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => updateFormData("startTime", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData("endDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => updateFormData("endTime", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={formData.timezone} onValueChange={(value) => updateFormData("timezone", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="text-foreground">Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Switch
              id="isVirtual"
              checked={formData.isVirtual}
              onCheckedChange={(checked) => updateFormData("isVirtual", checked)}
            />
            <Label htmlFor="isVirtual">This is an online event</Label>
          </div>

          {formData.isVirtual ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="virtualPlatform">Platform</Label>
                <Select
                  value={formData.virtualPlatform}
                  onValueChange={(value) => updateFormData("virtualPlatform", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="google_meet">Google Meet</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="webex">Webex</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="youtube">YouTube Live</SelectItem>
                    <SelectItem value="twitch">Twitch</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="virtualLink">Event URL</Label>
                <Input
                  id="virtualLink"
                  type="url"
                  placeholder="https://..."
                  value={formData.virtualLink}
                  onChange={(e) => updateFormData("virtualLink", e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venueName">Venue Name</Label>
                  <Input
                    id="venueName"
                    placeholder="Convention Center, Stadium, etc."
                    value={formData.venueName}
                    onChange={(e) => updateFormData("venueName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venueAddress">Address</Label>
                  <Input
                    id="venueAddress"
                    placeholder="123 Main Street"
                    value={formData.venueAddress}
                    onChange={(e) => updateFormData("venueAddress", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="San Francisco"
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="CA"
                    value={formData.state}
                    onChange={(e) => updateFormData("state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="USA"
                    value={formData.country}
                    onChange={(e) => updateFormData("country", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="94102"
                    value={formData.postalCode}
                    onChange={(e) => updateFormData("postalCode", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Ticket Types</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
            <Plus className="h-4 w-4 mr-2" />
            Add Ticket Type
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {ticketTypes.map((ticket, index) => (
            <div key={ticket.id} className="p-4 rounded-lg bg-background/50 border border-foreground/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/60">Ticket Type {index + 1}</span>
                {ticketTypes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTicketType(ticket.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Ticket Name *</Label>
                  <Input
                    placeholder="VIP, General, Early Bird, etc."
                    value={ticket.name}
                    onChange={(e) => updateTicketType(ticket.id, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={ticket.category}
                    onValueChange={(value) => updateTicketType(ticket.id, "category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">Free</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="DONATION">Donation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {ticket.category !== "FREE" && (
                  <div className="space-y-2">
                    <Label>Price ($) *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={ticket.price}
                      onChange={(e) => updateTicketType(ticket.id, "price", e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={ticket.quantity}
                    onChange={(e) => updateTicketType(ticket.id, "quantity", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Per Order</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={ticket.minPerOrder}
                    onChange={(e) => updateTicketType(ticket.id, "minPerOrder", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Per Order</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={ticket.maxPerOrder}
                    onChange={(e) => updateTicketType(ticket.id, "maxPerOrder", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="What's included with this ticket? (Benefits, perks, access level)"
                  value={ticket.description}
                  onChange={(e) => updateTicketType(ticket.id, "description", e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="text-foreground">Additional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Switch
              id="isPrivate"
              checked={formData.isPrivate}
              onCheckedChange={(checked) => updateFormData("isPrivate", checked)}
            />
            <div>
              <Label htmlFor="isPrivate">Private Event</Label>
              <p className="text-sm text-foreground/60">Only visible to invited attendees</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Switch
              id="requiresApproval"
              checked={formData.requiresApproval}
              onCheckedChange={(checked) => updateFormData("requiresApproval", checked)}
            />
            <div>
              <Label htmlFor="requiresApproval">Require Approval</Label>
              <p className="text-sm text-foreground/60">Manually approve attendee registrations</p>
            </div>
          </div>

          <div className="space-y-2 max-w-xs">
            <Label htmlFor="ageRestriction">Age Restriction</Label>
            <Input
              id="ageRestriction"
              type="number"
              min="0"
              max="100"
              placeholder="No restriction (leave empty)"
              value={formData.ageRestriction}
              onChange={(e) => updateFormData("ageRestriction", e.target.value)}
            />
            <p className="text-xs text-foreground/50">Minimum age required to attend</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4 justify-end">
        <Button type="button" variant="outline" disabled={loading} onClick={(e) => handleSubmit(e, false)}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save as Draft
        </Button>
        <Button
          type="button"
          disabled={loading}
          onClick={(e) => handleSubmit(e, true)}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit for Approval
        </Button>
      </div>
    </form>
  );
}
