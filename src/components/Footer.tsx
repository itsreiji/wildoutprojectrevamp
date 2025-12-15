import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import logo from 'figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png';

const FOOTER_LINKS = {
  company: [
    { label: 'About Us', href: '#about' },
    { label: 'Our Team', href: '#team' },
    { label: 'Careers', href: '#' },
    { label: 'Press Kit', href: '#' },
  ],
  events: [
    { label: 'Upcoming Events', href: '#events' },
    { label: 'Past Events', href: '#' },
    { label: 'Photo Moments', href: '#gallery' },
    { label: 'Submit Event', href: '#' },
  ],
  community: [
    { label: 'Join Community', href: '#' },
    { label: 'Partners', href: '#partners' },
    { label: 'Member Benefits', href: '#' },
    { label: 'Newsletter', href: '#' },
  ],
  support: [
    { label: 'Contact Us', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
};

export const Footer = React.memo(() => {
  const { settings } = useContent();

  if (!settings) {
    return (
      <footer className="relative pt-20 pb-8 px-4 z-20">
        <div className="container mx-auto max-w-7xl text-center text-white/60 py-20">Loading footer...</div>
      </footer>
    );
  }

  const socialMediaKeys = [
    { icon: Instagram, key: 'instagram', label: 'Instagram' },
    { icon: Twitter, key: 'twitter', label: 'Twitter' },
    { icon: Facebook, key: 'facebook', label: 'Facebook' },
    { icon: Youtube, key: 'youtube', label: 'Youtube' },
  ];

  const socialLinks = socialMediaKeys
    .map(({ icon: Icon, key, label }) => {
      const href = settings.social_media?.[key as keyof typeof settings.social_media] as string | undefined;
      if (!href) return null;
      return { icon: Icon, href, label };
    })
    .filter(Boolean) as Array<{ icon: any; href: string; label: string }>;

  return (
    <footer className="relative pt-20 pb-8 px-4 z-20" id="footer-section">
      <div className="container mx-auto max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4">
                <img alt={settings.site_name ?? 'WildOut!'} className="h-12 w-auto object-contain" src={logo} />
              </div>
              <p className="text-white/60 mb-6 leading-relaxed">
                {settings.tagline ?? ''}
              </p>

              {/* Contact Info - SAFE */}
              <div className="space-y-3 text-sm text-white/60">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-[#E93370]" />
                  <a className="hover:text-[#E93370] transition-colors" href={`mailto:${settings.email ?? ''}`} id="footer-email-link">
                    {settings.email ?? 'contact@wildoutproject.com'}
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-[#E93370]" />
                  <a className="hover:text-[#E93370] transition-colors" href={`tel:${(settings.phone ?? '').replace(/\s/g, '')}`} id="footer-phone-link">
                    {settings.phone ?? '+62 21 1234 567'}
                  </a>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-[#E93370] flex-shrink-0" />
                  <span>{settings.address ?? 'Jakarta, Indonesia'}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Columns - unchanged */}
          {Object.entries(FOOTER_LINKS).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h4 className="text-white mb-4 capitalize">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      className="text-white/60 hover:text-[#E93370] transition-colors text-sm"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section - unchanged */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="max-w-2xl mx-auto text-center">
              <h4 className="text-2xl text-white mb-2">
                Stay in the Loop
              </h4>
              <p className="text-white/60 mb-6">
                Get the latest updates on events, exclusive offers, and community news
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#E93370]/50 transition-colors"
                  id="footer-newsletter-email-input"
                  placeholder="Enter your email"
                  type="email"
                />
                <button className="px-8 py-3 rounded-xl bg-[#E93370] hover:bg-[#E93370]/90 text-white transition-colors duration-300 whitespace-nowrap" id="footer-newsletter-subscribe-button">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar - SAFE */}
        <motion.div
          className="pt-8 border-t border-white/10"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-white/40 text-sm">
                © {new Date().getFullYear()} {settings.site_name ?? 'WildOut!'}. All rights reserved.
              </p>
              <p className="text-white text-sm">
                Made by{' '}
                <a
                  className="font-bold text-[#E93370] border border-[#E93370]/60 bg-[#E93370]/15 hover:bg-[#E93370]/25 hover:border-[#E93370] hover:text-white px-2 py-0.5 rounded transition-all duration-300 drop-shadow-sm"
                  href="https://instagram.com/itsreiji"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  EJI
                </a>
              </p>
            </div>

            {/* Social Links - SAFE */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 hover:bg-[#E93370]/10 flex items-center justify-center text-white/60 hover:text-[#E93370] transition-all duration-300"
                    href={social.href}
                    id={`footer-${social.label.toLowerCase()}-link`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>

            {/* Additional Links - unchanged */}
            <div className="flex items-center gap-4 text-sm text-white/40">
              <a className="hover:text-[#E93370] transition-colors" href="#" id="footer-privacy-link">
                Privacy
              </a>
              <span>•</span>
              <a className="hover:text-[#E93370] transition-colors" href="#" id="footer-terms-link">
                Terms
              </a>
              <span>•</span>
              <a className="hover:text-[#E93370] transition-colors" href="#" id="footer-cookies-link">
                Cookies
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
