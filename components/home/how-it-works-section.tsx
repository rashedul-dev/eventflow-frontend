import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Create Your Event",
    description: "Set up your event in minutes. Add details, upload images, and configure ticket types.",
    features: ["Drag-and-drop builder", "Custom branding", "Multiple ticket tiers"],
  },
  {
    number: "02",
    title: "Publish & Promote",
    description: "Share your event with the world. Get discovered by thousands of potential attendees.",
    features: ["SEO optimization", "Social sharing", "Email campaigns"],
  },
  {
    number: "03",
    title: "Sell Tickets",
    description: "Accept secure payments and manage sales in real-time with our powerful dashboard.",
    features: ["Multiple currencies", "Promo codes", "Waitlist management"],
  },
  {
    number: "04",
    title: "Check-in Attendees",
    description: "Seamless check-in with QR scanning. Track attendance and manage entry in real-time.",
    features: ["QR code scanning", "Offline mode", "Live attendance stats"],
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">How It Works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            Launch Your Event in
            <span className="gradient-text"> Four Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Our streamlined process makes it easy to go from idea to sold-out event.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">{step.number}</span>
              </div>

              {/* Content */}
              <div className="pt-4">
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground mb-6">{step.description}</p>

                {/* Features */}
                <ul className="space-y-3">
                  {step.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && index % 2 === 0 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button size="lg" asChild className="gap-2 h-12 px-8">
            <Link href="/register">
              Start Creating Events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
