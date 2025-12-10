"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar, Check, ExternalLink } from "lucide-react";

interface CalendarIntegrationProps {
  event: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
  };
  className?: string;
}

type CalendarType = "google" | "outlook" | "apple" | "yahoo";

export function CalendarIntegration({ event, className }: CalendarIntegrationProps) {
  const [added, setAdded] = useState<CalendarType | null>(null);

  const formatDateForGoogle = (date: string) => {
    return new Date(date).toISOString().replace(/-|:|\.\d{3}/g, "");
  };

  const formatDateForOutlook = (date: string) => {
    return new Date(date).toISOString();
  };

  const calendarOptions: { type: CalendarType; name: string; icon: string; getUrl: () => string }[] = [
    {
      type: "google",
      name: "Google Calendar",
      icon: "🗓️",
      getUrl: () => {
        const start = formatDateForGoogle(event.startDate);
        const end = formatDateForGoogle(event.endDate);
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
          event.title
        )}&dates=${start}/${end}&location=${encodeURIComponent(event.location)}&details=${encodeURIComponent(
          event.description
        )}`;
      },
    },
    {
      type: "outlook",
      name: "Outlook",
      icon: "📧",
      getUrl: () => {
        const start = formatDateForOutlook(event.startDate);
        const end = formatDateForOutlook(event.endDate);
        return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
          event.title
        )}&startdt=${start}&enddt=${end}&location=${encodeURIComponent(event.location)}&body=${encodeURIComponent(
          event.description
        )}`;
      },
    },
    {
      type: "apple",
      name: "Apple Calendar",
      icon: "🍎",
      getUrl: () => {
        // Generate ICS file data URL
        const icsContent = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "BEGIN:VEVENT",
          `DTSTART:${formatDateForGoogle(event.startDate)}`,
          `DTEND:${formatDateForGoogle(event.endDate)}`,
          `SUMMARY:${event.title}`,
          `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
          `LOCATION:${event.location}`,
          "END:VEVENT",
          "END:VCALENDAR",
        ].join("\r\n");

        return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
      },
    },
    {
      type: "yahoo",
      name: "Yahoo Calendar",
      icon: "📅",
      getUrl: () => {
        const start = formatDateForGoogle(event.startDate);
        const end = formatDateForGoogle(event.endDate);
        return `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(
          event.title
        )}&st=${start}&et=${end}&in_loc=${encodeURIComponent(event.location)}&desc=${encodeURIComponent(
          event.description
        )}`;
      },
    },
  ];

  const handleAddToCalendar = (option: (typeof calendarOptions)[0]) => {
    window.open(option.getUrl(), "_blank");
    setAdded(option.type);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Add to Calendar</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {calendarOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => handleAddToCalendar(option)}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border transition-all",
              added === option.type
                ? "border-primary bg-primary/10"
                : "border-secondary hover:border-primary/50 bg-black"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{option.icon}</span>
              <span className="font-medium text-foreground">{option.name}</span>
            </div>
            {added === option.type ? (
              <Check className="h-5 w-5 text-primary" />
            ) : (
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>

      {/* Event Summary */}
      <div className="mt-6 p-4 rounded-xl border border-secondary bg-secondary/5">
        <h4 className="font-medium text-foreground mb-2">{event.title}</h4>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            {new Date(event.startDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          <p>{event.location}</p>
        </div>
      </div>
    </div>
  );
}
