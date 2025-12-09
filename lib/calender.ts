// Calendar utility for generating .ics files

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  url?: string;
  organizer?: {
    name: string;
    email?: string;
  };
}

/**
 * Formats a date for iCalendar format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapes special characters in iCalendar text fields
 */
function escapeICSText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/**
 * Generates an .ics file content for a calendar event
 */
export function generateICS(event: CalendarEvent): string {
  const now = new Date();
  const dtstamp = formatICSDate(now);
  const dtstart = formatICSDate(event.startTime);
  const dtend = formatICSDate(event.endTime);

  // Generate a unique ID for the event
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@eventflow.com`;

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EventFlow//Event Ticketing System//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICSText(event.title)}`,
  ];

  if (event.description) {
    icsContent.push(`DESCRIPTION:${escapeICSText(event.description)}`);
  }

  if (event.location) {
    icsContent.push(`LOCATION:${escapeICSText(event.location)}`);
  }

  if (event.url) {
    icsContent.push(`URL:${event.url}`);
  }

  if (event.organizer) {
    const organizerStr = event.organizer.email
      ? `ORGANIZER;CN=${escapeICSText(event.organizer.name)}:MAILTO:${event.organizer.email}`
      : `ORGANIZER;CN=${escapeICSText(event.organizer.name)}:MAILTO:noreply@eventflow.com`;
    icsContent.push(organizerStr);
  }

  icsContent.push("STATUS:CONFIRMED", "SEQUENCE:0", "END:VEVENT", "END:VCALENDAR");

  return icsContent.join("\r\n");
}

/**
 * Downloads an .ics file to the user's device
 */
export function downloadICS(event: CalendarEvent, filename?: string): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}

/**
 * Creates a calendar event from ticket data
 */
export function createEventFromTicket(ticket: any): CalendarEvent {
  const event = ticket.event;

  const startTime = new Date(event.startDate);
  const endTime = event.endDate ? new Date(event.endDate) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

  let location = "";
  if (event.isVirtual) {
    location = event.virtualLink || "Online Event";
  } else {
    const locationParts = [];
    if (event.venueName) locationParts.push(event.venueName);
    if (event.address) locationParts.push(event.address);
    if (event.city) locationParts.push(event.city);
    if (event.state) locationParts.push(event.state);
    if (event.country) locationParts.push(event.country);
    location = locationParts.join(", ");
  }

  const description = [
    event.description || "",
    "",
    `Ticket Number: ${ticket.ticketNumber}`,
    `Ticket Type: ${ticket.ticketType?.name || "General"}`,
  ].join("\n");

  return {
    title: event.title,
    description,
    location,
    startTime,
    endTime,
    url: typeof window !== "undefined" ? `${window.location.origin}/events/${event.slug}` : undefined,
    organizer: event.organizer
      ? {
          name: event.organizer.organizationName || "EventFlow",
          email: event.organizer.email,
        }
      : undefined,
  };
}
