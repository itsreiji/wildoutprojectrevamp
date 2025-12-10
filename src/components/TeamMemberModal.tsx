import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { TeamMember } from '../types/content';

interface TeamMemberModalProps {
    member: TeamMember | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TeamMemberModal = React.memo(({ member, isOpen, onClose }: TeamMemberModalProps) => {
    if (!member) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 md:p-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.3 }}
                                className="relative w-full max-w-2xl bg-black/95 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden my-8 flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-[#E93370] hover:border-[#E93370] transition-all duration-300"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                {/* Content */}
                                <div className="flex flex-col md:flex-row">
                                    {/* Image Section */}
                                    <div className="w-full md:w-2/5 relative h-64 md:h-auto">
                                        <ImageWithFallback
                                            src={member.avatar_url || 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400'}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/80" />
                                    </div>

                                    {/* Info Section */}
                                    <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col">
                                        <div className="mb-6">
                                            <h3 className="text-3xl text-white font-bold mb-2">{member.name}</h3>
                                            <p className="text-[#E93370] text-lg font-medium">{member.title}</p>
                                        </div>

                                        <div className="flex-grow">
                                            <p className="text-white/70 leading-relaxed mb-6">
                                                {member.bio}
                                            </p>
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-white/10">
                                            {member.email && (
                                                <a
                                                    href={`mailto:${member.email}`}
                                                    className="flex items-center text-white/60 hover:text-[#E93370] transition-colors group"
                                                >
                                                    <Mail className="h-5 w-5 mr-3 text-[#E93370]" />
                                                    <span className="truncate">{member.email}</span>
                                                </a>
                                            )}

                                            {(member.social_links?.instagram || member.metadata?.social_links?.instagram) && (
                                                <a
                                                    href={`https://instagram.com/${(member.social_links?.instagram || member.metadata?.social_links?.instagram || '').replace('@', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-white/60 hover:text-[#E93370] transition-colors group"
                                                >
                                                    <svg className="h-5 w-5 mr-3 text-[#E93370]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.415-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.749 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.023.047 1.351.058 3.807.058h.468c2.456 0 2.784-.011 3.807-.058.975-.045 1.504-.207 1.857-.344.466-.182.8-.399 1.15-.749.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.047-1.023.058-1.351.058-3.807v-.468c0-2.456-.011-2.784-.058-3.807-.045-.975-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="truncate">@{(member.social_links?.instagram || member.metadata?.social_links?.instagram || '').replace('@', '')}</span>
                                                </a>
                                            )}

                                            {member.linkedin_url && (
                                                <a
                                                    href={member.linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-white/60 hover:text-[#E93370] transition-colors group"
                                                >
                                                    <Linkedin className="h-5 w-5 mr-3 text-[#E93370]" />
                                                    <span className="truncate">LinkedIn Profile</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
});

TeamMemberModal.displayName = 'TeamMemberModal';
