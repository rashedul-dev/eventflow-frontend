"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { eventApi, ticketApi } from "@/lib/api";
import { paymentApi } from "@/lib/api/payment";
import { useAuth } from "@/lib/auth/auth-context";
import { useApiError } from "@/hooks/use-api-error";
import { StripeProvider } from "@/lib/stripe/stripe-provider";
import { TicketSelector } from "@/components/checkout/ticket-selector";
import { PaymentForm } from "@/components/checkout/payment-form";
import { OrderSuccess } from "@/components/checkout/order-success";
import { CalendarIntegration } from "@/components/checkout/calendar-integration";
import {
  ArrowLeft,
  Ticket,
  CreditCard,
  CheckCircle,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/lib/types";

const steps = [
  { id: "select", title: "Select Tickets" },
  { id: "payment", title: "Payment" },
  { id: "confirmation", title: "Confirmation" },
];

export default function CheckoutPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { error: apiError, handleError, clearError } = useApiError({ showToast: false, redirectOnAuth: true });

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTickets, setSelectedTickets] = useState<{ ticketTypeId: string; quantity: number }[]>([]);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderNumber: string;
    tickets: any[];
  } | null>(null);

  // Payment intent state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/checkout/${eventId}`);
    }
  }, [isAuthenticated, eventId, router]);

  // Fetch event data
  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  // Load pre-selected tickets from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem(`checkout_${eventId}`);
    if (stored) {
      try {
        const selection = JSON.parse(stored);
        setSelectedTickets(selection);
      } catch (e) {
        // Ignore invalid data
      }
    }
  }, [eventId]);

  const fetchEvent = async () => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    clearError();

    try {
      const response = await eventApi.getById(eventId);

      // Check if component is still mounted
      if (!isMountedRef.current) return;

      if (response.data) {
        setEvent(response.data);

        if (response.data.status !== "PUBLISHED" && response.data.status !== "APPROVED") {
          setError("This event is not available for ticket purchases.");
        }
      }
    } catch (err: any) {
      if (err.code === "REQUEST_CANCELLED") return;

      if (!isMountedRef.current) return;

      const parsed = handleError(err);
      setError(parsed.userMessage);

      toast({
        title: "Error Loading Event",
        description: parsed.userMessage,
        variant: "destructive",
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const calculateTotal = () => {
    if (!event?.ticketTypes) return 0;
    return selectedTickets.reduce((total, selection) => {
      const ticketType = event.ticketTypes!.find((t) => t.id === selection.ticketTypeId);
      return total + (ticketType?.price || 0) * selection.quantity;
    }, 0);
  };

  const validateAvailability = (): string | null => {
    if (!event?.ticketTypes) return "Event information not available";

    for (const selection of selectedTickets) {
      const ticketType = event.ticketTypes.find((t) => t.id === selection.ticketTypeId);
      if (!ticketType) return `Ticket type not found`;

      const available = ticketType.quantity - ticketType.quantitySold;
      if (selection.quantity > available) {
        return `Only ${available} tickets available for ${ticketType.name}. Please reduce your selection.`;
      }
    }
    return null;
  };

  const handleContinueToPayment = async () => {
    const validationError = validateAvailability();
    if (validationError) {
      toast({
        title: "Tickets Unavailable",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    // Create payment intent
    setIsCreatingIntent(true);

    try {
      // For now, we'll use the first selected ticket type
      // In a real implementation, you might need to handle multiple ticket types differently
      const firstSelection = selectedTickets[0];

      const response = await paymentApi.createPaymentIntent({
        eventId,
        ticketTypeId: firstSelection.ticketTypeId,
        quantity: firstSelection.quantity,
        billingEmail: user?.email || "",
        billingName: user?.firstName ? `${user.firstName} ${user.lastName}` : "",
        attendees: selectedTickets.map((sel) => ({
          name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Attendee",
          email: user?.email || "",
        })),
      });

      if (!isMountedRef.current) return;

      if (response.data) {
        setClientSecret(response.data.clientSecret);
        setPaymentIntentId(response.data.paymentIntentId);
        setPaymentId(response.data.payment.id);
        setCurrentStep(1);

        toast({
          title: "Ready to Pay",
          description: "Please complete your payment details below.",
        });
      }
    } catch (err: any) {
      if (err.code === "REQUEST_CANCELLED") return;

      if (!isMountedRef.current) return;

      const parsed = handleError(err);

      // Display field-specific errors if available
      if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
        const fieldErrors = Object.entries(parsed.fieldErrors)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("\n");

        toast({
          title: "Validation Error",
          description: fieldErrors,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Initialization Failed",
          description: parsed.userMessage || "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsCreatingIntent(false);
      }
    }
  };

  const handlePaymentSuccess = async () => {
    if (!paymentIntentId) return;

    setIsConfirmingPayment(true);

    try {
      await processPaymentAndPurchase();
    } catch (err: any) {
      handlePaymentError(err);
    } finally {
      if (isMountedRef.current) {
        setIsConfirmingPayment(false);
      }
    }
  };

  const processPaymentAndPurchase = async () => {
    // Step 1: Confirm payment with backend
    const confirmResponse = await paymentApi.confirmPayment({
      paymentIntentId: paymentIntentId!,
    });

    if (!isMountedRef.current) return;

    // Step 2: Purchase tickets
    const purchaseResponse = await ticketApi.purchase({
      eventId,
      tickets: selectedTickets,
      attendees: buildAttendeesData(),
    });

    if (!isMountedRef.current) return;

    if (purchaseResponse.data) {
      finalizeSuccessfulPurchase(purchaseResponse, confirmResponse);
    }
  };

  const buildAttendeesData = () => {
    const attendeeName = user?.firstName ? `${user.firstName} ${user.lastName}` : "Attendee";
    const attendeeEmail = user?.email || "";

    return selectedTickets.flatMap((sel) =>
      Array(sel.quantity).fill({
        name: attendeeName,
        email: attendeeEmail,
      })
    );
  };

  const finalizeSuccessfulPurchase = (purchaseResponse: any, confirmResponse: any) => {
    const tickets = purchaseResponse.data.tickets || [];
    const payment = purchaseResponse.data.payment || confirmResponse.data;

    setOrderData({
      orderNumber: payment?.orderNumber || `ORD-${Date.now()}`,
      tickets,
    });

    sessionStorage.removeItem(`checkout_${eventId}`);

    setOrderComplete(true);
    setCurrentStep(2);

    toast({
      title: "Payment Successful!",
      description: "Your tickets have been confirmed. Check your email for details.",
    });
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    toast({
      title: "Payment Failed",
      description: error || "Your payment could not be processed. Please try again or use a different payment method.",
      variant: "destructive",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Unable to Load Event</h1>
          <p className="text-foreground/60 mb-6">{error || "The event doesn't exist or is no longer available."}</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/events"
              className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
            >
              Browse Events
            </Link>
            <button
              onClick={fetchEvent}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete && orderData) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <OrderSuccess orderNumber={orderData.orderNumber} tickets={orderData.tickets} />

          <div className="mt-12 p-6 rounded-2xl border border-secondary bg-black">
            <CalendarIntegration
              event={{
                title: event.title,
                description: `Your tickets for ${event.title}`,
                startDate: event.startDate,
                endDate: event.endDate,
                location: event.isVirtual ? "Online" : event.venueName || "",
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to event
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-secondary">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                </div>
                {steps.map((step, index) => {
                  const icons = [Ticket, CreditCard, CheckCircle];
                  const Icon = icons[index];
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                          isCompleted && "bg-primary border-primary",
                          isCurrent && "border-primary bg-black",
                          !isCompleted && !isCurrent && "border-secondary bg-black"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            isCompleted && "text-black",
                            isCurrent && "text-primary",
                            !isCompleted && !isCurrent && "text-muted-foreground"
                          )}
                        />
                      </div>
                      <span className={cn("text-sm font-medium", isCurrent ? "text-primary" : "text-muted-foreground")}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6 rounded-2xl border border-secondary bg-black">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Select Your Tickets</h2>
                  <TicketSelector
                    ticketTypes={event.ticketTypes || []}
                    initialSelection={selectedTickets}
                    onSelectionChange={setSelectedTickets}
                  />
                  <button
                    onClick={handleContinueToPayment}
                    disabled={selectedTickets.length === 0 || isCreatingIntent}
                    className={cn(
                      "w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2",
                      selectedTickets.length > 0 && !isCreatingIntent
                        ? "bg-primary text-black hover:bg-primary/90"
                        : "bg-secondary text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {isCreatingIntent ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Initializing Payment...
                      </>
                    ) : selectedTickets.length === 0 ? (
                      "Select tickets to continue"
                    ) : (
                      "Continue to Payment"
                    )}
                  </button>
                </div>
              )}

              {currentStep === 1 && clientSecret && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Payment Details</h2>
                    <button
                      onClick={() => {
                        setCurrentStep(0);
                        setClientSecret(null);
                        setPaymentIntentId(null);
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Edit tickets
                    </button>
                  </div>
                  <StripeProvider clientSecret={clientSecret}>
                    <PaymentForm
                      amount={calculateTotal()}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </StripeProvider>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 p-6 rounded-2xl border border-secondary bg-black">
              <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>

              {/* Event Info */}
              <div className="pb-4 mb-4 border-b border-secondary">
                <img
                  src={event.coverImage || "/placeholder.svg?height=128&width=320&query=event"}
                  alt={event.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-medium text-foreground">{event.title}</h4>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {new Date(event.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    {new Date(event.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {event.isVirtual ? "Online" : event.city || event.venueName}
                  </div>
                </div>
              </div>

              {/* Selected Tickets */}
              {selectedTickets.length > 0 ? (
                <div className="space-y-3 pb-4 mb-4 border-b border-secondary">
                  {selectedTickets.map((selection) => {
                    const ticketType = event.ticketTypes?.find((t) => t.id === selection.ticketTypeId);
                    if (!ticketType) return null;

                    return (
                      <div key={selection.ticketTypeId} className="flex justify-between text-sm">
                        <span className="text-foreground">
                          {ticketType.name} x{selection.quantity}
                        </span>
                        <span className="text-foreground">${(ticketType.price * selection.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground pb-4 mb-4 border-b border-secondary">No tickets selected</p>
              )}

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
