"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, SlidersHorizontal, MapPin, CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Loading from "@/app/dashboard/admin/reports/loading";

export default function Page() {
  return (
    <Suspense fallback={<div>{<Loading />}</div>}>
      <EventFilters />
    </Suspense>
  );
}

const categories = [
  "all",
  "conference",
  "workshop",
  "seminar",
  "concert",
  "festival",
  "sports",
  "networking",
  "fundraiser",
  "party",
  "exhibition",
  "meetup",
  "webinar",
  "class",
  "retreat",
  "other",
];

interface EventFiltersProps {
  onFilterChange?: (filters: any) => void;
}

export function EventFilters({ onFilterChange }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm") || "");
  const [location, setLocation] = useState(searchParams.get("city") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [date, setDate] = useState<Date | undefined>(
    searchParams.get("startDateFrom") ? new Date(searchParams.get("startDateFrom")!) : undefined
  );
  const [isVirtual, setIsVirtual] = useState(searchParams.get("isVirtual") === "true");

  const hasActiveFilters = category !== "all" || date || isVirtual || searchTerm || location;

  // Apply filters immediately when category, date, or isVirtual changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchTerm) params.set("searchTerm", searchTerm);
    if (location) params.set("city", location);
    if (category && category !== "all") params.set("category", category);
    if (date) params.set("startDateFrom", format(date, "yyyy-MM-dd"));
    if (isVirtual) params.set("isVirtual", "true");

    router.push(`/events?${params.toString()}`);
  }, [category, date, isVirtual]);

  const applySearchFilters = () => {
    const params = new URLSearchParams();

    if (searchTerm) params.set("searchTerm", searchTerm);
    if (location) params.set("city", location);
    if (category && category !== "all") params.set("category", category);
    if (date) params.set("startDateFrom", format(date, "yyyy-MM-dd"));
    if (isVirtual) params.set("isVirtual", "true");

    router.push(`/events?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setCategory("all");
    setDate(undefined);
    setIsVirtual(false);
    router.push("/events");
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearchFilters()}
            className="pl-10"
          />
        </div>
        <div className="relative sm:w-64">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="City or location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearchFilters()}
            className="pl-10"
          />
        </div>
        <Button className="gap-2" onClick={applySearchFilters}>
          <Search className="w-4 h-4" />
          Search
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date */}
        {/* <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-45 justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover> */}

        {/* More Filters (Mobile Sheet) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <SlidersHorizontal className="w-4 h-4" />
              More Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6 px-4">
              <div className="space-y-4">
                <Label>Event Type</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="virtual"
                      checked={isVirtual}
                      onCheckedChange={(checked) => setIsVirtual(checked as boolean)}
                    />
                    <Label htmlFor="virtual" className="font-normal">
                      Virtual Events Only
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Category</Label>
                <div className="space-y-3">
                  {categories
                    .filter((c) => c !== "all")
                    .map((cat) => (
                      <div key={cat} className="flex items-center gap-2">
                        <Checkbox
                          id={cat}
                          checked={category === cat}
                          onCheckedChange={(checked) => setCategory(checked ? cat : "all")}
                        />
                        <Label htmlFor={cat} className="font-normal">
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
                  Clear All Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
