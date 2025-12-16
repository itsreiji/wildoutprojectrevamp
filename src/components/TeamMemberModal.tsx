import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TeamMember } from "@/types/content";
import { useState } from "react";
import { Mail } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface TeamMemberModalProps {
  open: boolean;
  onClose: () => void;
  member?: TeamMember;
  onSubmit: (data: TeamMember) => void;
  isAdminMode?: boolean;
}

const TeamMemberModal = ({
  open,
  onClose,
  member,
  onSubmit,
  isAdminMode = false,
}: TeamMemberModalProps) => {
  const [name, setName] = useState(member?.name || "");
  const [title, setTitle] = useState(member?.title || "");
  const [bio, setBio] = useState(member?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(member?.avatar_url || "");
  const [email, setEmail] = useState(member?.email || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: member?.id || "",
      name,
      title,
      bio,
      avatar_url: avatarUrl,
      email,
      status: member?.status || "active",
      linkedin_url: member?.linkedin_url || null,
      metadata: member?.metadata || null,
      display_order: member?.display_order || null,
      created_at: member?.created_at || null,
      updated_at: member?.updated_at || null,
    });
    onClose();
  };

  if (!member) {
    return null;
  }

  if (isAdminMode) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {member ? "Edit Team Member" : "Add Team Member"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Name *
                </label>
                <Input
                  required
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="title">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="bio">
                Bio
              </label>
              <Textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="avatarUrl">
                  Avatar URL
                </label>
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{member ? "Update" : "Add"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // View-only mode for landing page
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {member.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Avatar */}
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#E93370]/30 mb-4">
              <ImageWithFallback
                alt={member.name}
                className="w-full h-full object-cover"
                src={member.avatar_url || "https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400"}
              />
            </div>
            {member.title && (
              <p className="text-sm text-[#E93370] font-medium mb-2">
                {member.title}
              </p>
            )}
          </div>

          {/* Bio */}
          {member.bio && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">About</h3>
              <p className="text-white/70 leading-relaxed">
                {member.bio}
              </p>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            {member.email && (
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <Mail className="h-4 w-4 text-[#E93370] flex-shrink-0" />
                <a
                  className="hover:text-[#E93370] transition-colors truncate"
                  href={`mailto:${member.email}`}
                >
                  {member.email}
                </a>
              </div>
            )}
            {member.social_links?.instagram && (
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 text-[#E93370] flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    clipRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.415-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.399 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    fillRule="evenodd"
                  />
                </svg>
                <a
                  className="hover:text-[#E93370] transition-colors truncate"
                  href={`https://instagram.com/${member.social_links.instagram.replace('@', '')}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  @{member.social_links.instagram.replace('@', '')}
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberModal;
