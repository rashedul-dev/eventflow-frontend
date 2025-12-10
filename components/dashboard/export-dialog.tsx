"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { analyticsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, FileSpreadsheet, FileText, FileCode } from "lucide-react";

interface ExportDialogProps {
  type: "organizer" | "platform" | "event";
  eventId?: string;
  dateRange?: {
    period?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export function ExportDialog({ type, eventId, dateRange }: ExportDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<"csv" | "pdf" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Build export params
      const params: any = {
        format,
        period: dateRange?.period,
        dateFrom: dateRange?.dateFrom,
        dateTo: dateRange?.dateTo,
      };

      if (type === "event" && eventId) {
        params.eventId = eventId;
        params.metrics = "sales,attendees,revenue";
      } else if (type === "organizer") {
        params.metrics = "revenue,tickets,events";
      } else if (type === "platform") {
        params.metrics = "users,revenue,events,commission";
      }

      const response = await analyticsApi.export(params);

      // Handle different response formats
      if (response.data?.downloadUrl) {
        // Backend provided a download URL
        const isInIframe = window.self !== window.top;
        if (isInIframe) {
          window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: response.data.downloadUrl } }, "*");
        } else {
          window.open(response.data.downloadUrl, "_blank", "noopener,noreferrer");
        }
        toast({
          title: "Export Ready",
          description: `Your ${format.toUpperCase()} file is downloading.`,
        });
      } else if (response.data?.content) {
        // Handle inline content download
        const mimeTypes = {
          csv: "text/csv",
          json: "application/json",
          pdf: "application/pdf",
        };

        let content = response.data.content;
        if (format === "json" && typeof content === "object") {
          content = JSON.stringify(content, null, 2);
        }

        const blob = new Blob([content], { type: mimeTypes[format] });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-${type}-${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Export Complete",
          description: `Your ${format.toUpperCase()} file has been downloaded.`,
        });
      } else {
        // Export queued for later
        toast({
          title: "Export Started",
          description: `Your ${format.toUpperCase()} export is being prepared. You'll receive a notification when it's ready.`,
        });
      }
      setIsOpen(false);
    } catch (err: any) {
      console.error("Export error:", err);
      toast({
        title: "Export Failed",
        description: err.message || "Failed to export analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    {
      value: "csv",
      label: "CSV",
      description: "Comma-separated values, opens in Excel/Sheets",
      icon: FileCode,
    },
    {
      value: "json",
      label: "JSON",
      description: "Structured data format for developers",
      icon: FileSpreadsheet,
    },
    {
      value: "pdf",
      label: "PDF",
      description: "Print-ready document format",
      icon: FileText,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Analytics</DialogTitle>
          <DialogDescription>Choose a format to export your analytics data.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label className="text-sm font-medium mb-3 block">Export Format</Label>
          <RadioGroup value={format} onValueChange={(v: any) => setFormat(v)} className="space-y-3">
            {formatOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    format === option.value
                      ? "border-primary bg-primary/5"
                      : "border-foreground/10 hover:border-foreground/20"
                  }`}
                  onClick={() => setFormat(option.value as any)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="p-2 rounded-lg bg-secondary">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
