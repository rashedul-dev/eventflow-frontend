"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateRangePickerProps {
  value: {
    period?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  onChange: (value: { period?: string; dateFrom?: string; dateTo?: string }) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (value.dateFrom && value.dateTo) {
      return {
        from: new Date(value.dateFrom),
        to: new Date(value.dateTo),
      };
    }
    return undefined;
  });

  const handlePeriodChange = (period: string) => {
    if (period === "custom") {
      onChange({ period });
    } else {
      onChange({ period, dateFrom: undefined, dateTo: undefined });
    }
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
      onChange({
        period: "custom",
        dateFrom: range.from.toISOString(),
        dateTo: range.to.toISOString(),
      });
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Select value={value.period || "month"} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[180px] bg-secondary/30">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">Last 7 days</SelectItem>
          <SelectItem value="month">Last 30 days</SelectItem>
          <SelectItem value="quarter">Last 3 months</SelectItem>
          <SelectItem value="year">Last year</SelectItem>
          <SelectItem value="all_time">All time</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>

      {value.period === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[300px] justify-start text-left font-normal bg-secondary/30",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
