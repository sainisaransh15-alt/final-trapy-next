'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, Search, Plus, LayoutDashboard, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import SafetyMenu from './SafetyMenu';
import NotificationBell from './NotificationBell';
import { LanguageSelector } from './LanguageSelector';
import trapyLogo from '@/assets/trapy-logo.png';

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSafetyMenuOpen, setSafetyMenuOpen } = useApp();
  const { user } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Hide navbar on auth, onboarding, and admin pages
  if (pathname === '/auth' || pathname === '/onboarding' || pathname === '/admin') {
    return null;
  }

  const navLinks = [
    { path: '/find-ride', label: t('nav.findRide'), icon: Search },
    { path: '/publish', label: t('nav.publishRide'), icon: Plus },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img src={trapyLogo} alt="Trapy Logo" className="h-21 w-40" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <Button
                    variant={isActive(link.path) ? 'default' : 'ghost'}
                    className="gap-2"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <LanguageSelector />

              {/* Safety Shield Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-emerald hover:text-emerald hover:bg-emerald-light"
                onClick={() => setSafetyMenuOpen(true)}
              >
                <Shield className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald rounded-full animate-pulse-soft" />
              </Button>

              {/* Notifications - for logged in users */}
              {user && <NotificationBell />}

              {/* Messages Button - for logged in users */}
              {user && (
                <Link href="/messages">
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                </Link>
              )}

              {/* Auth/Profile */}
              {user ? (
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon">
                    <LayoutDashboard className="w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button variant="default" className="hidden md:flex">
                    {t('nav.login')}
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-slide-up">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(link.path) ? 'default' : 'ghost'}
                      className="w-full justify-start gap-2"
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                {user ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Safety Menu */}
      <SafetyMenu open={isSafetyMenuOpen} onClose={() => setSafetyMenuOpen(false)} />
    </>
  );
}
