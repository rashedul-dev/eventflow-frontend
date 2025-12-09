"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, AlertTriangle, TrendingUp, Edit2, Check, X } from "lucide-react";
import { eventApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CapacityManagerProps {
  eventId: string;
  currentCapacity?: number;
  soldTickets?: number;
  availableSeats?: number;
}

export function CapacityManager({
  eventId,
  currentCapacity = 0,
  soldTickets = 0,
  availableSeats,
}: CapacityManagerProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newCapacity, setNewCapacity] = useState(currentCapacity.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [capacityData, setCapacityData] = useState<any>(null);

  useEffect(() => {
    fetchCapacityData();
  }, [eventId]);

  const fetchCapacityData = async () => {
    try {
      const response = await eventApi.getCapacity(eventId);
      if (response.data) {
        setCapacityData(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch capacity data:", err);
    }
  };

  const totalSold = capacityData?.soldTickets || soldTickets;
  const capacity = capacityData?.capacity || currentCapacity;
  const available = capacityData?.availableSeats ?? availableSeats ?? capacity - totalSold;
  const utilizationPercentage = capacity > 0 ? (totalSold / capacity) * 100 : 0;

  const handleUpdateCapacity = async () => {
    const newCapacityNum = parseInt(newCapacity);

    if (isNaN(newCapacityNum) || newCapacityNum < totalSold) {
      toast({
        title: "Invalid capacity",
        description: `Capacity must be at least ${totalSold} (current sold tickets)`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await eventApi.updateCapacity(eventId, { capacity: newCapacityNum });
      toast({
        title: "Capacity updated",
        description: "Event capacity has been updated successfully.",
      });
      setIsEditing(false);
      fetchCapacityData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update capacity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUtilizationColor = () => {
    if (utilizationPercentage >= 90) return "text-red-500";
    if (utilizationPercentage >= 75) return "text-amber-500";
    if (utilizationPercentage >= 50) return "text-blue-500";
    return "text-green-500";
  };

  const getUtilizationStatus = () => {
    if (utilizationPercentage >= 90) return "Critical - Near capacity";
    if (utilizationPercentage >= 75) return "High - Consider increasing";
    if (utilizationPercentage >= 50) return "Good - On track";
    return "Low - Plenty of space";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Capacity Management
          </span>
          {/* {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(true);
                setNewCapacity(capacity.toString());
              }}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )} */}
        </CardTitle>
        <CardDescription>Monitor and manage event attendance capacity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Capacity Input */}
        {isEditing ? (
          <div className="space-y-3">
            <Label htmlFor="capacity">Total Capacity</Label>
            <div className="flex gap-2">
              <Input
                id="capacity"
                type="number"
                min={totalSold}
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                placeholder="Enter capacity"
                className="max-w-xs"
              />
              <Button onClick={handleUpdateCapacity} disabled={isLoading} size="sm">
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setNewCapacity(capacity.toString());
                }}
                disabled={isLoading}
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Minimum capacity: {totalSold} (current sold tickets)</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Total Capacity</Label>
            <p className="text-3xl font-bold text-foreground">{capacity.toLocaleString()}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Sold</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalSold.toLocaleString()}</p>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Available</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{available.toLocaleString()}</p>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Utilization</span>
            </div>
            <p className={`text-2xl font-bold ${getUtilizationColor()}`}>{utilizationPercentage.toFixed(1)}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Capacity Usage</span>
            <span className={`font-medium ${getUtilizationColor()}`}>{getUtilizationStatus()}</span>
          </div>
          <Progress value={utilizationPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>{capacity.toLocaleString()}</span>
          </div>
        </div>

        {/* Warnings */}
        {utilizationPercentage >= 90 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your event is at {utilizationPercentage.toFixed(1)}% capacity! Consider increasing the capacity or
              creating a waitlist.
            </AlertDescription>
          </Alert>
        )}

        {utilizationPercentage >= 75 && utilizationPercentage < 90 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your event is {utilizationPercentage.toFixed(1)}% full. You may want to consider increasing capacity soon.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
