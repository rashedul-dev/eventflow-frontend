"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { userApi } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, ExternalLink, Loader2, ArrowLeft } from "lucide-react"
import type { Event } from "@/lib/types"

interface OrganizerData {
  id: string
  firstName?: string
  lastName?: string
  organizationName?: string
  organizationDesc?: string
  avatar?: string
  website?: string
  socialLinks?: Record<string, string>
  events?: Event[]
  _count?: {
    organizedEvents?: number
    events?: number
  }
}

export function OrganizerProfile({ organizerId }: { organizerId: string }) {
  const [organizer, setOrganizer] = useState<OrganizerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOrganizer()
  }, [organizerId])

  const fetchOrganizer = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await userApi.getOrganizerById(organizerId)
      if (response.data) {
        setOrganizer(response.data)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load organizer profile")
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = () => {
    if (organizer?.organizationName) {
      return organizer.organizationName.slice(0, 2).toUpperCase()
    }
    const first = organizer?.firstName?.[0] || ""
    const last = organizer?.lastName?.[0] || ""
    return (first + last).toUpperCase() || "OR"
  }

  const getDisplayName = () => {
    return (
      organizer?.organizationName ||
      `${organizer?.firstName || ""} ${organizer?.lastName || ""}`.trim() ||
      "Unknown Organizer"
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !organizer) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error || "Organizer not found"}</p>
        <Button asChild variant="outline">
          <Link href="/organizers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Organizers
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/organizers"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Organizers
      </Link>

      {/* Profile Header */}
      <Card className="bg-secondary/30 border-foreground/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32">
            <AvatarImage src={organizer.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary/20 text-primary text-3xl">{getInitials()}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{getDisplayName()}</h1>

            {organizer.organizationDesc && (
              <p className="text-muted-foreground mt-2 max-w-2xl">{organizer.organizationDesc}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{organizer._count?.organizedEvents || organizer._count?.events || organizer.events?.length || 0} events</span>
              </div>

              {organizer.website && (
                <a
                  href={organizer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Events Section */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Events by this organizer</h2>

        {!organizer.events || organizer.events.length === 0 ? (
          <Card className="bg-secondary/30 border-foreground/10 p-8 text-center">
            <p className="text-muted-foreground">No events found from this organizer.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizer.events.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`}>
                <Card className="bg-secondary/30 border-foreground/10 overflow-hidden hover:bg-secondary/50 transition-colors h-full">
                  {event.coverImage && (
                    <div className="aspect-video bg-muted">
                      <img
                        src={event.coverImage || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-1">{event.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {event.venueName && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{event.venueName}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}