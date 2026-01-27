'use client';

import { useState } from 'react';
import { Check, X, Sparkles, Zap, Crown } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { cn, SUBSCRIPTION_PRICES } from '@/lib/utils';

const tiers = [
  {
    name: 'Free Trial',
    id: 'free',
    price: { monthly: 0, yearly: 0 },
    description: 'Try Revision City for 1 day',
    features: [
      '2 subtopics per subject',
      '5 quizzes per day',
      '20 flashcards per day',
      'Basic notes access',
    ],
    notIncluded: [
      'Mind maps',
      'Summary sheets',
      'AI Test Generator',
      'AI tutor',
    ],
    cta: 'Start Free Trial',
    icon: Zap,
    popular: false,
  },
  {
    name: 'Pro',
    id: 'pro',
    price: SUBSCRIPTION_PRICES.pro,
    description: 'Everything you need to ace your IGCSEs',
    features: [
      'All 9 subjects',
      'AI Test Generator - create custom tests',
      'Unlimited subtopics',
      'Unlimited quizzes & flashcards',
      'Full notes access',
      'All practice questions',
      'Mind maps & summary sheets',
      'Detailed progress tracking',
      'Exam-style questions',
    ],
    notIncluded: [],
    cta: 'Get Pro',
    icon: Sparkles,
    popular: true,
  },
  {
    name: 'Premium',
    id: 'premium',
    price: SUBSCRIPTION_PRICES.premium,
    description: 'Pro features plus AI-powered tutoring',
    features: [
      'Everything in Pro',
      'AI Tutor - 24/7 instant help',
      'Personalised study plans',
      'Smart weak area analysis',
      'Priority support',
      'Early access to new features',
    ],
    notIncluded: [],
    cta: 'Get Premium',
    icon: Crown,
    popular: false,
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { isSignedIn } = useUser();
  const router = useRouter();

  const getPrice = (tier: typeof tiers[0]) => {
    if (tier.id === 'free') return '£0';
    const price = billingCycle === 'yearly'
      ? tier.price.yearly / 12
      : tier.price.monthly;
    return `£${price.toFixed(2)}`;
  };

  const handleCheckout = async (tierId: string) => {
    // Free tier - just redirect to sign up
    if (tierId === 'free') {
      router.push(isSignedIn ? '/dashboard' : '/sign-up');
      return;
    }

    // Paid tiers - require sign in
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setIsLoading(tierId);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tierId,
          interval: billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-950 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-brand-600 max-w-2xl mx-auto mb-8">
          Choose the plan that fits your revision needs.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 p-1.5 bg-white rounded-full border-2 border-brand-100">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-6 py-2 rounded-full text-sm font-medium transition-all',
              billingCycle === 'monthly'
                ? 'bg-brand-600 text-white'
                : 'text-brand-600 hover:bg-brand-50'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              'px-6 py-2 rounded-full text-sm font-medium transition-all',
              billingCycle === 'yearly'
                ? 'bg-brand-600 text-white'
                : 'text-brand-600 hover:bg-brand-50'
            )}
          >
            Yearly
            <span className="ml-2 text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded-full">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'relative bg-white rounded-2xl border-2 p-8 transition-all',
                tier.popular
                  ? 'border-brand-500 shadow-xl scale-105'
                  : 'border-brand-100 hover:border-brand-200 hover:shadow-lg'
              )}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-brand-600 to-accent-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4',
                  tier.popular
                    ? 'bg-gradient-to-br from-brand-500 to-brand-600'
                    : 'bg-brand-100'
                )}>
                  <tier.icon className={cn(
                    'h-6 w-6',
                    tier.popular ? 'text-white' : 'text-brand-600'
                  )} />
                </div>
                <h3 className="font-display text-xl font-bold text-brand-900">
                  {tier.name}
                </h3>
                <p className="text-sm text-brand-500 mt-1">
                  {tier.description}
                </p>
              </div>

              <div className="text-center mb-6">
                <span className="font-display text-4xl font-bold text-brand-950">
                  {getPrice(tier)}
                </span>
                <span className="text-brand-500 text-sm">
                  {tier.id === 'free' ? ' for 1 day' : '/month'}
                </span>
              </div>

              <button
                onClick={() => handleCheckout(tier.id)}
                disabled={isLoading !== null}
                className={cn(
                  'w-full py-3 rounded-xl font-medium transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed',
                  tier.popular
                    ? 'btn-primary'
                    : 'btn-secondary'
                )}
              >
                {isLoading === tier.id ? 'Loading...' : tier.cta}
              </button>

              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-success-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-brand-700">{feature}</span>
                  </li>
                ))}
                {tier.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <X className="h-5 w-5 text-brand-300 shrink-0 mt-0.5" />
                    <span className="text-sm text-brand-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
