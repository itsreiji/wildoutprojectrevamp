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
  const [formData, setFormData] = useState(settings);
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
          Settings
        </h2>
        <p className="text-white/60">Manage your site configuration - changes sync to landing page instantly</p>
      </div>

      {/* Site Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-[#E93370]" />
              <span>Site Information</span>
            </CardTitle>
            <CardDescription className="text-white/60">
              Update your site's basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={formData.siteName}
                onChange={(e) =>
                  setFormData({ ...formData, siteName: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={formData.siteDescription}
                onChange={(e) =>
                  setFormData({ ...formData, siteDescription: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea
                id="tagline"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white min-h-[80px]"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white shadow-lg shadow-[#E93370]/20 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-[#E93370]" />
              <span>Contact Information</span>
            </CardTitle>
            <CardDescription className="text-white/60">
              Manage your contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-[#E93370]" />
                <span>Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-[#E93370]" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-[#E93370]" />
                <span>Address</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Instagram className="h-5 w-5 text-[#E93370]" />
              <span>Social Media Links</span>
            </CardTitle>
            <CardDescription className="text-white/60">
              Update your social media profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center space-x-2">
                <Instagram className="h-4 w-4 text-[#E93370]" />
                <span>Instagram</span>
              </Label>
              <Input
                id="instagram"
                value={formData.socialMedia.instagram}
                onChange={(e) =>
                  setFormData({ ...formData, socialMedia: { ...formData.socialMedia, instagram: e.target.value } })
                }
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://instagram.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center space-x-2">
                <Twitter className="h-4 w-4 text-[#E93370]" />
                <span>Twitter</span>
              </Label>
              <Input
                id="twitter"
                value={formData.socialMedia.twitter}
                onChange={(e) =>
                  setFormData({ ...formData, socialMedia: { ...formData.socialMedia, twitter: e.target.value } })
                }
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://twitter.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook" className="flex items-center space-x-2">
                <Facebook className="h-4 w-4 text-[#E93370]" />
                <span>Facebook</span>
              </Label>
              <Input
                id="facebook"
                value={formData.socialMedia.facebook}
                onChange={(e) =>
                  setFormData({ ...formData, socialMedia: { ...formData.socialMedia, facebook: e.target.value } })
                }
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://facebook.com/page"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube" className="flex items-center space-x-2">
                <Youtube className="h-4 w-4 text-[#E93370]" />
                <span>YouTube</span>
              </Label>
              <Input
                id="youtube"
                value={formData.socialMedia.youtube}
                onChange={(e) =>
                  setFormData({ ...formData, socialMedia: { ...formData.socialMedia, youtube: e.target.value } })
                }
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://youtube.com/@channel"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Brand Colors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <CardDescription className="text-white/60">
              Your brand color scheme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label>Primary Color</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="w-12 h-12 rounded-xl bg-[#E93370] border-2 border-white/10" />
                  <div>
                    <div className="text-white">#E93370</div>
                    <div className="text-sm text-white/60">WildOut Pink</div>
                  </div>
                </div>
              </div>
              <Separator orientation="vertical" className="h-16" />
              <div className="flex-1">
                <Label>Background</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] border-2 border-white/10" />
                  <div>
                    <div className="text-white">#0a0a0a</div>
                    <div className="text-sm text-white/60">Dark Background</div>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-[#E93370]" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription className="text-white/60">
                Manage user roles and permissions for your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {usersLoading ? (
                <div className="text-center py-8 text-white/60">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-sm text-white/60 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p>No users found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          {user.role === 'admin' ? (
                            <Shield className="h-5 w-5 text-[#E93370]" />
                          ) : user.role === 'editor' ? (
                            <UserCheck className="h-5 w-5 text-blue-400" />
                          ) : (
                            <UserX className="h-5 w-5 text-white/40" />
                          )}
                          <div>
                            <div className="font-medium text-white">
                              {user.full_name || user.username || 'Unknown User'}
                            </div>
                            <div className="text-sm text-white/60">{user.email || 'No email'}</div>
                            <div className="text-xs text-white/40 mt-1">
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
                          <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {updatingUserId === user.id && (
                          <div className="text-xs text-white/60">Updating...</div>
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
