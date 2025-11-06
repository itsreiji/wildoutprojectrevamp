import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Globe, Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { useContent } from '../../contexts/ContentContext';
import { toast } from 'sonner';

export const DashboardSettings = React.memo(() => {
  const { settings, updateSettings } = useContent();
  const [formData, setFormData] = useState(settings);

  const handleSave = () => {
    updateSettings(formData);
    toast.success('Settings saved successfully!');
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
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white shadow-lg shadow-[#E93370]/20"
            >
              <Save className="mr-2 h-4 w-4" />
              Save All Settings
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
    </div>
  );
});

DashboardSettings.displayName = 'DashboardSettings';
