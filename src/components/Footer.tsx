import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { MOCK_SETTINGS } from '../utils/mockData';
import { H4, BodyText, SmallText } from './ui/typography';
import { Skeleton } from './ui/skeleton';
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
  const { settings: contextSettings, loading } = useContent();

  // Use context settings if available, otherwise fallback to mock settings
  const settings = contextSettings || MOCK_SETTINGS;

  if (loading && !contextSettings) {
    return (
      <footer className="relative pt-20 pb-8 px-4 z-20" aria-busy="true">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-32 rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-4 w-56 rounded" />
              </div>
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-24 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <Skeleton className="h-4 w-64 rounded" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-5 w-5 rounded-full" />
              ))}
            </div>
          </div>
        </div>
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
              <BodyText className="text-white/60 mb-6">
                {settings.tagline ?? ''}
              </BodyText>

              {/* Contact Info - SAFE */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-[#E93370]" aria-hidden="true" />
                  <a
                    className="text-white/60 hover:text-[#E93370] transition-colors"
                    href={`mailto:${settings.email ?? ''}`}
                    id="footer-email-link"
                    aria-label={`Send an email to ${settings.email ?? 'contact@wildoutproject.com'}`}
                  >
                    {settings.email ?? 'contact@wildoutproject.com'}
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-[#E93370]" aria-hidden="true" />
                  <a
                    className="text-white/60 hover:text-[#E93370] transition-colors"
                    href={`tel:${(settings.phone ?? '').replace(/\s/g, '')}`}
                    id="footer-phone-link"
                    aria-label={`Call us at ${settings.phone ?? '+62 21 1234 567'}`}
                  >
                    {settings.phone ?? '+62 21 1234 567'}
                  </a>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-[#E93370] flex-shrink-0" aria-hidden="true" />
                  <BodyText className="text-white/60">
                    {settings.address ?? 'Jakarta, Indonesia'}
                  </BodyText>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links], idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <H4 className="text-white mb-6 uppercase tracking-wider text-sm font-bold">
                {title}
              </H4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      className="text-white/60 hover:text-[#E93370] transition-colors text-sm"
                      href={link.href}
                      aria-label={`Navigate to ${link.label}`}
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
              <H4 className="text-white mb-2">
                Stay in the Loop
              </H4>
              <BodyText className="text-white/60 mb-6">
                Get the latest updates on events, exclusive offers, and community news
              </BodyText>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  aria-label="Email address for newsletter"
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

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <SmallText className="text-white/40">
            © {new Date().getFullYear()} {settings.site_name ?? 'WildOut!'}. All rights reserved.
          </SmallText>

          <div className="flex items-center gap-6">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                className="text-white/40 hover:text-[#E93370] transition-colors"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow us on ${label}`}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
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
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
