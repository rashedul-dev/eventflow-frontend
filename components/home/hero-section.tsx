"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, MapPin, Calendar, Sparkles } from "lucide-react";

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("searchTerm", searchQuery.trim());
    }

    if (location.trim()) {
      params.set("city", location.trim());
    }

    // Navigate to events page with or without filters
    const queryString = params.toString();
    router.push(queryString ? `/events?${queryString}` : "/events");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-transparent via-background to-background" />
      </div>

      {/* Grid Pattern - FIXED */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(8, 203, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(8, 203, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Discover Amazing Events</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-balance">
            <span className="text-foreground">Create & Experience</span>
            <br />
            <span className="gradient-text">Unforgettable Events</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            The all-in-one platform for event organizers and attendees. Create, discover, and manage events that leave
            lasting impressions.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex flex-col sm:flex-row gap-3 p-2 bg-card rounded-2xl border border-border">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <Input
                  type="text"
                  placeholder="Search events, concerts, conferences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                />
              </div>
              <div className="flex items-center gap-3 px-4 border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0">
                <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                <Input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                />
              </div>
              <Button size="lg" className="gap-2 shrink-0" onClick={handleSearch}>
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" asChild className="gap-2 glow-primary h-12 px-8">
              <Link href="/events">
                Explore Events
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="gap-2 h-12 px-8 bg-transparent">
              <Link href="/register?type=organizer">
                <Calendar className="w-4 h-4" />
                Create Your Event
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: "10K+", label: "Events Hosted" },
              { value: "500K+", label: "Tickets Sold" },
              { value: "50K+", label: "Organizers" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-muted-foreground">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 p-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary mx-auto animate-pulse" />
        </div>
      </div>
    </section>
  );
}
