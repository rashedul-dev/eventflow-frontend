"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { cn } from "@/lib/utils";
import { Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  className?: string;
}

export function PaymentForm({ amount, currency = "USD", onSuccess, onError, className }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        const message = error.message || "Payment failed. Please try again.";
        setErrorMessage(message);
        onError(message);
        toast({
          title: "Payment Failed",
          description: message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully!",
        });
        onSuccess();
      }
    } catch (err: any) {
      const message = err.message || "An unexpected error occurred";
      setErrorMessage(message);
      onError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Order Summary */}
      <div className="p-4 rounded-xl bg-secondary/10 border border-secondary">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Amount</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(amount)}</span>
        </div>
      </div>

      {/* Payment Element */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          Payment Details
        </h3>

        <div className="rounded-xl border border-secondary p-4 bg-card">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">{errorMessage}</div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={cn(
          "w-full py-4 rounded-xl bg-primary text-black font-semibold text-lg transition-all",
          "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2"
        )}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            Pay {formatPrice(amount)}
          </>
        )}
      </button>

      {/* Security Notice */}
      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" />
        Secured by Stripe with 256-bit SSL encryption
      </p>
    </form>
  );
}
