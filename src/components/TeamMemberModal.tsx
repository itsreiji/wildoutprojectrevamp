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
import { Mail } from "lucide-react";
import { useState } from "react";
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
        <DialogContent
          className="sm:max-w-xl w-[95vw] !h-[800px] max-h-[90vh] bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden shadow-2xl flex flex-col gap-0"
          id="team-member-edit-dialog"
        >
          <DialogHeader
            className="p-4 pb-2 border-b border-white/10"
            id="team-member-edit-dialog-header"
          >
            <DialogTitle
              className="text-xl font-bold text-white flex items-center gap-2"
              id="team-member-edit-dialog-title"
            >
              <div className="w-2 h-2 rounded-full bg-[#E93370] animate-pulse"></div>
              {member ? "Edit Team Member" : "Add Team Member"}
            </DialogTitle>
          </DialogHeader>

          <form
            className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden"
            id="team-member-edit-form"
            onSubmit={handleSubmit}
          >
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-6 px-8 py-6 wildout-scrollbar">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#E93370] flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#E93370] rounded-full"></span>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-2">
                    <label
                      className="text-white/80 text-sm font-semibold"
                      htmlFor="name"
                    >
                      Name <span className="text-[#E93370]">*</span>
                    </label>
                    <Input
                      required
                      className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors text-sm"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-white/80 text-sm font-semibold"
                      htmlFor="title"
                    >
                      Title
                    </label>
                    <Input
                      className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors text-sm"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className="text-white/80 text-sm font-semibold"
                    htmlFor="bio"
                  >
                    Bio
                  </label>
                  <Textarea
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[120px] hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors text-sm resize-none"
                    id="bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-2">
                    <label
                      className="text-white/80 text-sm font-semibold"
                      htmlFor="avatarUrl"
                    >
                      Avatar URL
                    </label>
                    <Input
                      className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors text-sm"
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-white/80 text-sm font-semibold"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <Input
                      className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:border-white/20 focus:border-[#E93370] focus:ring-1 focus:ring-[#E93370]/50 transition-colors text-sm"
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 px-8 py-4 bg-[#0a0a0a] border-t border-white/10 sticky bottom-0 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
              <Button
                className="h-10 px-6 text-white/80 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                size="lg"
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="h-10 px-6 bg-[#E93370] hover:bg-[#E93370]/90 text-white font-medium transition-colors"
                size="lg"
                type="submit"
              >
                {member ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // View-only mode for landing page
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-xl w-[95vw] !h-[800px] max-h-[90vh] bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden shadow-2xl flex flex-col gap-0"
        id="team-member-view-dialog"
      >
        <DialogHeader
          className="p-4 pb-2 border-b border-white/10"
          id="team-member-view-dialog-header"
        >
          <DialogTitle
            className="text-xl font-bold text-white flex items-center gap-2"
            id="team-member-view-dialog-title"
          >
            <div className="w-2 h-2 rounded-full bg-[#E93370] animate-pulse"></div>
            Team Member Profile
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto wildout-scrollbar p-8 space-y-8">
          {/* Avatar & Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#E93370]/30 shadow-2xl shadow-[#E93370]/10">
              <ImageWithFallback
                alt={member.name}
                className="w-full h-full object-cover"
                src={
                  member.avatar_url ||
                  "https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400"
                }
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {member.name}
              </h2>
              {member.title && (
                <p className="text-[#E93370] font-medium tracking-wide uppercase text-sm">
                  {member.title}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {member.bio && (
            <div className="space-y-3 bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-4 bg-[#E93370] rounded-full"></span>
                About
              </h3>
              <p className="text-white/70 leading-relaxed italic">
                "{member.bio}"
              </p>
            </div>
          )}

          {/* Contact & Socials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 px-1">
              <span className="w-1 h-4 bg-[#E93370] rounded-full"></span>
              Connect
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {member.email && (
                <a
                  className="flex items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#E93370]/50 hover:bg-[#E93370]/5 transition-all group"
                  href={`mailto:${member.email}`}
                >
                  <Mail className="h-5 w-5 text-[#E93370] mr-3 group-hover:scale-110 transition-transform" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-0.5">
                      Email
                    </p>
                    <p className="text-white/80 text-sm truncate">
                      {member.email}
                    </p>
                  </div>
                </a>
              )}
              {member.social_links?.instagram && (
                <a
                  className="flex items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#E93370]/50 hover:bg-[#E93370]/5 transition-all group"
                  href={`https://instagram.com/${member.social_links.instagram.replace(
                    "@",
                    ""
                  )}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <svg
                    className="h-5 w-5 text-[#E93370] mr-3 group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.415-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.023.047 1.351.058 3.807.058h.468c2.456 0 2.784-.011 3.807-.058.975-.045 1.504-.207 1.857-.344.466-.182.8-.399 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.047-1.023.058-1.351.058-3.807v-.468c0-2.456-.011-2.784-.058-3.807-.045-.975-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                  <div className="overflow-hidden">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-0.5">
                      Instagram
                    </p>
                    <p className="text-white/80 text-sm truncate">
                      @{member.social_links.instagram.replace("@", "")}
                    </p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end px-8 py-4 bg-[#0a0a0a] border-t border-white/10 sticky bottom-0 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
          <Button
            className="h-10 px-8 text-white/80 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
            size="lg"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberModal;
