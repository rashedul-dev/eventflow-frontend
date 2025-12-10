"use client";

import type React from "react";

import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { userApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Building, Globe, CheckCircle, Calendar, Users, BarChart3, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createOrganizerProfileSchema } from "@/lib/validations/user.validation";
import { zodErrorsToRecord, mapApiErrorsToFields } from "@/lib/validations/helpers";

export function BecomeOrganizerForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationDesc: "",
    website: "",
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const result = createOrganizerProfileSchema.safeParse({
      organizationName: formData.organizationName,
      organizationDesc: formData.organizationDesc || undefined,
      website: formData.website || undefined,
      socialLinks: formData.socialLinks,
    });

    if (!result.success) {
      const errors = zodErrorsToRecord(result.error);
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      await userApi.becomeOrganizer({
        organizationName: formData.organizationName,
        organizationDesc: formData.organizationDesc || undefined,
        website: formData.website || undefined,
        socialLinks: formData.socialLinks,
      });

      await refreshUser();

      toast({
        title: "Congratulations!",
        description: "You are now an organizer. Start creating events!",
      });

      router.push("/dashboard/organizer");
    } catch (error: any) {
      if (error.errors && Array.isArray(error.errors)) {
        const mappedErrors = mapApiErrorsToFields(error.errors);
        setFieldErrors(mappedErrors);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to upgrade account. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("socialLinks.")) {
      const socialKey = field.split(".")[1];
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [socialKey]: value },
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }

    if (fieldErrors[field]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[field];
      setFieldErrors(newErrors);
    }
  };

  return (
    <div className="space-y-6">
      {/* Benefits Card */}
      <Card className="bg-primary/5 border-primary/20 p-6">
        <h3 className="font-semibold text-foreground mb-4">Organizer Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Create Events</p>
              <p className="text-xs text-muted-foreground">Host unlimited events</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Manage Attendees</p>
              <p className="text-xs text-muted-foreground">Track registrations</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Analytics</p>
              <p className="text-xs text-muted-foreground">Detailed insights</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Form Card */}
      <Card className="bg-secondary/30 border-foreground/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/20">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Organization Details</h3>
            <p className="text-sm text-muted-foreground">Tell us about your organization</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organizationName">
              Organization Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="organizationName"
              value={formData.organizationName}
              onChange={(e) => handleInputChange("organizationName", e.target.value)}
              placeholder="Your Company or Brand Name"
              className={cn(fieldErrors.organizationName && "border-destructive focus-visible:ring-destructive")}
              required
            />
            {fieldErrors.organizationName && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.organizationName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationDesc">Description</Label>
            <Textarea
              id="organizationDesc"
              value={formData.organizationDesc}
              onChange={(e) => handleInputChange("organizationDesc", e.target.value)}
              placeholder="Tell people about your organization and the events you plan to host..."
              rows={4}
              className={cn(fieldErrors.organizationDesc && "border-destructive focus-visible:ring-destructive")}
            />
            {fieldErrors.organizationDesc && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.organizationDesc}
              </p>
            )}
            <p className="text-xs text-muted-foreground">Maximum 2000 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://yourwebsite.com"
                className={cn("pl-10", fieldErrors.website && "border-destructive focus-visible:ring-destructive")}
              />
            </div>
            {fieldErrors.website && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.website}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-foreground/10">
            <Label className="text-base">Social Media Links (Optional)</Label>
            <p className="text-sm text-muted-foreground -mt-2">Connect your social media profiles</p>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  type="url"
                  value={formData.socialLinks.facebook}
                  onChange={(e) => handleInputChange("socialLinks.facebook", e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className={cn(fieldErrors["socialLinks.facebook"] && "border-destructive")}
                />
                {fieldErrors["socialLinks.facebook"] && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors["socialLinks.facebook"]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  type="url"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleInputChange("socialLinks.twitter", e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                  className={cn(fieldErrors["socialLinks.twitter"] && "border-destructive")}
                />
                {fieldErrors["socialLinks.twitter"] && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors["socialLinks.twitter"]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  type="url"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => handleInputChange("socialLinks.instagram", e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                  className={cn(fieldErrors["socialLinks.instagram"] && "border-destructive")}
                />
                {fieldErrors["socialLinks.instagram"] && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors["socialLinks.instagram"]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => handleInputChange("socialLinks.linkedin", e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                  className={cn(fieldErrors["socialLinks.linkedin"] && "border-destructive")}
                />
                {fieldErrors["socialLinks.linkedin"] && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors["socialLinks.linkedin"]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  type="url"
                  value={formData.socialLinks.youtube}
                  onChange={(e) => handleInputChange("socialLinks.youtube", e.target.value)}
                  placeholder="https://youtube.com/@yourchannel"
                  className={cn(fieldErrors["socialLinks.youtube"] && "border-destructive")}
                />
                {fieldErrors["socialLinks.youtube"] && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors["socialLinks.youtube"]}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Upgrading...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Become an Organizer
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
