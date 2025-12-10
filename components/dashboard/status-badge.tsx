import { cn } from "@/lib/utils";

type StatusType = "active" | "published" | "pending" | "draft" | "cancelled" | "completed" | "sold-out" | "refunded";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-primary/20 text-primary border-primary/30",
  },
  published: {
    label: "Published",
    className: "bg-primary/20 text-primary border-primary/30",
  },
  pending: {
    label: "Pending",
    className: "bg-secondary text-foreground/70 border-secondary",
  },
  draft: {
    label: "Draft",
    className: "bg-foreground/10 text-foreground/50 border-foreground/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  "sold-out": {
    label: "Sold Out",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  refunded: {
    label: "Refunded",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {/* Animated dot for active/published status */}
      {(status === "active" || status === "published") && (
        <span className="relative mr-1.5">
          <span className="absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
      )}
      {config.label}
    </span>
  );
}
