"use client";

import { useState, useCallback, useEffect } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Loading from "@/app/dashboard/admin/reports/loading";

export default function Page() {
  return (
    <Suspense fallback={<div>{<Loading />}</div>}>
      <SearchBar />
    </Suspense>
  );
}

interface SearchBarProps {
  placeholder?: string;
  paramName?: string;
  className?: string;
  onSearch?: (term: string) => void;
  isLoading?: boolean;
  syncWithUrl?: boolean;
}

export function SearchBar({
  placeholder = "Search...",
  paramName = "search",
  className,
  onSearch,
  isLoading = false,
  syncWithUrl = true,
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(() => {
    if (syncWithUrl) {
      return searchParams.get(paramName) || "";
    }
    return "";
  });

  const debouncedValue = useDebounce(value, 300);

  // Update URL when debounced value changes
  useEffect(() => {
    if (!syncWithUrl) {
      onSearch?.(debouncedValue);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (debouncedValue) {
      params.set(paramName, debouncedValue);
    } else {
      params.delete(paramName);
    }

    // Reset to page 1 when searching
    params.delete("page");

    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
    onSearch?.(debouncedValue);
  }, [debouncedValue, syncWithUrl]);

  const handleClear = useCallback(() => {
    setValue("");
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10 pr-10 bg-secondary/30 border-foreground/10"
      />
      {isLoading ? (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
      ) : (
        value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )
      )}
    </div>
  );
}
