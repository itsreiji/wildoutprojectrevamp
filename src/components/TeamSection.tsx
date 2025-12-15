import { Mail } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { useContent } from "../contexts/ContentContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";

import type { TeamMember } from "../types/content";
import TeamMemberModal from "./TeamMemberModal";

export const TeamSection = React.memo(() => {
  const { team } = useContent();
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
    <section id="team-section" className="relative py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-4">
            <span className="bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
              Meet Our Team
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            The creative minds behind Indonesia's most exciting events and
            experiences
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTeam.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group cursor-pointer"
              onClick={() => handleMemberClick(member)}
            >
              <div
                id={`team-member-${member.id}-card`}
                className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-300 h-full"
              >
                {/* Photo */}
                <div className="relative h-72 overflow-hidden">
                  <ImageWithFallback
                    id={`team-member-${member.id}-avatar`}
                    src={
                      member.avatar_url ||
                      "https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400"
                    }
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3
                      id={`team-member-${member.id}-name`}
                      className="text-xl text-white mb-1"
                    >
                      {member.name}
                    </h3>
                    <p
                      id={`team-member-${member.id}-title`}
                      className="text-sm text-[#E93370] mb-3"
                    >
                      {member.title || ""}
                    </p>
                  </div>
                </div>

                {/* Bio & Contact */}
                <div
                  id={`team-member-${member.id}-bio`}
                  className="p-6 space-y-4"
                >
                  <p className="text-sm text-white/70 line-clamp-2">
                    {member.bio}
                  </p>

                  <div className="space-y-3">
                    {member.email && (
                      <a
                        id={`team-member-${member.id}-email-link`}
                        href={`mailto:${member.email}`}
                        className="flex items-center text-sm text-white/60 hover:text-[#E93370] transition-colors group"
                      >
                        <Mail className="h-4 w-4 mr-2 text-[#E93370] flex-shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </a>
                    )}
                    {(member.social_links?.instagram ||
                      member.metadata?.social_links?.instagram) && (
                      <a
                        id={`team-member-${member.id}-instagram-link`}
                        href={`https://instagram.com/${(
                          member.social_links?.instagram ||
                          member.metadata?.social_links?.instagram ||
                          ""
                        ).replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-white/60 hover:text-[#E93370] transition-colors group"
                      >
                        <svg
                          className="h-4 w-4 mr-2 text-[#E93370] flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.415-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.749 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.023.047 1.351.058 3.807.058h.468c2.456 0 2.784-.011 3.807-.058.975-.045 1.504-.207 1.857-.344.466-.182.8-.399 1.15-.749.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.047-1.023.058-1.351.058-3.807v-.468c0-2.456-.011-2.784-.058-3.807-.045-.975-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                            clipRule="evenodd"
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
        />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-white/60 mb-4">Want to join our amazing team?</p>
          <a
            href="mailto:careers@wildoutproject.com"
            className="inline-flex items-center px-8 py-3 bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl transition-all duration-300 shadow-lg shadow-[#E93370]/20 hover:shadow-[#E93370]/40"
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
