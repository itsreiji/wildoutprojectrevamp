import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from './router/Link';
import { useRouter } from './router';
import logo from 'figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#' },
  { id: 'events', label: 'Events', href: '#events' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'team', label: 'Team', href: '#team' },
  { id: 'gallery', label: 'Gallery', href: '#gallery' },
  { id: 'partners', label: 'Partners', href: '#partners' },
];

const NavigationComponent = () => {
  const { getAdminPath } = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <>
      {/* Desktop & Mobile Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.button
              onClick={() => scrollToSection('#')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer h-10 md:h-12"
            >
              <img src={logo} alt="WildOut!" className="h-full w-auto object-contain" />
            </motion.button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.href)}
                  className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  {item.label}
                </button>
              ))}
              <Link
                to={getAdminPath()}
                className="group ml-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#E93370] border border-[#E93370]/30 bg-[#E93370]/5 hover:bg-[#E93370]/10 hover:border-[#E93370] hover:text-white rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E93370]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black/80 active:scale-95"
              >
                <LayoutDashboard className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Admin</span>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden border-white/10 text-white hover:bg-white/10 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-black/95 backdrop-blur-2xl border-l border-white/10 z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <img src={logo} alt="WildOut!" className="h-10 w-auto object-contain" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="border-white/10 text-white hover:bg-white/10 rounded-xl"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-2">
                    {NAV_ITEMS.map((item, index) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => scrollToSection(item.href)}
                        className="w-full text-left px-4 py-3 text-lg text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                      >
                        {item.label}
                      </motion.button>
                    ))}
                    <Link
                      to={getAdminPath()}
                      className="group w-full text-left px-4 py-3 text-lg text-[#E93370] hover:text-white hover:bg-[#E93370]/10 rounded-xl transition-all duration-300 flex items-center gap-3 border border-[#E93370]/20 hover:border-[#E93370] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E93370]/50"
                    >
                      <LayoutDashboard className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-medium">Admin Dashboard</span>
                    </Link>
                  </div>
                </nav>

                {/* Footer */}
                <div className="p-6 border-t border-white/10">
                  <p className="text-sm text-white/60 text-center">
                    © 2025 WildOut! All rights reserved.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export const Navigation = memo(NavigationComponent);
Navigation.displayName = 'Navigation';
