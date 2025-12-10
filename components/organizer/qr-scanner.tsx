"use client";

import { useState, useRef, useEffect } from "react";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, QrCode, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface QRScannerProps {
  onScan: (ticketNumber: string) => Promise<{ success: boolean; message?: string; ticket?: any }>;
  className?: string;
}

export function QRScanner({ onScan, className }: QRScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualEntry, setManualEntry] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Wait for video to actually start playing
        await videoRef.current.play();
        setIsCameraActive(true);

        // Start scanning after video is ready
        setTimeout(() => {
          scanningRef.current = true;
          scanQRCode();
        }, 500);
      }
    } catch (error: any) {
      console.error("Camera access denied:", error);
      setCameraError("Camera access denied. Please enable camera permissions and try again, or use manual entry.");
    }
  };

  const stopCamera = () => {
    scanningRef.current = false;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  };

  const scanQRCode = () => {
    if (!scanningRef.current || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanQRCode);
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data && !isProcessing) {
        console.log("QR Code detected:", code.data);
        scanningRef.current = false; // Stop scanning while processing
        handleScan(code.data);
        return;
      }
    } catch (e) {
      console.error("QR scan error:", e);
    }

    // Continue scanning
    if (scanningRef.current && !isProcessing) {
      requestAnimationFrame(scanQRCode);
    }
  };

  const handleScan = async (ticketNumber: string) => {
    if (isProcessing || !ticketNumber.trim()) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await onScan(ticketNumber.trim());

      setResult({
        success: response.success,
        message: response.message || (response.success ? "Check-in successful!" : "Check-in failed"),
      });

      if (response.success) {
        setManualEntry("");
        // Auto-clear result and resume scanning
        setTimeout(() => {
          setResult(null);
          setIsProcessing(false);
          if (isCameraActive) {
            scanningRef.current = true;
            scanQRCode();
          }
        }, 2000);
      } else {
        setIsProcessing(false);
        // Resume scanning after error
        if (isCameraActive) {
          setTimeout(() => {
            setResult(null);
            scanningRef.current = true;
            scanQRCode();
          }, 3000);
        }
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Failed to process check-in",
      });
      setIsProcessing(false);
      // Resume scanning after error
      if (isCameraActive) {
        setTimeout(() => {
          setResult(null);
          scanningRef.current = true;
          scanQRCode();
        }, 3000);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(manualEntry);
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
    setManualEntry("");
    setResult(null);
    setCameraError(null);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className={className}>
        <QrCode className="w-4 h-4 mr-2" />
        Scan QR Code
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check In Attendee</DialogTitle>
            <DialogDescription>Scan the QR code on the ticket or enter the ticket number manually.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Camera Scanner */}
            <Card>
              <CardContent className="p-4">
                {!isCameraActive ? (
                  <div className="text-center py-8">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      {cameraError || "Use your camera to scan QR codes"}
                    </p>

                    {/* <Button
                      onClick={startCamera}
                      variant="outline"
                      disabled={!!cameraError && cameraError.includes("denied")}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {cameraError ? "Retry Camera" : "Start Camera"}
                    </Button> */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            {" "}
                            {/* span wrapper because button is disabled and won’t emit pointer events */}
                            <Button onClick={startCamera} variant="outline" disabled>
                              <Camera className="w-4 h-4 mr-2" />
                              {cameraError ? "Retry Camera" : "Start Camera"}
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Upcoming Feature</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full rounded-lg bg-black"
                      style={{ maxHeight: "300px", objectFit: "cover" }}
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* QR Code frame overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-48 h-48 border-2 border-primary rounded-lg">
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
                      </div>
                    </div>

                    {/* Processing overlay */}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    )}

                    {/* Close button */}
                    <Button
                      onClick={stopCamera}
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 z-10"
                    >
                      <X className="w-4 h-4" />
                    </Button>

                    {/* Status indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/90 px-3 py-1 rounded-full text-xs z-10">
                      {isProcessing ? "Processing..." : "Position QR code in frame"}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manual Entry */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticketNumber">Ticket Number</Label>
                <Input
                  id="ticketNumber"
                  placeholder="EVT-1-A3F9K2M7 or QR code"
                  value={manualEntry}
                  onChange={(e) => setManualEntry(e.target.value)}
                  disabled={isProcessing}
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && manualEntry.trim()) {
                      e.preventDefault();
                      handleScan(manualEntry);
                    }
                  }}
                />
              </div>

              <Button
                onClick={() => handleScan(manualEntry)}
                className="w-full"
                disabled={isProcessing || !manualEntry.trim()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Check In
                  </>
                )}
              </Button>
            </div>

            {/* Result Message */}
            {result && (
              <Card
                className={cn(
                  "border-2",
                  result.success ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <p className={cn("text-sm font-medium", result.success ? "text-green-500" : "text-red-500")}>
                      {result.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
