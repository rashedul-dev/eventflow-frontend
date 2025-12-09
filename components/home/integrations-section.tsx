"use client";

import { useState } from "react";
import {
  CreditCard,
  Mail,
  BarChart3,
  Calendar,
  MessageSquare,
  Video,
  Database,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const integrations = [
  {
    id: "payments",
    icon: CreditCard,
    name: "Payment Processing",
    description: "Secure payment processing with Stripe",
    features: [
      "Accept credit cards, Apple Pay, Google Pay",
      "Automatic currency conversion",
      "PCI-DSS compliant security",
      "Instant payouts to your bank",
    ],
    color: "from-primary/20 to-primary/5",
  },
  {
    id: "analytics",
    icon: BarChart3,
    name: "Analytics & Insights",
    description: "Real-time data and reporting",
    features: ["Live sales dashboards", "Attendee demographics", "Revenue forecasting", "Custom report builder"],
    color: "from-primary/20 to-primary/5",
  },
  {
    id: "email",
    icon: Mail,
    name: "Email Marketing",
    description: "Automated email campaigns",
    features: [
      "Customizable email templates",
      "Automated reminders & follow-ups",
      "A/B testing campaigns",
      "Delivery analytics",
    ],
    color: "from-primary/20 to-primary/5",
  },
  {
    id: "calendar",
    icon: Calendar,
    name: "Calendar Sync",
    description: "Seamless calendar integration",
    features: ["Google Calendar sync", "Outlook integration", "Apple Calendar support", "Automatic event reminders"],
    color: "from-primary/20 to-primary/5",
  },
  {
    id: "messaging",
    icon: MessageSquare,
    name: "Messaging & SMS",
    description: "Direct attendee communication",
    features: ["SMS notifications", "In-app messaging", "Automated updates", "Emergency broadcasts"],
    color: "from-primary/20 to-primary/5",
  },
  {
    id: "streaming",
    icon: Video,
    name: "Live Streaming",
    description: "Virtual & hybrid event support",
    features: ["YouTube Live integration", "Zoom connectivity", "Custom RTMP streaming", "Recording & playback"],
    color: "from-primary/20 to-primary/5",
  },
];

export function IntegrationsSection() {
  const [activeIntegration, setActiveIntegration] = useState(integrations[0]);

  return (
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">Integrations</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            Connect Your
            <span className="gradient-text"> Favorite Tools</span>
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            EventFlow seamlessly integrates with the tools you already use, creating a unified event management
            experience.
          </p>
        </div>

        {/* Interactive Integration Display */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Integration List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
            {integrations.map((integration) => (
              <button
                key={integration.id}
                onClick={() => setActiveIntegration(integration)}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-300 text-left",
                  activeIntegration.id === integration.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
                    activeIntegration.id === integration.id ? "bg-primary/20" : "bg-muted"
                  )}
                >
                  <integration.icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      activeIntegration.id === integration.id ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>
                <div
                  className={cn(
                    "font-medium text-sm transition-colors",
                    activeIntegration.id === integration.id ? "text-primary" : "text-foreground"
                  )}
                >
                  {integration.name}
                </div>
              </button>
            ))}
          </div>

          {/* Right - Feature Display */}
          <div className="relative">
            <div className="bg-card rounded-2xl border border-border p-8 lg:p-10">
              {/* Header */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <activeIntegration.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">{activeIntegration.name}</h3>
                  <p className="text-muted-foreground">{activeIntegration.description}</p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                {activeIntegration.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Zap className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button asChild className="w-full gap-2">
                <Link href="/integrations">
                  Explore All Integrations
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
          </div>
        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-16 pt-12 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {[
              { icon: Shield, label: "Enterprise Security" },
              { icon: Database, label: "99.9% Uptime SLA" },
              { icon: Zap, label: "Real-time Sync" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-muted-foreground">
                <item.icon className="w-5 h-5 text-primary" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
