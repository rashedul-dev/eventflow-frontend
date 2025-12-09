import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Users, Globe, Target, Heart, Shield, Zap, Award, ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "About EventFlow | Modern Event Management Platform",
  description:
    "Learn about EventFlow's mission to empower event creators and connect communities through unforgettable experiences.",
};

export default function AboutPage() {
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
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">About EventFlow</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
                  <span className="text-foreground">Connecting People Through</span>
                  <br />
                  <span className="gradient-text">Remarkable Experiences</span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 text-pretty">
                  We're on a mission to empower event creators worldwide with the tools they need to bring people
                  together and create lasting memories.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" asChild className="gap-2 h-12 px-8">
                    <Link href="/register">
                      Start Creating Events
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="gap-2 h-12 px-8 bg-transparent">
                    <Link href="/events">Explore Events</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-20 lg:py-32 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  <div>
                    <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
                      Our Mission
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                      Making Event Management
                      <span className="gradient-text"> Simple and Powerful</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      EventFlow was born from a simple observation: event management was unnecessarily complex.
                      Organizers spent more time wrestling with technology than creating amazing experiences.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      We set out to change that by building a platform that's powerful enough for the world's largest
                      events, yet simple enough for first-time organizers to create their dream gathering.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-background border border-border">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                      <div className="text-sm text-muted-foreground">Events Created</div>
                    </div>

                    <div className="p-6 rounded-2xl bg-background border border-border mt-8">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-primary mb-2">500K+</div>
                      <div className="text-sm text-muted-foreground">Tickets Sold</div>
                    </div>

                    <div className="p-6 rounded-2xl bg-background border border-border">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Globe className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-primary mb-2">50+</div>
                      <div className="text-sm text-muted-foreground">Countries</div>
                    </div>

                    <div className="p-6 rounded-2xl bg-background border border-border mt-8">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Award className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-20 lg:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
                  Our Values
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
                  What Drives Us
                  <span className="gradient-text"> Every Day</span>
                </h2>
                <p className="text-lg text-muted-foreground text-pretty">
                  These core values guide every decision we make and shape the platform we build.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                {[
                  {
                    icon: Target,
                    title: "Purpose-Driven",
                    description:
                      "Every feature we build serves one goal: helping you create better events and connect more people.",
                  },
                  {
                    icon: Users,
                    title: "Community First",
                    description:
                      "We listen to our users, learn from their feedback, and build features that solve real problems.",
                  },
                  {
                    icon: Shield,
                    title: "Trust & Security",
                    description:
                      "Your data and your attendees' information are protected with enterprise-grade security.",
                  },
                  {
                    icon: Zap,
                    title: "Innovation",
                    description:
                      "We constantly push boundaries, exploring new technologies to make event management better.",
                  },
                  {
                    icon: Heart,
                    title: "Passion",
                    description: "We're event enthusiasts ourselves, and that passion shows in everything we create.",
                  },
                  {
                    icon: Globe,
                    title: "Accessibility",
                    description:
                      "Great events should be accessible to everyone, everywhere. We build with inclusion in mind.",
                  },
                ].map((value) => (
                  <div
                    key={value.title}
                    className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Story Section */}
          <section className="py-20 lg:py-32 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
                    Our Story
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                    From Frustration to
                    <span className="gradient-text"> Innovation</span>
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none">
                  <div className="space-y-6 text-muted-foreground">
                    <p className="text-lg leading-relaxed">
                      EventFlow started in 2020 when our founders, both experienced event organizers, grew tired of
                      juggling multiple platforms just to run a single event. From ticketing to attendee management,
                      from marketing to analytics – everything was fragmented.
                    </p>

                    <p className="text-lg leading-relaxed">
                      After organizing hundreds of events ranging from intimate workshops to conferences with thousands
                      of attendees, they realized there had to be a better way. A platform that could handle everything
                      seamlessly, without the complexity and sky-high fees of traditional solutions.
                    </p>

                    <p className="text-lg leading-relaxed">
                      Today, EventFlow powers events across 50+ countries, from local meetups to international
                      conferences. We've helped organizers sell over 500,000 tickets and process millions in revenue –
                      all while keeping the platform intuitive and affordable.
                    </p>

                    <p className="text-lg leading-relaxed">
                      But we're just getting started. Our roadmap is packed with features that will make event
                      management even more powerful, and we're excited to build them with feedback from our amazing
                      community of organizers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 lg:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  Ready to Create Your
                  <span className="gradient-text"> Next Event?</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                  Join thousands of organizers who trust EventFlow to power their events. Start free, scale as you grow.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" asChild className="gap-2 h-12 px-8">
                    <Link href="/register">
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="gap-2 h-12 px-8 bg-transparent">
                    <Link href="/for-organizers">Learn More</Link>
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
