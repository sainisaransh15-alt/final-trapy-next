'use client';
import Link from 'next/link';
import { Mail, Phone, MapPin, Twitter, Instagram, Linkedin } from 'lucide-react';
import trapyLogo from '@/assets/trapy-logo.png';
import { useLanguage } from '@/hooks/useLanguage';

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <img src={trapyLogo} alt="Trapy Logo" className="h-21 w-40" />
            </Link>
            <p className="text-muted-foreground text-sm">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/trapy.in"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/trapy/"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('nav.findRide')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('nav.findRide')}
                </Link>
              </li>
              <li>
                <Link href="/publish" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('nav.publishRide')}
                </Link>
              </li>
              <li>
                <Link href="/trapy-pass" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Trapy Pass
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('nav.dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.help')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link href="/account-deletion" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Account Deletion
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4" />
                <span>trapy3004@gmail</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4" />
                <span>+91 6232796850</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Bhopal, Madhya Pradesh, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Trapy. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
