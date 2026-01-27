import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Mail, Twitter, Instagram, Linkedin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-brand-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.svg"
                  alt="Revision City Logo"
                  width={40}
                  height={40}
                  className="object-contain transition-transform group-hover:scale-110"
                />
              </div>
              <span className="font-display text-xl font-bold">
                Revision City
              </span>
            </Link>
            <p className="text-brand-300 text-sm mb-4">
              Your ultimate IGCSE revision companion. Ace your exams with AI-powered learning.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://twitter.com/revisioncity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-brand-900 hover:bg-brand-800 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/revisioncity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-brand-900 hover:bg-brand-800 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/revisioncity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-brand-900 hover:bg-brand-800 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-display font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-brand-300">
              <li>
                <Link href="/subjects" className="hover:text-white transition-colors">
                  Browse Subjects
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/ai-generator" className="hover:text-white transition-colors">
                  AI Test Generator
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-display font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-brand-300">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:support@revisioncity.com" className="hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-display font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-brand-300">
              <li>
                <a href="/about" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-brand-400">
              © {currentYear} Revision City Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-brand-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <a href="mailto:support@revisioncity.com" className="hover:text-white transition-colors flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
