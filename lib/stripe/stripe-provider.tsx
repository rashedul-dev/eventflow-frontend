"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

// Initialize Stripe with better error handling
const getStripePromise = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!key) {
    console.error("❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set!");
    console.error("Please add your Stripe publishable key to .env.local");
    return null;
  }

  if (!key.startsWith("pk_")) {
    console.error("❌ Invalid Stripe publishable key format. Must start with 'pk_'");
    return null;
  }

  console.log("✅ Stripe key found:", key.substring(0, 20) + "...");
  return loadStripe(key);
};

const stripePromise = getStripePromise();

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server
  if (!mounted) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse text-muted-foreground">Loading payment form...</div>
      </div>
    );
  }

  // Show error if no Stripe key
  if (!stripePromise) {
    return (
      <div className="p-6 rounded-xl border border-destructive/50 bg-destructive/10">
        <h3 className="font-semibold text-destructive mb-2">⚠️ Payment System Not Configured</h3>
        <p className="text-sm text-destructive/80 mb-4">
          The Stripe payment system is not properly configured. Please ensure{" "}
          <code className="px-2 py-1 bg-black/50 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> is set in your
          environment variables.
        </p>
        <p className="text-xs text-muted-foreground">Contact the administrator to configure payment processing.</p>
      </div>
    );
  }

  const options = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "night" as const,
          variables: {
            colorPrimary: "#ffffff",
            colorBackground: "#000000",
            colorText: "#ffffff",
            colorDanger: "#ef4444",
            fontFamily: "Geist, system-ui, sans-serif",
            spacingUnit: "4px",
            borderRadius: "10px",
          },
        },
      }
    : undefined;

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
