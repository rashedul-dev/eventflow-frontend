"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Filter, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "date" | "dateRange" | "text" | "boolean";
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  className?: string;
  onFiltersChange?: (filters: Record<string, string>) => void;
  syncWithUrl?: boolean;
}

export function FilterPanel({ filters, className, onFiltersChange, syncWithUrl = true }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Initialize values from URL
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (syncWithUrl) {
      filters.forEach((filter) => {
        const param = searchParams.get(filter.key);
        if (param) initial[filter.key] = param;
      });
    }
    return initial;
  });

  // Count active filters
  const activeFilterCount = Object.values(values).filter(Boolean).length;

  const updateFilter = useCallback((key: string, value: string) => {
    setValues((prev) => {
      const newValues = { ...prev };
      if (value) {
        newValues[key] = value;
      } else {
        delete newValues[key];
      }
      return newValues;
    });
  }, []);

  const applyFilters = useCallback(() => {
    if (syncWithUrl) {
      const params = new URLSearchParams(searchParams.toString());

      // Clear existing filter params
      filters.forEach((filter) => params.delete(filter.key));

      // Set new values
      Object.entries(values).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      // Reset to page 1
      params.delete("page");

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
    onFiltersChange?.(values);
    setIsOpen(false);
  }, [values, syncWithUrl, filters, router, pathname, searchParams, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    setValues({});
    if (syncWithUrl) {
      const params = new URLSearchParams(searchParams.toString());
      filters.forEach((filter) => params.delete(filter.key));
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
    onFiltersChange?.({});
  }, [syncWithUrl, filters, router, pathname, searchParams, onFiltersChange]);

  const renderFilterInput = (filter: FilterConfig) => {
    const value = values[filter.key] || "";

    switch (filter.type) {
      case "select":
        return (
          <Select value={value} onValueChange={(v) => updateFilter(filter.key, v)}>
            <SelectTrigger className="bg-secondary/30 border-foreground/10">
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => updateFilter(filter.key, e.target.value)}
            className="bg-secondary/30 border-foreground/10"
          />
        );

      case "text":
        return (
          <Input
            type="text"
            value={value}
            placeholder={filter.placeholder}
            onChange={(e) => updateFilter(filter.key, e.target.value)}
            className="bg-secondary/30 border-foreground/10"
          />
        );

      case "boolean":
        return (
          <Select value={value} onValueChange={(v) => updateFilter(filter.key, v)}>
            <SelectTrigger className="bg-secondary/30 border-foreground/10">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Quick filters for desktop - show first 2 */}
      <div className="hidden md:flex items-center gap-2">
        {filters.slice(0, 2).map((filter) => (
          <div key={filter.key} className="w-40">
            {renderFilterInput(filter)}
          </div>
        ))}
      </div>

      {/* Filter button with sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:w-96 bg-background">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Filters
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <Label>{filter.label}</Label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="hidden lg:flex items-center gap-2 flex-wrap">
          {Object.entries(values).map(([key, value]) => {
            if (!value) return null;
            const filter = filters.find((f) => f.key === key);
            const option = filter?.options?.find((o) => o.value === value);
            const displayValue = option?.label || value;

            return (
              <Badge key={key} variant="secondary" className="gap-1 pr-1">
                {filter?.label}: {displayValue}
                <button
                  onClick={() => {
                    updateFilter(key, "");
                    if (syncWithUrl) {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete(key);
                      router.push(`${pathname}?${params.toString()}`, { scroll: false });
                    }
                  }}
                  className="ml-1 hover:bg-foreground/10 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
