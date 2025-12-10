"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { userApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Calendar, ExternalLink, Loader2 } from "lucide-react";

interface Organizer {
  id: string;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  organizationDesc?: string;
  avatar?: string;
  website?: string;
  _count?: {
    organizedEvents?: number;
    events?: number;
  };
}

export function OrganizersList() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async (searchQuery?: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await userApi.getOrganizers({ search: searchQuery });
      if (response.data) {
        setOrganizers(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load organizers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrganizers(search);
  };

  const getInitials = (organizer: Organizer) => {
    if (organizer.organizationName) {
      return organizer.organizationName.slice(0, 2).toUpperCase();
    }
    const first = organizer.firstName?.[0] || "";
    const last = organizer.lastName?.[0] || "";
    return (first + last).toUpperCase() || "OR";
  };

  const getDisplayName = (organizer: Organizer) => {
    return (
      organizer.organizationName ||
      `${organizer.firstName || ""} ${organizer.lastName || ""}`.trim() ||
      "Unknown Organizer"
    );
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => fetchOrganizers()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search organizers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Organizers Grid */}
      {!isLoading && organizers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No organizers found.</p>
        </div>
      )}

      {!isLoading && organizers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizers.map((organizer) => (
            <Link key={organizer.id} href={`/organizers/${organizer.id}`}>
              <Card className="bg-secondary/30 border-foreground/10 p-6 hover:bg-secondary/50 transition-colors h-full">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={organizer.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/20 text-primary text-lg">
                      {getInitials(organizer)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{getDisplayName(organizer)}</h3>
                    {organizer.organizationDesc && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{organizer.organizationDesc}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-foreground/10">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{organizer._count?.organizedEvents || organizer._count?.events || 0} events</span>
                  </div>
                  {organizer.website && (
                    <div className="flex items-center gap-1 text-sm text-primary">
                      <ExternalLink className="h-4 w-4" />
                      <span>Website</span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
