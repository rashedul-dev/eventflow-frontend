import { Calendar, Ticket, CreditCard, BarChart3, Users, Shield, Zap, Globe, Bell } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Event Creation",
    description:
      "Create stunning events in minutes with our intuitive builder. Add all details, from venue to ticketing.",
  },
  {
    icon: Ticket,
    title: "Smart Ticketing",
    description: "Flexible ticket types, dynamic pricing, and QR code validation for seamless check-ins.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Accept payments globally with Stripe integration. Multiple currencies and payment methods.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track sales, attendance, and revenue with comprehensive dashboards and reports.",
  },
  {
    icon: Users,
    title: "Attendee Management",
    description: "Manage guest lists, send notifications, and handle waitlists effortlessly.",
  },
  {
    icon: Shield,
    title: "Fraud Protection",
    description: "Advanced security measures to prevent ticket fraud and unauthorized access.",
  },
  {
    icon: Zap,
    title: "Instant Check-in",
    description: "Scan tickets with any device. Fast, reliable, and works offline.",
  },
  {
    icon: Globe,
    title: "Virtual Events",
    description: "Host hybrid or fully virtual events with integrated streaming platforms.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Automated reminders and updates via email, SMS, and push notifications.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            Everything You Need to
            <span className="gradient-text"> Run Successful Events</span>
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            From planning to execution, our platform provides all the tools you need to create memorable experiences.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 lg:p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
