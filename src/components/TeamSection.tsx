import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Linkedin, Twitter } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useContent } from '../contexts/ContentContext';

export const TeamSection = React.memo(() => {
  const { team } = useContent();
  const activeTeam = team.filter(member => member.status === 'active');

  return (
    <section id="team" className="relative py-20 px-4">
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
            The creative minds behind Indonesia's most exciting events and experiences
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
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-300 h-full">
                {/* Photo */}
                <div className="relative h-72 overflow-hidden">
                  <ImageWithFallback
                    src={member.avatar_url || 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400'}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
                  
                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl text-white mb-1">{member.name}</h3>
                    <p className="text-sm text-[#E93370] mb-3">{member.title || ''}</p>
                  </div>
                </div>

                {/* Bio & Contact */}
                <div className="p-6 space-y-4">
                  <p className="text-sm text-white/70 line-clamp-2">{member.bio}</p>
                  
                  <div className="space-y-2">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center text-sm text-white/60 hover:text-[#E93370] transition-colors group"
                      >
                        <Mail className="h-4 w-4 mr-2 text-[#E93370]" />
                        <span className="truncate">{member.email}</span>
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
            href="mailto:careers@wildout.id"
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

TeamSection.displayName = 'TeamSection';
