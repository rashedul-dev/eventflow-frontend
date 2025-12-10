"use client";

import { useState, useEffect, use } from "react";
import { eventApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Save, Grid3X3, Plus, Trash2, Info, Download, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  price: number;
}

interface BackendSection {
  name: string;
  capacity: number;
  priceMultiplier?: number;
  rows: Array<{
    rowLabel: string;
    seats: number;
    startNumber?: number;
    isAccessible?: boolean;
  }>;
}

interface BackendPayload {
  name: string;
  chartData: object;
  sections: BackendSection[];
}

interface BackendSeatingChartResponse {
  _id?: string;
  name?: string;
  chartData?: {
    sections?: Section[];
    blockedSeats?: string[];
  };
  sections?: BackendSection[];
}

export default function SeatingChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const { toast } = useToast();

  const [seatingChart, setSeatingChart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [blockedSeats, setBlockedSeats] = useState<string[]>([]);
  const [chartName, setChartName] = useState("Main Seating Chart");
  const [isExistingChart, setIsExistingChart] = useState(false);

  useEffect(() => {
    fetchSeatingChart();
  }, [eventId]);

  const fetchSeatingChart = async () => {
    setIsLoading(true);
    try {
      const response = await eventApi.getSeatingChart(eventId);
      if (response.data) {
        const data = response.data as BackendSeatingChartResponse;
        setSeatingChart(data);
        setIsExistingChart(true);

        // Set chart name
        if (data.name) {
          setChartName(data.name);
        }

        // Check if chartData contains the original frontend format (preferred)
        if (data.chartData?.sections && Array.isArray(data.chartData.sections)) {
          // Use the preserved frontend format from chartData
          setSections(data.chartData.sections);
          setBlockedSeats(data.chartData.blockedSeats || []);
        } else if (data.sections && Array.isArray(data.sections)) {
          // Transform backend sections format to frontend format
          const frontendSections = transformBackendToFrontend(data.sections);
          setSections(frontendSections);
          setBlockedSeats([]);
        }
      }
    } catch (err) {
      // No seating chart exists yet, that's okay
      setIsExistingChart(false);
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      rows: 5,
      seatsPerRow: 10,
      price: 50,
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
  };

  const updateSection = (id: string, field: keyof Section, value: any) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
    if (selectedSection === id) {
      setSelectedSection(sections[0]?.id || null);
    }
  };

  const toggleSeatBlock = (seatId: string) => {
    if (blockedSeats.includes(seatId)) {
      setBlockedSeats(blockedSeats.filter((s) => s !== seatId));
    } else {
      setBlockedSeats([...blockedSeats, seatId]);
    }
  };

  const transformSectionsForBackend = (frontendSections: Section[]): BackendSection[] => {
    return frontendSections.map((section) => {
      // Create rows array from the number of rows
      const rowsArray = Array.from({ length: section.rows }, (_, index) => ({
        rowLabel: String.fromCharCode(65 + index), // A, B, C, etc.
        seats: section.seatsPerRow,
        startNumber: 1,
        isAccessible: false,
      }));

      return {
        name: section.name,
        capacity: section.rows * section.seatsPerRow,
        priceMultiplier: section.price / 50, // Normalize price as multiplier (assuming base price of 50)
        rows: rowsArray,
      };
    });
  };

  const transformBackendToFrontend = (backendSections: BackendSection[]): Section[] => {
    return backendSections.map((section, index) => {
      const rowsCount = section.rows?.length || 0;
      const seatsPerRow = section.rows?.[0]?.seats || 10;
      // Try to extract price from priceMultiplier, default to 50
      const price = section.priceMultiplier ? section.priceMultiplier * 50 : 50;

      return {
        id: `section-${index}-${Date.now()}`,
        name: section.name,
        rows: rowsCount,
        seatsPerRow: seatsPerRow,
        price: price,
      };
    });
  };

  const handleSave = async () => {
    if (sections.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one section",
        variant: "destructive",
      });
      return;
    }

    if (!chartName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a chart name",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const backendPayload: BackendPayload = {
        name: chartName,
        chartData: {
          sections: sections.map((s) => ({
            id: s.id,
            name: s.name,
            rows: s.rows,
            seatsPerRow: s.seatsPerRow,
            price: s.price,
          })),
          blockedSeats,
        },
        sections: transformSectionsForBackend(sections),
      };

      await eventApi.createSeatingChart(eventId, backendPayload);

      // Also update blocked seats if needed
      if (blockedSeats.length > 0) {
        await eventApi.updateSeatStatus(eventId, {
          seatIds: blockedSeats,
          status: "BLOCKED",
        });
      }

      toast({
        title: "Success",
        description: `Seating chart ${isExistingChart ? "updated" : "created"} successfully`,
      });
      fetchSeatingChart();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save seating chart",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSeatId = (sectionId: string, row: number, seat: number) => {
    return `${sectionId}-R${row}-S${seat}`;
  };

  const getTotalSeats = () => {
    return sections.reduce((sum, s) => sum + s.rows * s.seatsPerRow, 0);
  };

  const getBlockedSeatsCount = () => {
    return blockedSeats.length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/dashboard/organizer/events/${eventId}`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Seating Chart</h1>
            <p className="text-muted-foreground">
              {isExistingChart ? "View your event seating configuration" : "Configure seating for your event"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={sections.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {!isExistingChart && (
            <Button onClick={handleSave} disabled={isSaving || sections.length === 0}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Chart
            </Button>
          )}
        </div>
      </div>

      {isExistingChart && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <Lock className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            This seating chart has already been created and cannot be modified. This ensures ticket purchases remain
            valid. If you need to make changes, please contact support.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chart Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label htmlFor="chartName">Chart Name *</Label>
            <Input
              id="chartName"
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
              placeholder="Enter chart name"
              className="mt-1"
              disabled={isExistingChart}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{sections.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Sections</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{getTotalSeats()}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Seats</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{getBlockedSeatsCount()}</p>
              <p className="text-sm text-muted-foreground mt-1">Blocked Seats</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {!isExistingChart && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Create sections to organize your venue. Click on individual seats to block them. Blocked seats won't be
            available for purchase.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sections Config */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Sections</CardTitle>
              {!isExistingChart && (
                <Button variant="outline" size="sm" onClick={addSection}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {sections.length === 0 ? (
                <div className="text-center py-8">
                  <Grid3X3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm mb-3">No sections yet</p>
                  {!isExistingChart && (
                    <Button onClick={addSection} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Section
                    </Button>
                  )}
                </div>
              ) : (
                sections.map((section) => (
                  <div
                    key={section.id}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      isExistingChart ? "" : "cursor-pointer",
                      selectedSection === section.id
                        ? "border-primary bg-primary/5"
                        : "border-secondary hover:border-secondary/80"
                    )}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Input
                        value={section.name}
                        onChange={(e) => updateSection(section.id, "name", e.target.value)}
                        className="h-8 text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                        disabled={isExistingChart}
                      />
                      {!isExistingChart && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSection(section.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <Label className="text-xs">Rows</Label>
                        <Input
                          type="number"
                          value={section.rows}
                          onChange={(e) => updateSection(section.id, "rows", Number.parseInt(e.target.value) || 1)}
                          className="h-7"
                          min="1"
                          max="26"
                          onClick={(e) => e.stopPropagation()}
                          disabled={isExistingChart}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Seats/Row</Label>
                        <Input
                          type="number"
                          value={section.seatsPerRow}
                          onChange={(e) =>
                            updateSection(section.id, "seatsPerRow", Number.parseInt(e.target.value) || 1)
                          }
                          className="h-7"
                          min="1"
                          max="50"
                          onClick={(e) => e.stopPropagation()}
                          disabled={isExistingChart}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Price ($)</Label>
                        <Input
                          type="number"
                          value={section.price}
                          onChange={(e) => updateSection(section.id, "price", Number.parseFloat(e.target.value) || 0)}
                          className="h-7"
                          min="0"
                          step="0.01"
                          onClick={(e) => e.stopPropagation()}
                          disabled={isExistingChart}
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {section.rows * section.seatsPerRow} total seats
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/20 border border-primary" />
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-red-500/20 border border-red-500" />
                <span className="text-sm">Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-green-500/20 border border-green-500" />
                <span className="text-sm">Sold</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-500" />
                <span className="text-sm">Reserved</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seating Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5" />
                Seating Preview
                {selectedSection && (
                  <Badge variant="outline" className="ml-2">
                    {sections.find((s) => s.id === selectedSection)?.name}
                  </Badge>
                )}
                {isExistingChart && (
                  <Badge variant="secondary" className="ml-2">
                    <Lock className="w-3 h-3 mr-1" />
                    Read Only
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isExistingChart
                  ? "Viewing seating configuration (read-only)"
                  : selectedSection
                  ? "Click seats to block/unblock them"
                  : "Select a section to view seating"}
              </p>
            </CardHeader>
            <CardContent>
              {sections.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  {isExistingChart ? "No seating data available" : "Add sections to see the seating preview"}
                </div>
              ) : (
                <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2">
                  {sections
                    .filter((s) => !selectedSection || s.id === selectedSection)
                    .map((section) => (
                      <div
                        key={section.id}
                        className={cn(
                          "p-4 rounded-lg border transition-colors",
                          selectedSection === section.id ? "border-primary bg-primary/5" : "border-secondary"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{section.name}</h4>
                          <Badge variant="secondary">${section.price}</Badge>
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                          {/* Stage */}
                          <div className="w-full max-w-md h-8 bg-linear-to-r from-primary/20 via-primary/30 to-primary/20 rounded flex items-center justify-center text-xs text-muted-foreground mb-4 font-medium">
                            STAGE
                          </div>
                          {/* Rows */}
                          {Array.from({ length: section.rows }).map((_, rowIndex) => (
                            <div key={rowIndex} className="flex gap-1 items-center">
                              <span className="w-6 text-xs text-muted-foreground text-right mr-2 font-medium">
                                {String.fromCharCode(65 + rowIndex)}
                              </span>
                              {Array.from({ length: section.seatsPerRow }).map((_, seatIndex) => {
                                const seatId = getSeatId(section.id, rowIndex, seatIndex);
                                const isBlocked = blockedSeats.includes(seatId);
                                return (
                                  <button
                                    key={seatIndex}
                                    onClick={() => !isExistingChart && toggleSeatBlock(seatId)}
                                    disabled={isExistingChart}
                                    className={cn(
                                      "w-6 h-6 rounded text-xs transition-all",
                                      !isExistingChart && "hover:scale-110",
                                      isExistingChart && "cursor-default",
                                      isBlocked
                                        ? "bg-red-500/20 border border-red-500 text-red-500"
                                        : "bg-primary/20 border border-primary",
                                      !isExistingChart && !isBlocked && "hover:bg-primary/30",
                                      !isExistingChart && isBlocked && "hover:bg-red-500/30"
                                    )}
                                    title={`${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}${
                                      isBlocked ? " (Blocked)" : ""
                                    }`}
                                  >
                                    {seatIndex + 1}
                                  </button>
                                );
                              })}
                              <span className="w-6 text-xs text-muted-foreground text-left ml-2 font-medium">
                                {String.fromCharCode(65 + rowIndex)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
