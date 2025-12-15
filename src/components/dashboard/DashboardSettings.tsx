import {
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Twitter,
  UserCheck,
  Users,
  UserX,
  Youtube,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { useStaticContent } from "../../contexts/StaticContentContext";
import { supabaseClient } from "../../supabase/client";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  role: "admin" | "editor" | "user";
  created_at: string;
}

export const DashboardSettings = React.memo(() => {
  const { settings, saveSiteSettings } = useStaticContent();
  const { role: currentUserRole } = useAuth();
  const [formData, setFormData] = useState({
    ...settings,
    siteName: settings.site_name || "",
    siteDescription: settings.site_description || "",
    socialMedia: settings.social_media || {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Fetch users for role management
  useEffect(() => {
    const fetchUsers = async () => {
      if (currentUserRole !== "admin") return;

      setUsersLoading(true);
      try {
        // Fetch profiles
        const { data: profilesData, error: profilesError } =
          await supabaseClient
            .from("profiles")
            .select("id, username, full_name, role, created_at")
            .order("created_at", { ascending: false });

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          toast.error("Failed to load users");
          return;
        }

        // Try to get emails via RPC if available, otherwise use profiles only
        let usersWithEmail: UserProfile[] = [];

        try {
          const { data: rpcData, error: rpcError } = await supabaseClient.rpc(
            "get_user_profile"
          ); // Changed from 'get_users_with_emails' to 'get_user_profile'

          if (!rpcError && rpcData) {
            usersWithEmail = rpcData.map((user: any) => ({
              id: user.id,
              email: user.email || null,
              username: user.username,
              full_name: user.full_name,
              role: user.role || "user",
              created_at: user.created_at,
            }));
          } else {
            // Fallback: use profiles without email
            usersWithEmail = (profilesData || []).map((profile: any) => ({
              id: profile.id,
              email: null,
              username: profile.username,
              full_name: profile.full_name,
              role: profile.role || "user",
              created_at: profile.created_at,
            }));
          }
        } catch (rpcErr) {
          // RPC function doesn't exist yet, use profiles only
          usersWithEmail = (profilesData || []).map((profile: any) => ({
            id: profile.id,
            email: null,
            username: profile.username,
            full_name: profile.full_name,
            role: profile.role || "user",
            created_at: profile.created_at,
          }));
        }

        setUsers(usersWithEmail);
      } catch (err) {
        console.error("Error in fetchUsers:", err);
        toast.error("Failed to load users");
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [currentUserRole]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSiteSettings(formData);
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleUpdate = async (
    userId: string,
    newRole: "admin" | "editor" | "user"
  ) => {
    setUpdatingUserId(userId);
    try {
      const { error } = await supabaseClient
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success("User role updated successfully!");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-6" id="admin-settings-container">
      {/* Header */}
      <div id="admin-settings-header">
        <h2
          className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent"
          id="admin-settings-title"
        >
          Settings
        </h2>
        <p className="text-white/60" id="admin-settings-subtitle">
          Manage your site configuration - changes sync to landing page
          instantly
        </p>
      </div>

      {/* Site Settings */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        id="admin-settings-site-settings"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className="bg-white/5 backdrop-blur-xl border-white/10"
          id="admin-settings-site-card"
        >
          <CardHeader id="admin-settings-site-card-header">
            <CardTitle
              className="flex items-center space-x-2"
              id="admin-settings-site-card-title"
            >
              <Globe
                className="h-5 w-5 text-[#E93370]"
                id="admin-settings-site-icon"
              />
              <span id="admin-settings-site-section-label">
                Site Information
              </span>
            </CardTitle>
            <CardDescription
              className="text-white/60"
              id="admin-settings-site-card-description"
            >
              Update your site's basic information
            </CardDescription>
          </CardHeader>
          <CardContent
            className="space-y-4"
            id="admin-settings-site-card-content"
          >
            <div className="space-y-2">
              <Label htmlFor="admin-settings-site-name-input">Site Name</Label>
              <Input
                className="bg-white/5 border-white/10 text-white"
                id="admin-settings-site-name-input"
                value={formData.siteName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    siteName: e.target.value,
                    site_name: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-settings-site-description-input">
                Site Description
              </Label>
              <Input
                className="bg-white/5 border-white/10 text-white"
                id="admin-settings-site-description-input"
                value={formData.siteDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    siteDescription: e.target.value,
                    site_description: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-settings-tagline-textarea">Tagline</Label>
              <Textarea
                className="bg-white/5 border-white/10 text-white min-h-[80px]"
                id="admin-settings-tagline-textarea"
                value={formData.tagline || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
              />
            </div>

            <Button
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white shadow-lg shadow-[#E93370]/20 disabled:opacity-50"
              disabled={isSaving}
              id="admin-settings-save-button"
              onClick={handleSave}
            >
              <Save className="mr-2 h-4 w-4" id="admin-settings-save-icon" />
              {isSaving ? "Saving..." : "Save All Settings"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Settings */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        id="admin-settings-contact-settings"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card
          className="bg-white/5 backdrop-blur-xl border-white/10"
          id="admin-settings-contact-card"
        >
          <CardHeader id="admin-settings-contact-card-header">
            <CardTitle
              className="flex items-center space-x-2"
              id="admin-settings-contact-card-title"
            >
              <Mail
                className="h-5 w-5 text-[#E93370]"
                id="admin-settings-contact-icon"
              />
              <span id="admin-settings-contact-section-label">
                Contact Information
              </span>
            </CardTitle>
            <CardDescription
              className="text-white/60"
              id="admin-settings-contact-card-description"
            >
              Manage your contact details
            </CardDescription>
          </CardHeader>
          <CardContent
            className="space-y-4"
            id="admin-settings-contact-card-content"
          >
            <div className="space-y-2">
              <Label
                className="flex items-center space-x-2"
                htmlFor="admin-settings-email-input"
              >
                <Mail
                  className="h-4 w-4 text-[#E93370]"
                  id="admin-settings-email-icon"
                />
                <span id="admin-settings-email-label">Email Address</span>
              </Label>
              <Input
                className="bg-white/5 border-white/10 text-white"
                id="admin-settings-email-input"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                className="flex items-center space-x-2"
                htmlFor="admin-settings-phone-input"
              >
                <Phone
                  className="h-4 w-4 text-[#E93370]"
                  id="admin-settings-phone-icon"
                />
                <span id="admin-settings-phone-label">Phone Number</span>
              </Label>
              <Input
                className="bg-white/5 border-white/10 text-white"
                id="admin-settings-phone-input"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                className="flex items-center space-x-2"
                htmlFor="admin-settings-address-input"
              >
                <MapPin
                  className="h-4 w-4 text-[#E93370]"
                  id="admin-settings-address-icon"
                />
                <span id="admin-settings-address-label">Address</span>
              </Label>
              <Input
                className="bg-white/5 border-white/10 text-white"
                id="admin-settings-address-input"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Social Media Settings */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        id="admin-settings-social-settings"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card
          className="bg-white/5 backdrop-blur-xl border-white/10"
          id="admin-settings-social-card"
        >
          <CardHeader id="admin-settings-social-card-header">
            <CardTitle
              className="flex items-center space-x-2"
              id="admin-settings-social-card-title"
            >
              <Instagram
                className="h-5 w-5 text-[#E93370]"
                id="admin-settings-social-icon"
              />
              <span id="admin-settings-social-section-label">
                Social Media Links
              </span>
            </CardTitle>
            <CardDescription
              className="text-white/60"
              id="admin-settings-social-card-description"
            >
              Update your social media profiles
            </CardDescription>
          </CardHeader>
          <CardContent
            className="space-y-4"
            id="admin-settings-social-card-content"
          >
            <div className="space-y-2">
              <Label
                className="flex items-center space-x-2"
                htmlFor="admin-settings-instagram-input"
              >
                <Instagram
                  className="h-4 w-4 text-[#E93370]"
                  id="admin-settings-instagram-icon"
                />
                <span id="admin-settings-instagram-label">Instagram</span>
              </Label>
              <Input
                className="bg-white/5 border-white/10 text-white"
                id="admin-settings-instagram-input"
                placeholder="https://instagram.com/username"
                value={
                  typeof formData.socialMedia === "object" &&
                  formData.socialMedia !== null &&
                  !Array.isArray(formData.socialMedia) &&
                  "instagram" in formData.socialMedia
                    ? String(formData.socialMedia.instagram)
                    : ""
                }
                onChange={(e) => {
                  const currentSocialMedia =
                    typeof formData.socialMedia === "object" &&
                    formData.socialMedia !== null &&
                    !Array.isArray(formData.socialMedia)
                      ? formData.socialMedia
                      : {};
                  const currentSocialMediaDb =
                    typeof formData.social_media === "object" &&
                    formData.social_media !== null &&
                    !Array.isArray(formData.social_media)
                      ? formData.social_media
                      : {};
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...currentSocialMedia,
                      instagram: e.target.value,
                    },
                    social_media: {
                      ...currentSocialMediaDb,
                      instagram: e.target.value,
                    },
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label
                className="flex items-center space-x-2"
                htmlFor="admin-settings-twitter-input"
              >
                <Twitter
                  className="h-4 w-4 text-[#E93370]"
                  id="admin-settings-twitter-icon"
                />
                <span id="admin-settings-twitter-label">Twitter</span>
              </Label>
              <Input
                className="bg-white/5 border-white/10 text-white"
                id="admin-settings-twitter-input"
                placeholder="https://twitter.com/username"
                value={
                  typeof formData.socialMedia === "object" &&
                  formData.socialMedia !== null &&
                  !Array.isArray(formData.socialMedia) &&
                  "twitter" in formData.socialMedia
                    ? String(formData.socialMedia.twitter)
                    : ""
                }
                onChange={(e) => {
                  const currentSocialMedia =
                    typeof formData.socialMedia === "object" &&
                    formData.socialMedia !== null &&
                    !Array.isArray(formData.socialMedia)
                      ? formData.socialMedia
                      : {};
                  const currentSocialMediaDb =
                    typeof formData.social_media === "object" &&
                    formData.social_media !== null &&
                    !Array.isArray(formData.social_media)
                      ? formData.social_media
                      : {};
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...currentSocialMedia,
                      twitter: e.target.value,
                    },
                    social_media: {
                      ...currentSocialMediaDb,
                      twitter: e.target.value,
                    },
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label
                className="flex items-center space-x-2"
                htmlFor="admin-settings-facebook-input"
              >
                <Facebook
                  className="h-4 w-4 text-[#E93370]"
                  id="admin-settings-facebook-icon"
                />
                <span id="admin-settings-facebook-label">Facebook</span>
              </Label>
              <Input
                className="bg-white/5 border-white/10 text-white"
                id="admin-settings-facebook-input"
                placeholder="https://facebook.com/page"
                value={
                  typeof formData.socialMedia === "object" &&
                  formData.socialMedia !== null &&
                  !Array.isArray(formData.socialMedia) &&
                  "facebook" in formData.socialMedia
                    ? String(formData.socialMedia.facebook)
                    : ""
                }
                onChange={(e) => {
                  const currentSocialMedia =
                    typeof formData.socialMedia === "object" &&
                    formData.socialMedia !== null &&
                    !Array.isArray(formData.socialMedia)
                      ? formData.socialMedia
                      : {};
                  const currentSocialMediaDb =
                    typeof formData.social_media === "object" &&
                    formData.social_media !== null &&
                    !Array.isArray(formData.social_media)
                      ? formData.social_media
                      : {};
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...currentSocialMedia,
                      facebook: e.target.value,
                    },
                    social_media: {
                      ...currentSocialMediaDb,
                      facebook: e.target.value,
                    },
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label
                className="flex items-center space-x-2"
                htmlFor="admin-settings-youtube-input"
              >
                <Youtube
                  className="h-4 w-4 text-[#E93370]"
                  id="admin-settings-youtube-icon"
                />
                <span id="admin-settings-youtube-label">YouTube</span>
              </Label>
              <Input
                className="bg-white/5 border-white/10 text-white"
                id="admin-settings-youtube-input"
                placeholder="https://youtube.com/@channel"
                value={
                  typeof formData.socialMedia === "object" &&
                  formData.socialMedia !== null &&
                  !Array.isArray(formData.socialMedia) &&
                  "youtube" in formData.socialMedia
                    ? String(formData.socialMedia.youtube)
                    : ""
                }
                onChange={(e) => {
                  const currentSocialMedia =
                    typeof formData.socialMedia === "object" &&
                    formData.socialMedia !== null &&
                    !Array.isArray(formData.socialMedia)
                      ? formData.socialMedia
                      : {};
                  const currentSocialMediaDb =
                    typeof formData.social_media === "object" &&
                    formData.social_media !== null &&
                    !Array.isArray(formData.social_media)
                      ? formData.social_media
                      : {};
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...currentSocialMedia,
                      youtube: e.target.value,
                    },
                    social_media: {
                      ...currentSocialMediaDb,
                      youtube: e.target.value,
                    },
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Brand Colors */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        id="admin-settings-brand-colors"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card
          className="bg-white/5 backdrop-blur-xl border-white/10"
          id="admin-settings-brand-colors-card"
        >
          <CardHeader id="admin-settings-brand-colors-card-header">
            <CardTitle id="admin-settings-brand-colors-title">
              Brand Colors
            </CardTitle>
            <CardDescription
              className="text-white/60"
              id="admin-settings-brand-colors-description"
            >
              Your brand color scheme
            </CardDescription>
          </CardHeader>
          <CardContent id="admin-settings-brand-colors-card-content">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label id="admin-settings-primary-color-label">
                  Primary Color
                </Label>
                <div className="flex items-center space-x-3 mt-2">
                  <div
                    className="w-12 h-12 rounded-xl bg-[#E93370] border-2 border-white/10"
                    id="admin-settings-primary-color-swatch"
                  />
                  <div>
                    <div
                      className="text-white"
                      id="admin-settings-primary-color-value"
                    >
                      #E93370
                    </div>
                    <div
                      className="text-sm text-white/60"
                      id="admin-settings-primary-color-name"
                    >
                      WildOut Pink
                    </div>
                  </div>
                </div>
              </div>
              <Separator
                className="h-16"
                id="admin-settings-brand-colors-separator"
                orientation="vertical"
              />
              <div className="flex-1">
                <Label id="admin-settings-background-color-label">
                  Background
                </Label>
                <div className="flex items-center space-x-3 mt-2">
                  <div
                    className="w-12 h-12 rounded-xl bg-[#0a0a0a] border-2 border-white/10"
                    id="admin-settings-background-color-swatch"
                  />
                  <div>
                    <div
                      className="text-white"
                      id="admin-settings-background-color-value"
                    >
                      #0a0a0a
                    </div>
                    <div
                      className="text-sm text-white/60"
                      id="admin-settings-background-color-name"
                    >
                      Dark Background
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Management */}
      {currentUserRole === "admin" && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          id="admin-settings-users"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card
            className="bg-white/5 backdrop-blur-xl border-white/10"
            id="admin-settings-users-card"
          >
            <CardHeader id="admin-settings-users-card-header">
              <CardTitle
                className="flex items-center space-x-2"
                id="admin-settings-users-card-title"
              >
                <Users
                  className="h-5 w-5 text-[#E93370]"
                  id="admin-settings-users-icon"
                />
                <span id="admin-settings-users-section-label">
                  User Management
                </span>
              </CardTitle>
              <CardDescription
                className="text-white/60"
                id="admin-settings-users-card-description"
              >
                Manage user roles and permissions for your platform
              </CardDescription>
            </CardHeader>
            <CardContent
              className="space-y-4"
              id="admin-settings-users-card-content"
            >
              {usersLoading ? (
                <div
                  className="text-center py-8 text-white/60"
                  id="admin-settings-users-loading"
                >
                  Loading users...
                </div>
              ) : users.length === 0 ? (
                <div
                  className="text-sm text-white/60 p-4 bg-white/5 rounded-lg border border-white/10"
                  id="admin-settings-users-empty"
                >
                  <p id="admin-settings-users-empty-text">No users found.</p>
                </div>
              ) : (
                <div className="space-y-3" id="admin-settings-users-list">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      id={`admin-settings-user-${user.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          {user.role === "admin" ? (
                            <Shield
                              className="h-5 w-5 text-[#E93370]"
                              id={`admin-settings-user-${user.id}-admin-icon`}
                            />
                          ) : user.role === "editor" ? (
                            <UserCheck
                              className="h-5 w-5 text-blue-400"
                              id={`admin-settings-user-${user.id}-editor-icon`}
                            />
                          ) : (
                            <UserX
                              className="h-5 w-5 text-white/40"
                              id={`admin-settings-user-${user.id}-user-icon`}
                            />
                          )}
                          <div>
                            <div
                              className="font-medium text-white"
                              id={`admin-settings-user-${user.id}-name`}
                            >
                              {user.full_name ||
                                user.username ||
                                "Unknown User"}
                            </div>
                            <div
                              className="text-sm text-white/60"
                              id={`admin-settings-user-${user.id}-email`}
                            >
                              {user.email || "No email"}
                            </div>
                            <div
                              className="text-xs text-white/40 mt-1"
                              id={`admin-settings-user-${user.id}-joined`}
                            >
                              Joined:{" "}
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Select
                          disabled={updatingUserId === user.id}
                          value={user.role}
                          onValueChange={(value: "admin" | "editor" | "user") =>
                            handleRoleUpdate(user.id, value)
                          }
                        >
                          <SelectTrigger
                            className="w-32 bg-white/5 border-white/10 text-white"
                            id={`admin-settings-user-${user.id}-role-select`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              id={`admin-settings-user-${user.id}-role-select-user`}
                              value="user"
                            >
                              User
                            </SelectItem>
                            <SelectItem
                              id={`admin-settings-user-${user.id}-role-select-editor`}
                              value="editor"
                            >
                              Editor
                            </SelectItem>
                            <SelectItem
                              id={`admin-settings-user-${user.id}-role-select-admin`}
                              value="admin"
                            >
                              Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {updatingUserId === user.id && (
                          <div
                            className="text-xs text-white/60"
                            id={`admin-settings-user-${user.id}-updating`}
                          >
                            Updating...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
});

DashboardSettings.displayName = "DashboardSettings";
