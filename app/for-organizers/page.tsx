import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Calendar,
  Ticket,
  CreditCard,
  BarChart3,
  Users,
  Bell,
  Zap,
  Shield,
  Globe,
  QrCode,
  DollarSign,
  TrendingUp,
  Check,
  ArrowRight,
  Sparkles,
  Target,
  Award,
  HeadphonesIcon,
} from "lucide-react";

export const metadata = {
  title: "For Event Organizers | EventFlow",
  description:
    "Everything you need to plan, promote, and manage successful events. From ticketing to analytics, EventFlow has you covered.",
};

const features = [
  {
    icon: Calendar,
    title: "Easy Event Creation",
    description: "Create stunning event pages in minutes with our intuitive drag-and-drop builder.",
  },
  {
    icon: Ticket,
    title: "Flexible Ticketing",
    description: "Set up multiple ticket types, early bird pricing, group discounts, and promotional codes.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Accept payments globally with Stripe. Support for 135+ currencies and all major payment methods.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track sales, attendance, revenue, and engagement with comprehensive dashboards.",
  },
  {
    icon: Users,
    title: "Attendee Management",
    description: "Manage guest lists, communicate with attendees, and handle check-ins seamlessly.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Automated email and SMS reminders keep attendees informed and engaged.",
  },
  {
    icon: QrCode,
    title: "QR Check-in",
    description: "Fast, contactless check-in with any smartphone or tablet. Works offline too.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "List your events on our marketplace and get discovered by thousands of potential attendees.",
  },
  {
    icon: Shield,
    title: "Fraud Protection",
    description: "Advanced security measures protect you and your attendees from fraud.",
  },
];

const benefits = [
  {
    icon: DollarSign,
    title: "Low Fees, High Value",
    description: "Our transparent pricing means more revenue stays in your pocket. No hidden fees, ever.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Audience",
    description: "Reach new attendees through our event discovery platform and marketing tools.",
  },
  {
    icon: Zap,
    title: "Save Time",
    description: "Automate repetitive tasks and manage everything from one intuitive dashboard.",
  },
  {
    icon: Award,
    title: "Professional Branding",
    description: "Custom event pages and emails that match your brand identity perfectly.",
  },
];

const testimonials = [
  {
    quote:
      "EventFlow transformed how we manage our monthly meetups. The check-in process is so smooth, and the analytics help us understand our audience better.",
    author: "Sarah Chen",
    role: "Community Manager",
    company: "Tech Meetup Network",
  },
  {
    quote:
      "We've hosted over 50 events with EventFlow. The platform scales beautifully from intimate workshops to conferences with 1000+ attendees.",
    author: "Marcus Rodriguez",
    role: "Event Director",
    company: "Future Forward Conferences",
  },
  {
    quote:
      "The customer support is phenomenal. Any question we have is answered within hours, and they actually listen to feature requests.",
    author: "Emily Watson",
    role: "Founder",
    company: "Creative Workshops Co.",
  },
];

const pricingFeatures = [
  "Unlimited events",
  "Custom branding",
  "Real-time analytics",
  "QR code check-in",
  "Email support",
  "Multiple ticket types",
  "Promo codes & discounts",
  "Attendee management",
  "Mobile app access",
  "Secure payments",
];

export default function ForOrganizersPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          {/* Hero Section */}
          <section className="relative mt-10 py-20 lg:py-32 overflow-hidden min-h-screen">
            <div className="absolute inset-0 bg-background">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(8,203,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(8,203,0,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Built for Organizers</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
                  <span className="text-foreground">Everything You Need to</span>
                  <br />
                  <span className="gradient-text">Host Successful Events</span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 text-pretty">
                  From planning to execution, EventFlow provides all the tools professional organizers need to create
                  memorable experiences and grow their audience.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                  <Button size="lg" asChild className="gap-2 h-12 px-8 glow-primary">
                    <Link href="/register?type=organizer">
                      Start Creating Free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="gap-2 h-12 px-8 bg-transparent">
                    <Link href="/#how-it-works">See How It Works</Link>
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Free to start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 lg:py-32 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
                  Powerful Features
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
                  All the Tools You Need in
                  <span className="gradient-text"> One Platform</span>
                </h2>
                <p className="text-lg text-muted-foreground text-pretty">
                  Stop juggling multiple tools. EventFlow combines everything you need into one seamless experience.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="group p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-20 lg:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
                    Why Organizers Choose Us
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                    More Than Just
                    <span className="gradient-text"> Event Software</span>
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-8 lg:gap-12">
                  {benefits.map((benefit) => (
                    <div
                      key={benefit.title}
                      className="flex gap-6 p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="shrink-0">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                          <benefit.icon className="w-7 h-7 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold mb-3">{benefit.title}</h3>
                        <p className="text-muted-foreground leading-relaxed text-lg">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20 lg:py-32 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
                  Testimonials
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  Loved by
                  <span className="gradient-text"> Event Organizers</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Don't just take our word for it. Here's what organizers have to say about EventFlow.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="p-8 rounded-2xl bg-background border border-border">
                    <div className="mb-6">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 fill-primary" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-6">"{testimonial.quote}"</p>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Preview Section */}
          <section className="py-20 lg:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
                    Simple Pricing
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                    Transparent Pricing,
                    <span className="gradient-text"> No Surprises</span>
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Start free and only pay when you sell tickets. No monthly fees, no contracts.
                  </p>
                </div>

                <div className="p-8 lg:p-12 rounded-3xl bg-card border-2 border-primary/20">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-baseline gap-2 mb-4">
                      <span className="text-5xl font-bold gradient-text">5%</span>
                      <span className="text-xl text-muted-foreground">
                        + Transaction Fee <sub className="text-[10px]">(2.9% + $0.30)</sub>{" "}
                      </span>
                    </div>
                    <p className="text-muted-foreground">per ticket sold</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    {pricingFeatures.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" asChild className="flex-1 h-12">
                      <Link href="/register?type=organizer">Get Started Free</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="flex-1 h-12 bg-transparent">
                      <Link href="/#pricing">View Full Pricing</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section className="py-20 lg:py-32 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <HeadphonesIcon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  <span className="gradient-text">World-Class Support</span>
                  <br />
                  When You Need It
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Our dedicated support team is here to help you succeed. Whether you're hosting your first event or
                  your hundredth, we've got your back.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>24/7 email support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Live chat available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Comprehensive help center</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Video tutorials</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-20 lg:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Join 50,000+ Organizers</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  Ready to Create Your
                  <span className="gradient-text"> First Event?</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                  Start free today and see why thousands of organizers trust EventFlow for their events.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" asChild className="gap-2 h-12 px-8 glow-primary">
                    <Link href="/register?type=organizer">
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="gap-2 h-12 px-8 bg-transparent">
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
