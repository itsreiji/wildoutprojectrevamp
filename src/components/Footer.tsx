import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import logo from '../assets/logo.png';

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

  const socialLinks = [
    { icon: Instagram, href: settings.socialMedia.instagram, label: 'Instagram' },
    { icon: Twitter, href: settings.socialMedia.twitter, label: 'Twitter' },
    { icon: Facebook, href: settings.socialMedia.facebook, label: 'Facebook' },
    { icon: Youtube, href: settings.socialMedia.youtube, label: 'Youtube' },
  ];
  return (
    <footer className="relative pt-20 pb-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="mb-4 inline-block cursor-pointer"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <img src={logo} alt={settings.siteName} className="h-12 w-auto object-contain" />
              </motion.div>
              <p className="text-white/60 mb-6 leading-relaxed">
                {settings.tagline}
              </p>

              {/* Contact Info */}
              <div className="space-y-3 text-sm text-white/60">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-[#E93370]" />
                  <a href={`mailto:${settings.email}`} className="hover:text-[#E93370] transition-colors">
                    {settings.email}
                  </a>
                </div>
                <div className="flex items-center">
                  <Instagram className="h-4 w-4 mr-2 text-[#E93370]" />
                  <a
                    href={settings.socialMedia.instagram.startsWith('http') ? settings.socialMedia.instagram : `https://instagram.com/${settings.socialMedia.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#E93370] transition-colors"
                  >
                    {settings.socialMedia.instagram.startsWith('@')
                      ? settings.socialMedia.instagram
                      : settings.socialMedia.instagram.includes('instagram.com/')
                        ? `@${settings.socialMedia.instagram.split('instagram.com/')[1].replace(/\/$/, '')}`
                        : settings.socialMedia.instagram}
                  </a>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-[#E93370] flex-shrink-0" />
                  <span>{settings.address}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <h4 className="text-white mb-4 capitalize">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-white/60 hover:text-[#E93370] transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="max-w-2xl mx-auto text-center">
              <h4 className="text-2xl text-white mb-2">
                Stay in the Loop
              </h4>
              <p className="text-white/60 mb-6">
                Get the latest updates on events, exclusive offers, and community news
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#E93370]/50 transition-colors"
                />
                <button className="px-8 py-3 rounded-xl bg-[#E93370] hover:bg-[#E93370]/90 text-white transition-colors duration-300 whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pt-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 hover:bg-[#E93370]/10 flex items-center justify-center text-white/60 hover:text-[#E93370] transition-all duration-300"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>

            {/* Additional Links */}
            <div className="flex items-center gap-4 text-sm text-white/40">
              <a href="#" className="hover:text-[#E93370] transition-colors">
                Privacy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-[#E93370] transition-colors">
                Terms
              </a>
              <span>•</span>
              <a href="#" className="hover:text-[#E93370] transition-colors">
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
