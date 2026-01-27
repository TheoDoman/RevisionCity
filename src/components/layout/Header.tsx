'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, Sparkles, BookOpen } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { subscriptionTier } = useAppStore();
  const { isSignedIn, user } = useUser();

  const navigation = [
    { name: 'Subjects', href: '/subjects' },
    { name: 'AI Test Generator', href: '/ai-generator', highlight: true },
    { name: 'Pricing', href: '/pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="Revision City Logo"
                width={40}
                height={40}
                className="object-contain transition-transform group-hover:scale-110"
                priority
              />
            </div>
            <span className="font-display text-xl font-bold gradient-text">
              Revision City
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  item.highlight
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 flex items-center gap-2"
                    : "text-brand-700 hover:text-brand-900"
                )}
              >
                {item.highlight && <Sparkles className="h-4 w-4" />}
                {item.name}
              </Link>
            ))}

            {/* Auth CTA */}
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-sm font-medium text-brand-700 hover:text-brand-900">
                  Dashboard
                </Link>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10'
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-brand-700 hover:text-brand-900">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-primary px-5 py-2.5 text-sm">
                    Get Started Free
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-brand-700 hover:bg-brand-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden transition-all duration-300 overflow-hidden',
          mobileMenuOpen ? 'max-h-64' : 'max-h-0'
        )}
      >
        <div className="px-4 py-4 space-y-3 bg-white border-t border-brand-100">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-4 py-2 text-base font-medium text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-base font-medium text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="block w-full text-left px-4 py-2 text-base font-medium text-brand-700 hover:bg-brand-50 rounded-lg transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="block btn-primary w-full py-3 text-center">
                  <Sparkles className="h-4 w-4 mr-2 inline" />
                  Get Started Free
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
