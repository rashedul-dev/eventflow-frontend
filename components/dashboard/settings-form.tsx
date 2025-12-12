"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { userApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, User, Lock, Trash2, Building, Globe, AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { zodErrorsToRecord, mapApiErrorsToFields } from "@/lib/validations/helpers";
import {
  deleteAccountSchema,
  updateOrganizerProfileSchema,
  updateProfileSchema,
} from "@/lib/validations/user.validation";
import { changePasswordSchema } from "@/lib/validations/auth.validation";

export function SettingsForm() {
  const { user, refreshUser, changePassword, logout } = useAuth();
  const { toast } = useToast();

  // Profile form state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });

  // Password form state
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Delete account state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Organizer profile state (for organizers only)
  const [organizerLoading, setOrganizerLoading] = useState(false);
  const [organizerErrors, setOrganizerErrors] = useState<Record<string, string>>({});
  const [organizerData, setOrganizerData] = useState({
    organizationName: user?.organizationName || "",
    organizationDesc: user?.organizationDesc || "",
    website: user?.website || "",
    socialLinks: {
      facebook: user?.socialLinks?.facebook || "",
      twitter: user?.socialLinks?.twitter || "",
      instagram: user?.socialLinks?.instagram || "",
      linkedin: user?.socialLinks?.linkedin || "",
      youtube: user?.socialLinks?.youtube || "",
    },
  });

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});

    const result = updateProfileSchema.safeParse({
      firstName: profileData.firstName || "",
      lastName: profileData.lastName || "",
      phone: profileData.phone || "",
      avatar: profileData.avatar || "",
    });

    if (!result.success) {
      const errors = zodErrorsToRecord(result.error);
      setProfileErrors(errors);
      return;
    }

    setProfileLoading(true);

    try {
      // Filter out empty optional fields before sending to API
      const dataToSend: any = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      };

      // Only include phone if it's not empty
      if (profileData.phone && profileData.phone.trim()) {
        dataToSend.phone = profileData.phone;
      }

      // Only include avatar if it's not empty
      if (profileData.avatar && profileData.avatar.trim()) {
        dataToSend.avatar = profileData.avatar;
      }

      await userApi.updateProfile(dataToSend);
      await refreshUser();
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      if (error.errors && Array.isArray(error.errors)) {
        setProfileErrors(mapApiErrorsToFields(error.errors));
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    // Check passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    const result = changePasswordSchema.safeParse({
      oldPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    if (!result.success) {
      const errors = zodErrorsToRecord(result.error);
      // Map oldPassword to currentPassword for display
      if (errors.oldPassword) {
        errors.currentPassword = errors.oldPassword;
        delete errors.oldPassword;
      }
      setPasswordErrors(errors);
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
    } catch (error: any) {
      if (error.errors && Array.isArray(error.errors)) {
        setPasswordErrors(mapApiErrorsToFields(error.errors));
      } else if (error.message?.includes("incorrect") || error.message?.includes("wrong")) {
        setPasswordErrors({ currentPassword: "Current password is incorrect" });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to change password",
          variant: "destructive",
        });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleOrganizerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrganizerErrors({});

    // Check if organizationName is empty
    if (!organizerData.organizationName || !organizerData.organizationName.trim()) {
      setOrganizerErrors({
        organizationName: "Organization name is required",
      });
      return;
    }

    const result = updateOrganizerProfileSchema.safeParse({
      organizationName: organizerData.organizationName || undefined,
      organizationDesc: organizerData.organizationDesc || undefined,
      website: organizerData.website || undefined,
      socialLinks: organizerData.socialLinks,
    });

    if (!result.success) {
      const errors = zodErrorsToRecord(result.error);
      setOrganizerErrors(errors);
      return;
    }

    setOrganizerLoading(true);

    try {
      // Filter out empty optional fields before sending to API
      const dataToSend: any = {
        organizationName: organizerData.organizationName.trim(),
      };

      // Only include optional fields if they're not empty
      if (organizerData.organizationDesc && organizerData.organizationDesc.trim()) {
        dataToSend.organizationDesc = organizerData.organizationDesc;
      }

      if (organizerData.website && organizerData.website.trim()) {
        dataToSend.website = organizerData.website;
      }

      // Filter out empty social links
      const socialLinks: any = {};
      Object.entries(organizerData.socialLinks).forEach(([key, value]) => {
        if (value && value.trim()) {
          socialLinks[key] = value;
        }
      });

      // Only include socialLinks if at least one link is provided
      if (Object.keys(socialLinks).length > 0) {
        dataToSend.socialLinks = socialLinks;
      }

      await userApi.updateOrganizerProfile(dataToSend);
      await refreshUser();
      toast({
        title: "Organization updated",
        description: "Your organization profile has been updated.",
      });
    } catch (error: any) {
      if (error.errors && Array.isArray(error.errors)) {
        setOrganizerErrors(mapApiErrorsToFields(error.errors));
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update organization",
          variant: "destructive",
        });
      }
    } finally {
      setOrganizerLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteErrors({});

    const result = deleteAccountSchema.safeParse({
      password: deletePassword,
      confirmation: deleteConfirmation,
    });

    if (!result.success) {
      const errors = zodErrorsToRecord(result.error);
      setDeleteErrors(errors);
      return;
    }

    setDeleteLoading(true);

    try {
      await userApi.deleteAccount({ password: deletePassword });
      toast({
        title: "Account deleted",
        description: "Your account has been deleted.",
      });
      await logout();
    } catch (error: any) {
      if (error.errors && Array.isArray(error.errors)) {
        setDeleteErrors(mapApiErrorsToFields(error.errors));
      } else if (error.message?.includes("password")) {
        setDeleteErrors({ password: "Incorrect password" });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to delete account",
          variant: "destructive",
        });
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const isOrganizer = user && ["ORGANIZER", "ADMIN", "SUPER_ADMIN"].includes(user.role);

  const clearProfileError = (field: string) => {
    if (profileErrors[field]) {
      const newErrors = { ...profileErrors };
      delete newErrors[field];
      setProfileErrors(newErrors);
    }
  };

  const clearPasswordError = (field: string) => {
    if (passwordErrors[field]) {
      const newErrors = { ...passwordErrors };
      delete newErrors[field];
      setPasswordErrors(newErrors);
    }
  };

  const clearOrganizerError = (field: string) => {
    if (organizerErrors[field]) {
      const newErrors = { ...organizerErrors };
      delete newErrors[field];
      setOrganizerErrors(newErrors);
    }
  };

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="bg-secondary/50">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        {isOrganizer && <TabsTrigger value="organization">Organization</TabsTrigger>}
        <TabsTrigger value="danger">Danger Zone</TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile">
        <Card className="bg-secondary/30 border-foreground/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/20">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Profile Information</h3>
              <p className="text-sm text-muted-foreground">Update your personal details</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="avatar"
                  type="url"
                  value={profileData.avatar}
                  onChange={(e) => {
                    setProfileData({ ...profileData, avatar: e.target.value });
                    clearProfileError("avatar");
                  }}
                  placeholder="https://example.com/avatar.jpg"
                  className={cn("pl-10", profileErrors.avatar && "border-destructive")}
                />
              </div>
              {profileErrors.avatar && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {profileErrors.avatar}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Enter a valid image URL</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => {
                    setProfileData({ ...profileData, firstName: e.target.value });
                    clearProfileError("firstName");
                  }}
                  placeholder="John"
                  className={cn(profileErrors.firstName && "border-destructive")}
                />
                {profileErrors.firstName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {profileErrors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => {
                    setProfileData({ ...profileData, lastName: e.target.value });
                    clearProfileError("lastName");
                  }}
                  placeholder="Doe"
                  className={cn(profileErrors.lastName && "border-destructive")}
                />
                {profileErrors.lastName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {profileErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => {
                  setProfileData({ ...profileData, phone: e.target.value });
                  clearProfileError("phone");
                }}
                placeholder="+1 (555) 000-0000"
                className={cn(profileErrors.phone && "border-destructive")}
              />
              {profileErrors.phone && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {profileErrors.phone}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Must be 10-20 characters</p>
            </div>

            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </Card>
      </TabsContent>

      {/* Security Tab */}
      <TabsContent value="security">
        <Card className="bg-secondary/30 border-foreground/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/20">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Change Password</h3>
              <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, currentPassword: e.target.value });
                  clearPasswordError("currentPassword");
                }}
                className={cn(passwordErrors.currentPassword && "border-destructive")}
                required
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, newPassword: e.target.value });
                  clearPasswordError("newPassword");
                }}
                className={cn(passwordErrors.newPassword && "border-destructive")}
                required
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {passwordErrors.newPassword}
                </p>
              )}
              {passwordData.newPassword && (
                <div className="text-xs text-muted-foreground space-y-1 mt-2">
                  <p className="flex items-center gap-1">
                    {passwordData.newPassword.length >= 8 ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <span className="h-3 w-3 rounded-full border border-muted-foreground inline-block" />
                    )}
                    At least 8 characters
                  </p>
                  <p className="flex items-center gap-1">
                    {/[A-Z]/.test(passwordData.newPassword) && /[a-z]/.test(passwordData.newPassword) ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <span className="h-3 w-3 rounded-full border border-muted-foreground inline-block" />
                    )}
                    Uppercase and lowercase letters
                  </p>
                  <p className="flex items-center gap-1">
                    {/\d/.test(passwordData.newPassword) ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <span className="h-3 w-3 rounded-full border border-muted-foreground inline-block" />
                    )}
                    At least one number
                  </p>
                  <p className="flex items-center gap-1">
                    {/[@$!%*?&]/.test(passwordData.newPassword) ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <span className="h-3 w-3 rounded-full border border-muted-foreground inline-block" />
                    )}
                    Special character (@$!%*?&)
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                  clearPasswordError("confirmPassword");
                }}
                className={cn(passwordErrors.confirmPassword && "border-destructive")}
                required
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            <Button type="submit" disabled={passwordLoading || passwordStrength < 5}>
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </Card>
      </TabsContent>

      {/* Organization Tab (Organizers Only) */}
      {isOrganizer && (
        <TabsContent value="organization">
          <Card className="bg-secondary/30 border-foreground/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/20">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Organization Profile</h3>
                <p className="text-sm text-muted-foreground">Manage your public organizer profile</p>
              </div>
            </div>

            <form onSubmit={handleOrganizerSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  value={organizerData.organizationName}
                  onChange={(e) => {
                    setOrganizerData({ ...organizerData, organizationName: e.target.value });
                    clearOrganizerError("organizationName");
                  }}
                  placeholder="Your Company Name"
                  className={cn(organizerErrors.organizationName && "border-destructive")}
                />
                {organizerErrors.organizationName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {organizerErrors.organizationName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationDesc">Description</Label>
                <Textarea
                  id="organizationDesc"
                  value={organizerData.organizationDesc}
                  onChange={(e) => {
                    setOrganizerData({ ...organizerData, organizationDesc: e.target.value });
                    clearOrganizerError("organizationDesc");
                  }}
                  placeholder="Tell people about your organization..."
                  rows={4}
                  className={cn(organizerErrors.organizationDesc && "border-destructive")}
                />
                {organizerErrors.organizationDesc && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {organizerErrors.organizationDesc}
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
                    value={organizerData.website}
                    onChange={(e) => {
                      setOrganizerData({ ...organizerData, website: e.target.value });
                      clearOrganizerError("website");
                    }}
                    placeholder="https://yourwebsite.com"
                    className={cn("pl-10", organizerErrors.website && "border-destructive")}
                  />
                </div>
                {organizerErrors.website && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {organizerErrors.website}
                  </p>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-foreground/10">
                <Label className="text-base">Social Media Links</Label>
                <p className="text-sm text-muted-foreground -mt-2">Connect your social media profiles</p>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      type="url"
                      value={organizerData.socialLinks.facebook}
                      onChange={(e) => {
                        setOrganizerData({
                          ...organizerData,
                          socialLinks: { ...organizerData.socialLinks, facebook: e.target.value },
                        });
                        clearOrganizerError("socialLinks.facebook");
                      }}
                      placeholder="https://facebook.com/yourpage"
                      className={cn(organizerErrors["socialLinks.facebook"] && "border-destructive")}
                    />
                    {organizerErrors["socialLinks.facebook"] && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {organizerErrors["socialLinks.facebook"]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      type="url"
                      value={organizerData.socialLinks.twitter}
                      onChange={(e) => {
                        setOrganizerData({
                          ...organizerData,
                          socialLinks: { ...organizerData.socialLinks, twitter: e.target.value },
                        });
                        clearOrganizerError("socialLinks.twitter");
                      }}
                      placeholder="https://twitter.com/yourhandle"
                      className={cn(organizerErrors["socialLinks.twitter"] && "border-destructive")}
                    />
                    {organizerErrors["socialLinks.twitter"] && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {organizerErrors["socialLinks.twitter"]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      type="url"
                      value={organizerData.socialLinks.instagram}
                      onChange={(e) => {
                        setOrganizerData({
                          ...organizerData,
                          socialLinks: { ...organizerData.socialLinks, instagram: e.target.value },
                        });
                        clearOrganizerError("socialLinks.instagram");
                      }}
                      placeholder="https://instagram.com/yourhandle"
                      className={cn(organizerErrors["socialLinks.instagram"] && "border-destructive")}
                    />
                    {organizerErrors["socialLinks.instagram"] && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {organizerErrors["socialLinks.instagram"]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      value={organizerData.socialLinks.linkedin}
                      onChange={(e) => {
                        setOrganizerData({
                          ...organizerData,
                          socialLinks: { ...organizerData.socialLinks, linkedin: e.target.value },
                        });
                        clearOrganizerError("socialLinks.linkedin");
                      }}
                      placeholder="https://linkedin.com/company/yourcompany"
                      className={cn(organizerErrors["socialLinks.linkedin"] && "border-destructive")}
                    />
                    {organizerErrors["socialLinks.linkedin"] && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {organizerErrors["socialLinks.linkedin"]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      type="url"
                      value={organizerData.socialLinks.youtube}
                      onChange={(e) => {
                        setOrganizerData({
                          ...organizerData,
                          socialLinks: { ...organizerData.socialLinks, youtube: e.target.value },
                        });
                        clearOrganizerError("socialLinks.youtube");
                      }}
                      placeholder="https://youtube.com/@yourchannel"
                      className={cn(organizerErrors["socialLinks.youtube"] && "border-destructive")}
                    />
                    {organizerErrors["socialLinks.youtube"] && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {organizerErrors["socialLinks.youtube"]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={organizerLoading}>
                {organizerLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Organization"
                )}
              </Button>
            </form>
          </Card>
        </TabsContent>
      )}

      {/* Danger Zone Tab */}
      <TabsContent value="danger">
        <Card className="bg-destructive/5 border-destructive/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-destructive/20">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Delete Account</h3>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. All your data, tickets, and event history will be
            permanently removed.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove all your data from
                  our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="deletePassword">Enter your password</Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Your password"
                    className={cn(deleteErrors.password && "border-destructive")}
                  />
                  {deleteErrors.password && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {deleteErrors.password}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirmation">
                    Type <span className="font-mono text-destructive">DELETE MY ACCOUNT</span> to confirm
                  </Label>
                  <Input
                    id="deleteConfirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className={cn(deleteErrors.confirmation && "border-destructive")}
                  />
                  {deleteErrors.confirmation && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {deleteErrors.confirmation}
                    </p>
                  )}
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmation !== "DELETE MY ACCOUNT"}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleteLoading ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
