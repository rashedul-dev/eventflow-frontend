"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How do I create my first event?",
    answer:
      "Creating an event is simple! Sign up for an organizer account, click 'Create Event' from your dashboard, fill in your event details including date, venue, and ticket types, then publish. Your event will be live and ready to accept registrations within minutes.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We support all major payment methods through our Stripe integration, including credit/debit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and bank transfers in supported countries. All transactions are secured with industry-standard encryption.",
  },
  {
    question: "Can I offer different ticket types?",
    answer:
      "You can create multiple ticket tiers (Early Bird, VIP, General Admission, etc.) with different prices, quantities, and benefits. Each ticket type can have its own sales window, group discounts, and promo code compatibility.",
  },
  {
    question: "How does the check-in process work?",
    answer:
      "Each ticket comes with a unique QR code. Use our mobile app or any device with a camera to scan tickets at entry. The system validates instantly, prevents duplicate entries, and works offline. You can also manually search attendees by name or email.",
  },
  {
    question: "What fees does EventFlow charge?",
    answer:
      "We offer transparent pricing with no hidden fees. Our Starter plan is free with a small per-ticket fee. Pro and Enterprise plans have flat monthly rates with reduced per-ticket fees. Payment processing fees (Stripe) are standard at 2.9% + $0.30.",
  },
  {
    question: "Can I issue refunds to attendees?",
    answer:
      "Yes, you have full control over refunds. You can issue full or partial refunds directly from your dashboard. Set your own refund policy, and we'll handle the rest. Refunds typically process within 5-10 business days to the original payment method.",
  },
  {
    question: "Is there a limit to event capacity?",
    answer:
      "No platform limits! You can host events of any size, from intimate gatherings to massive festivals. Our infrastructure automatically scales to handle high traffic during on-sale moments. Enterprise customers get dedicated support for large-scale events.",
  },
  {
    question: "How do I contact support?",
    answer:
      "We're here to help! Pro and Enterprise customers have access to priority email and chat support. All users can access our comprehensive help center, community forums, and video tutorials. Enterprise customers also get a dedicated account manager.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button onClick={onToggle} className="w-full py-6 flex items-center justify-between text-left group">
        <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors pr-4">
          {question}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-all duration-300",
            isOpen && "bg-primary/20 rotate-180"
          )}
        >
          <ChevronDown className="w-5 h-5 text-primary" />
        </div>
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-muted-foreground leading-relaxed pr-12">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr,2fr] gap-12 lg:gap-16">
          {/* Left Column - Header */}
          <div className="lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">FAQ</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
              Frequently Asked
              <span className="gradient-text"> Questions</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Everything you need to know about EventFlow. Can't find what you're looking for? Contact our support team.
            </p>

            <a
              href="mailto:support@eventflow.com"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Contact Support
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          </div>

          {/* Right Column - FAQ Items */}
          <div className="bg-background rounded-2xl border border-border p-6 lg:p-8">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
