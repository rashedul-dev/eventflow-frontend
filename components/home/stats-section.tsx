"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, Users, Calendar, DollarSign, Globe, Ticket } from "lucide-react";

function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, hasStarted]);

  return { count, ref };
}

const stats = [
  {
    icon: Calendar,
    value: 25000,
    suffix: "+",
    label: "Events Created",
    description: "Successfully hosted events",
  },
  {
    icon: Ticket,
    value: 2,
    suffix: "M+",
    label: "Tickets Sold",
    description: "Across all event types",
  },
  {
    icon: Users,
    value: 150000,
    suffix: "+",
    label: "Active Users",
    description: "Organizers & attendees",
  },
  {
    icon: DollarSign,
    value: 50,
    suffix: "M+",
    label: "Revenue Processed",
    description: "Secure transactions",
  },
  {
    icon: Globe,
    value: 120,
    suffix: "+",
    label: "Countries",
    description: "Global reach",
  },
  {
    icon: TrendingUp,
    value: 99.9,
    suffix: "%",
    label: "Uptime",
    description: "Reliable platform",
  },
];

function StatCard({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const { count, ref } = useCountUp(stat.value, 2000 + index * 200);

  return (
    <div
      ref={ref}
      className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <stat.icon className="w-6 h-6 text-primary" />
          </div>
          <div className="h-8 w-16">
            {/* Mini chart visualization */}
            <svg viewBox="0 0 64 32" className="w-full h-full">
              <path
                d="M0 28 L10 24 L20 26 L30 18 L40 20 L50 12 L64 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary/40"
              />
              <path
                d="M0 28 L10 24 L20 26 L30 18 L40 20 L50 12 L64 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary"
                strokeDasharray="100"
                strokeDashoffset="0"
              />
            </svg>
          </div>
        </div>

        <div className="text-4xl font-bold text-primary mb-1">
          {stat.value < 100 ? count.toFixed(stat.suffix === "%" ? 1 : 0) : count.toLocaleString()}
          {stat.suffix}
        </div>

        <div className="text-lg font-semibold text-foreground mb-1">{stat.label}</div>
        <div className="text-sm text-muted-foreground">{stat.description}</div>
      </div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(8,203,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(8,203,0,0.02)_1px,transparent_1px)] bg-size:48px_48px" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
            Platform Statistics
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            Trusted by
            <span className="gradient-text"> Thousands Worldwide</span>
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Real-time metrics that showcase the scale and reliability of our event management platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mt-12">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <span className="text-sm text-muted-foreground">Live data - Updated in real-time</span>
        </div>
      </div>
    </section>
  );
}
