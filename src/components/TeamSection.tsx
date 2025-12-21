import { Mail, Users } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { useContent } from "../contexts/ContentContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { H2, H3, BodyText, SmallText } from "./ui/typography";

import type { TeamMember } from "../types/content";
import TeamMemberModal from "./TeamMemberModal";

export const TeamSection = React.memo(() => {
  const { team, settings } = useContent();
  const activeTeam = team.filter((member) => member.status === "active");
  const [selectedMember, setSelectedMember] = React.useState<
    TeamMember | undefined
  >(undefined);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="relative py-32 px-4 overflow-hidden" id="team-section">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E93370]/10 border border-[#E93370]/20 text-[#E93370] text-xs font-medium mb-6 uppercase tracking-wider"
          >
            <Users className="w-3 h-3" />
            <span>The Visionaries</span>
          </motion.div>
          <H2 gradient="from-white via-[#E93370] to-white" className="mb-6">
            Meet Our Team
          </H2>
          <BodyText className="text-white/60 max-w-2xl mx-auto">
            The creative minds behind Indonesia's most exciting events and
            experiences
          </BodyText>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTeam.map((member, index) => (
            <motion.div
              key={member.id}
              className="group cursor-pointer focus:outline-none"
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              onClick={() => handleMemberClick(member)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleMemberClick(member);
                }
              }}
              aria-label={`View details for ${member.name}`}
            >
              <div
                className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-300 h-full"
                id={`team-member-${member.id}-card`}
              >
                {/* Photo */}
                <div className="relative h-72 overflow-hidden">
                  <ImageWithFallback
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    id={`team-member-${member.id}-avatar`}
                    src={
                      member.avatar_url ||
                      ""
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <H3
                      className="text-white mb-1"
                      id={`team-member-${member.id}-name`}
                    >
                      {member.name}
                    </H3>
                    <SmallText
                      className="text-[#E93370] mb-3"
                      id={`team-member-${member.id}-title`}
                    >
                      {member.title || ""}
                    </SmallText>
                  </div>
                </div>

                {/* Bio & Contact */}
                <div
                  className="p-8 space-y-4"
                  id={`team-member-${member.id}-bio`}
                >
                  <SmallText className="text-white/70 line-clamp-3 leading-relaxed">
                    {member.bio}
                  </SmallText>

                  <div className="space-y-3">
                    {member.email && (
                      <a
                        className="flex items-center text-sm text-white/60 hover:text-[#E93370] transition-colors group"
                        href={`mailto:${member.email}`}
                        id={`team-member-${member.id}-email-link`}
                      >
                        <Mail className="h-4 w-4 mr-2 text-[#E93370] flex-shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </a>
                    )}
                    {(member.social_links?.instagram ||
                      member.metadata?.social_links?.instagram) && (
                      <a
                        className="flex items-center text-sm text-white/60 hover:text-[#E93370] transition-colors group"
                        href={`https://instagram.com/${(
                          member.social_links?.instagram ||
                          member.metadata?.social_links?.instagram ||
                          ""
                        ).replace("@", "")}`}
                        id={`team-member-${member.id}-instagram-link`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4 mr-2 text-[#E93370] flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            clipRule="evenodd"
                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.415-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.749 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.023.047 1.351.058 3.807.058h.468c2.456 0 2.784-.011 3.807-.058.975-.045 1.504-.207 1.857-.344.466-.182.8-.399 1.15-.749.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.047-1.023.058-1.351.058-3.807v-.468c0-2.456-.011-2.784-.058-3.807-.045-.975-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                            fillRule="evenodd"
                          />
                        </svg>
                        <span className="truncate">
                          @
                          {(
                            member.social_links?.instagram ||
                            member.metadata?.social_links?.instagram ||
                            ""
                          ).replace("@", "")}
                        </span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 border-[#E93370] rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        <TeamMemberModal
          member={selectedMember}
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={() => {}}
          isAdminMode={false}
        />

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <p className="text-white/60 mb-4">Want to join our amazing team?</p>
          <a
            className="inline-flex items-center px-8 py-3 bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl transition-all duration-300 shadow-lg shadow-[#E93370]/20 hover:shadow-[#E93370]/40"
            href={`mailto:${settings?.email || 'careers@wildoutproject.com'}`}
          >
            <Mail className="mr-2 h-5 w-5" />
            Get in Touch
          </a>
        </motion.div>
      </div>
    </section>
  );
});

TeamSection.displayName = "TeamSection";
