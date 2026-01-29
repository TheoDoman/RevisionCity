'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'What is Revision City?',
        a: 'Revision City is an IGCSE revision platform that provides comprehensive study materials including notes, flashcards, quizzes, and AI-powered tools to help you ace your exams.',
      },
      {
        q: 'How do I get started?',
        a: 'Simply sign up for a free account, browse our subjects, and start revising! You can upgrade to Pro or Premium at any time for additional features.',
      },
      {
        q: 'Which subjects are available?',
        a: 'We offer 9 core IGCSE subjects: Biology, Chemistry, Physics, Mathematics, English Language, Business Studies, Computer Science, Economics, and Geography.',
      },
    ],
  },
  {
    category: 'Pricing & Subscriptions',
    questions: [
      {
        q: 'How much does Revision City cost?',
        a: 'We offer three tiers: Free Trial (1 day), Pro (€6.99/month or €55.99/year), and Premium (€11.99/month or €95.99/year). Annual plans save you 33%!',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes! You can cancel your subscription at any time from your dashboard. You\'ll keep access until the end of your billing period.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'Yes, we offer a 14-day money-back guarantee for first-time subscribers. Contact support@revisioncity.com to request a refund.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards through Stripe. We also support Apple Pay and Google Pay.',
      },
    ],
  },
  {
    category: 'Features',
    questions: [
      {
        q: 'What\'s included in the Pro plan?',
        a: 'Pro includes all 9 subjects, unlimited quizzes and flashcards, AI Test Generator, mind maps, summary sheets, and detailed progress tracking.',
      },
      {
        q: 'What\'s the difference between Pro and Premium?',
        a: 'Premium includes everything in Pro plus our AI Tutor for 24/7 instant help, personalized study plans, and smart weak area analysis.',
      },
      {
        q: 'What is the AI Test Generator?',
        a: 'The AI Test Generator creates custom practice tests on any topic you choose. Perfect for targeting specific areas you need to improve!',
      },
      {
        q: 'Can I track my progress?',
        a: 'Yes! Your dashboard shows your study streak, quiz scores, topics completed, and more. Premium users get advanced analytics.',
      },
    ],
  },
  {
    category: 'Technical',
    questions: [
      {
        q: 'Does Revision City work on mobile?',
        a: 'Yes! Our platform is fully responsive and works great on phones, tablets, and computers. A dedicated mobile app is coming soon!',
      },
      {
        q: 'Do I need an internet connection?',
        a: 'Yes, you need an internet connection to access Revision City. Offline mode is planned for future updates.',
      },
      {
        q: 'Is my data secure?',
        a: 'Absolutely! We use industry-standard encryption, secure authentication via Clerk, and never store your payment details (handled by Stripe).',
      },
    ],
  },
  {
    category: 'Content & Syllabus',
    questions: [
      {
        q: 'Is the content aligned to the Cambridge syllabus?',
        a: 'Yes! All our content is carefully aligned to the latest Cambridge IGCSE syllabus specifications.',
      },
      {
        q: 'How often is content updated?',
        a: 'We regularly update our content to reflect syllabus changes and add new materials based on user feedback.',
      },
      {
        q: 'Can I suggest topics or improvements?',
        a: 'Absolutely! We love feedback. Email us at support@revisioncity.com with your suggestions.',
      },
    ],
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-950 mb-4 text-center">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-brand-600 text-center mb-12">
          Everything you need to know about Revision City
        </p>

        <div className="space-y-8">
          {faqs.map((category, categoryIdx) => (
            <div key={categoryIdx}>
              <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.questions.map((faq, faqIdx) => {
                  const key = `${categoryIdx}-${faqIdx}`
                  const isOpen = openItems[key]

                  return (
                    <div
                      key={key}
                      className="bg-white rounded-xl border-2 border-brand-100 overflow-hidden transition-all hover:border-brand-200"
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left"
                      >
                        <span className="font-medium text-brand-900 pr-4">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={cn(
                            'h-5 w-5 text-brand-600 shrink-0 transition-transform',
                            isOpen && 'rotate-180'
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 text-brand-700 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-brand-50 rounded-2xl p-8 border-2 border-brand-100">
          <h3 className="font-display text-xl font-bold text-brand-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-brand-600 mb-4">
            We're here to help! Contact our support team.
          </p>
          <a
            href="mailto:support@revisioncity.com"
            className="btn-primary inline-block px-6 py-3"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
