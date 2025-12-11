import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Globe, Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube, Users, Shield, UserCheck, UserX } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useStaticContent } from '../../contexts/StaticContentContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseClient } from '../../supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  role: 'admin' | 'editor' | 'user';
  created_at: string;
}

export const DashboardSettings = React.memo(() => {
  const { settings, saveSiteSettings } = useStaticContent();
  const { role: currentUserRole } = useAuth();
  const [formData, setFormData] = useState({
    ...settings,
    siteName: settings.site_name || '',
    siteDescription: settings.site_description || '',
    socialMedia: settings.social_media || {}
  });
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Fetch users for role management
  useEffect(() => {
    const fetchUsers = async () => {
      if (currentUserRole !== 'admin') return;

      setUsersLoading(true);
      try {
        // Fetch profiles
        const { data: profilesData, error: profilesError } = await supabaseClient
          .from('profiles')
          .select('id, username, full_name, role, created_at')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          toast.error('Failed to load users');
          return;
        }

        // Try to get emails via RPC if available, otherwise use profiles only
        let usersWithEmail: UserProfile[] = [];

        try {
          const { data: rpcData, error: rpcError } = await supabaseClient
            .rpc('get_users_with_emails');

          if (!rpcError && rpcData) {
            usersWithEmail = rpcData.map((user: any) => ({
              id: user.id,
              email: user.email || null,
              username: user.username,
              full_name: user.full_name,
              role: user.role || 'user',
              created_at: user.created_at,
            }));
          } else {
            // Fallback: use profiles without email
            usersWithEmail = (profilesData || []).map((profile: any) => ({
              id: profile.id,
              email: null,
              username: profile.username,
              full_name: profile.full_name,
              role: profile.role || 'user',
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
            role: profile.role || 'user',
            created_at: profile.created_at,
          }));
        }

        setUsers(usersWithEmail);
      } catch (err) {
        console.error('Error in fetchUsers:', err);
        toast.error('Failed to load users');
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
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'editor' | 'user') => {
    setUpdatingUserId(userId);
    try {
      const { error } = await supabaseClient
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div id="admin-settings-container" className="space-y-6">
      {/* Header */}
      <div id="admin-settings-header">
        <h2 id="admin-settings-title" className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
          Settings
        </h2>
        <p id="admin-settings-subtitle" className="text-white/60">Manage your site configuration - changes sync to landing page instantly</p>
      </div>

      {/* Site Settings */}
      <motion.div
        id="admin-settings-site-settings"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card id="admin-settings-site-card" className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader id="admin-settings-site-card-header">
            <CardTitle id="admin-settings-site-card-title" className="flex items-center space-x-2">
              <Globe id="admin-settings-site-icon" className="h-5 w-5 text-[#E93370]" />
              <span id="admin-settings-site-section-label">Site Information</span>
            </CardTitle>
            <CardDescription id="admin-settings-site-card-description" className="text-white/60">
              Update your site's basic information
            </CardDescription>
          </CardHeader>
          <CardContent id="admin-settings-site-card-content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-settings-site-name-input">Site Name</Label>
              <Input
                id="admin-settings-site-name-input"
                value={formData.siteName}
                onChange={(e) =>
                  setFormData({ ...formData, siteName: e.target.value, site_name: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-settings-site-description-input">Site Description</Label>
              <Input
                id="admin-settings-site-description-input"
                value={formData.siteDescription}
                onChange={(e) =>
                  setFormData({ ...formData, siteDescription: e.target.value, site_description: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-settings-tagline-textarea">Tagline</Label>
              <Textarea
                id="admin-settings-tagline-textarea"
                value={formData.tagline || ''}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white min-h-[80px]"
              />
            </div>

            <Button
              id="admin-settings-save-button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white shadow-lg shadow-[#E93370]/20 disabled:opacity-50"
            >
              <Save id="admin-settings-save-icon" className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Settings */}
      <motion.div
        id="admin-settings-contact-settings"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card id="admin-settings-contact-card" className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader id="admin-settings-contact-card-header">
            <CardTitle id="admin-settings-contact-card-title" className="flex items-center space-x-2">
              <Mail id="admin-settings-contact-icon" className="h-5 w-5 text-[#E93370]" />
              <span id="admin-settings-contact-section-label">Contact Information</span>
            </CardTitle>
            <CardDescription id="admin-settings-contact-card-description" className="text-white/60">
              Manage your contact details
            </CardDescription>
          </CardHeader>
          <CardContent id="admin-settings-contact-card-content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-settings-email-input" className="flex items-center space-x-2">
                <Mail id="admin-settings-email-icon" className="h-4 w-4 text-[#E93370]" />
                <span id="admin-settings-email-label">Email Address</span>
              </Label>
              <Input
                id="admin-settings-email-input"
                type="email"
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-settings-phone-input" className="flex items-center space-x-2">
                <Phone id="admin-settings-phone-icon" className="h-4 w-4 text-[#E93370]" />
                <span id="admin-settings-phone-label">Phone Number</span>
              </Label>
              <Input
                id="admin-settings-phone-input"
                value={formData.phone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-settings-address-input" className="flex items-center space-x-2">
                <MapPin id="admin-settings-address-icon" className="h-4 w-4 text-[#E93370]" />
                <span id="admin-settings-address-label">Address</span>
              </Label>
              <Input
                id="admin-settings-address-input"
                value={formData.address || ''}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Social Media Settings */}
      <motion.div
        id="admin-settings-social-settings"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card id="admin-settings-social-card" className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader id="admin-settings-social-card-header">
            <CardTitle id="admin-settings-social-card-title" className="flex items-center space-x-2">
              <Instagram id="admin-settings-social-icon" className="h-5 w-5 text-[#E93370]" />
              <span id="admin-settings-social-section-label">Social Media Links</span>
            </CardTitle>
            <CardDescription id="admin-settings-social-card-description" className="text-white/60">
              Update your social media profiles
            </CardDescription>
          </CardHeader>
          <CardContent id="admin-settings-social-card-content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-settings-instagram-input" className="flex items-center space-x-2">
                <Instagram id="admin-settings-instagram-icon" className="h-4 w-4 text-[#E93370]" />
                <span id="admin-settings-instagram-label">Instagram</span>
              </Label>
              <Input
                id="admin-settings-instagram-input"
                value={typeof formData.socialMedia === 'object' && formData.socialMedia !== null && !Array.isArray(formData.socialMedia) && 'instagram' in formData.socialMedia ? String(formData.socialMedia.instagram) : ''}
                onChange={(e) => {
                  const currentSocialMedia = typeof formData.socialMedia === 'object' && formData.socialMedia !== null && !Array.isArray(formData.socialMedia) ? formData.socialMedia : {};
                  const currentSocialMediaDb = typeof formData.social_media === 'object' && formData.social_media !== null && !Array.isArray(formData.social_media) ? formData.social_media : {};
                  setFormData({ ...formData, socialMedia: { ...currentSocialMedia, instagram: e.target.value }, social_media: { ...currentSocialMediaDb, instagram: e.target.value } });
                }}
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://instagram.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-settings-twitter-input" className="flex items-center space-x-2">
                <Twitter id="admin-settings-twitter-icon" className="h-4 w-4 text-[#E93370]" />
                <span id="admin-settings-twitter-label">Twitter</span>
              </Label>
              <Input
                id="admin-settings-twitter-input"
                value={typeof formData.socialMedia === 'object' && formData.socialMedia !== null && !Array.isArray(formData.socialMedia) && 'twitter' in formData.socialMedia ? String(formData.socialMedia.twitter) : ''}
                onChange={(e) => {
                  const currentSocialMedia = typeof formData.socialMedia === 'object' && formData.socialMedia !== null && !Array.isArray(formData.socialMedia) ? formData.socialMedia : {};
                  const currentSocialMediaDb = typeof formData.social_media === 'object' && formData.social_media !== null && !Array.isArray(formData.social_media) ? formData.social_media : {};
                  setFormData({ ...formData, socialMedia: { ...currentSocialMedia, twitter: e.target.value }, social_media: { ...currentSocialMediaDb, twitter: e.target.value } });
                }}
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://twitter.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-settings-facebook-input" className="flex items-center space-x-2">
                <Facebook id="admin-settings-facebook-icon" className="h-4 w-4 text-[#E93370]" />
                <span id="admin-settings-facebook-label">Facebook</span>
              </Label>
              <Input
                id="admin-settings-facebook-input"
                value={typeof formData.socialMedia === 'object' && formData.socialMedia !== null && !Array.isArray(formData.socialMedia) && 'facebook' in formData.socialMedia ? String(formData.socialMedia.facebook) : ''}
                onChange={(e) => {
                  const currentSocialMedia = typeof formData.socialMedia === 'object' && formData.socialMedia !== null && !Array.isArray(formData.socialMedia) ? formData.socialMedia : {};
                  const currentSocialMediaDb = typeof formData.social_media === 'object' && formData.social_media !== null && !Array.isArray(formData.social_media) ? formData.social_media : {};
                  setFormData({ ...formData, socialMedia: { ...currentSocialMedia, facebook: e.target.value }, social_media: { ...currentSocialMediaDb, facebook: e.target.value } });
                }}
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://facebook.com/page"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-settings-youtube-input" className="flex items-center space-x-2">
                <Youtube id="admin-settings-youtube-icon" className="h-4 w-4 text-[#E93370]" />
                <span id="admin-settings-youtube-label">YouTube</span>
              </Label>
              <Input
                id="admin-settings-youtube-input"
                value={typeof formData.socialMedia === 'object' && formData.socialMedia !== null && !Array.isArray(formData.socialMedia) && 'youtube' in formData.socialMedia ? String(formData.socialMedia.youtube) : ''}
                onChange={(e) => {
                  const currentSocialMedia = typeof formData.socialMedia === 'object' && formData.socialMedia !== null && !Array.isArray(formData.socialMedia) ? formData.socialMedia : {};
                  const currentSocialMediaDb = typeof formData.social_media === 'object' && formData.social_media !== null && !Array.isArray(formData.social_media) ? formData.social_media : {};
                  setFormData({ ...formData, socialMedia: { ...currentSocialMedia, youtube: e.target.value }, social_media: { ...currentSocialMediaDb, youtube: e.target.value } });
                }}
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://youtube.com/@channel"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Brand Colors */}
      <motion.div
        id="admin-settings-brand-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card id="admin-settings-brand-colors-card" className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader id="admin-settings-brand-colors-card-header">
            <CardTitle id="admin-settings-brand-colors-title">Brand Colors</CardTitle>
            <CardDescription id="admin-settings-brand-colors-description" className="text-white/60">
              Your brand color scheme
            </CardDescription>
          </CardHeader>
          <CardContent id="admin-settings-brand-colors-card-content">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label id="admin-settings-primary-color-label">Primary Color</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <div id="admin-settings-primary-color-swatch" className="w-12 h-12 rounded-xl bg-[#E93370] border-2 border-white/10" />
                  <div>
                    <div id="admin-settings-primary-color-value" className="text-white">#E93370</div>
                    <div id="admin-settings-primary-color-name" className="text-sm text-white/60">WildOut Pink</div>
                  </div>
                </div>
              </div>
              <Separator id="admin-settings-brand-colors-separator" orientation="vertical" className="h-16" />
              <div className="flex-1">
                <Label id="admin-settings-background-color-label">Background</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <div id="admin-settings-background-color-swatch" className="w-12 h-12 rounded-xl bg-[#0a0a0a] border-2 border-white/10" />
                  <div>
                    <div id="admin-settings-background-color-value" className="text-white">#0a0a0a</div>
                    <div id="admin-settings-background-color-name" className="text-sm text-white/60">Dark Background</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Management */}
      {currentUserRole === 'admin' && (
        <motion.div
          id="admin-settings-users"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card id="admin-settings-users-card" className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader id="admin-settings-users-card-header">
              <CardTitle id="admin-settings-users-card-title" className="flex items-center space-x-2">
                <Users id="admin-settings-users-icon" className="h-5 w-5 text-[#E93370]" />
                <span id="admin-settings-users-section-label">User Management</span>
              </CardTitle>
              <CardDescription id="admin-settings-users-card-description" className="text-white/60">
                Manage user roles and permissions for your platform
              </CardDescription>
            </CardHeader>
            <CardContent id="admin-settings-users-card-content" className="space-y-4">
              {usersLoading ? (
                <div id="admin-settings-users-loading" className="text-center py-8 text-white/60">Loading users...</div>
              ) : users.length === 0 ? (
                <div id="admin-settings-users-empty" className="text-sm text-white/60 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p id="admin-settings-users-empty-text">No users found.</p>
                </div>
              ) : (
                <div id="admin-settings-users-list" className="space-y-3">
                  {users.map((user) => (
                    <div
                      id={`admin-settings-user-${user.id}`}
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          {user.role === 'admin' ? (
                            <Shield id={`admin-settings-user-${user.id}-admin-icon`} className="h-5 w-5 text-[#E93370]" />
                          ) : user.role === 'editor' ? (
                            <UserCheck id={`admin-settings-user-${user.id}-editor-icon`} className="h-5 w-5 text-blue-400" />
                          ) : (
                            <UserX id={`admin-settings-user-${user.id}-user-icon`} className="h-5 w-5 text-white/40" />
                          )}
                          <div>
                            <div id={`admin-settings-user-${user.id}-name`} className="font-medium text-white">
                              {user.full_name || user.username || 'Unknown User'}
                            </div>
                            <div id={`admin-settings-user-${user.id}-email`} className="text-sm text-white/60">{user.email || 'No email'}</div>
                            <div id={`admin-settings-user-${user.id}-joined`} className="text-xs text-white/40 mt-1">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Select
                          value={user.role}
                          onValueChange={(value: 'admin' | 'editor' | 'user') =>
                            handleRoleUpdate(user.id, value)
                          }
                          disabled={updatingUserId === user.id}
                        >
                          <SelectTrigger id={`admin-settings-user-${user.id}-role-select`} className="w-32 bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem id={`admin-settings-user-${user.id}-role-select-user`} value="user">User</SelectItem>
                            <SelectItem id={`admin-settings-user-${user.id}-role-select-editor`} value="editor">Editor</SelectItem>
                            <SelectItem id={`admin-settings-user-${user.id}-role-select-admin`} value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {updatingUserId === user.id && (
                          <div id={`admin-settings-user-${user.id}-updating`} className="text-xs text-white/60">Updating...</div>
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

DashboardSettings.displayName = 'DashboardSettings';
