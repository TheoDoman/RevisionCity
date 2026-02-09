'use client'

import { GraduationCap, Target, Users, Zap } from 'lucide-react'

const values = [
  {
    icon: Target,
    title: 'Focused on Results',
    description: 'Every feature is designed to help you achieve top grades in your IGCSE exams.',
  },
  {
    icon: Zap,
    title: 'Powered by AI',
    description: 'Cutting-edge AI technology creates personalized learning experiences just for you.',
  },
  {
    icon: Users,
    title: 'Student-Centered',
    description: 'Built by students who understand the challenges of IGCSE revision.',
  },
  {
    icon: GraduationCap,
    title: 'Quality Content',
    description: 'All content is carefully crafted and aligned to the Cambridge IGCSE syllabus.',
  },
]

const stats = [
  { value: '9', label: 'Subjects Covered' },
  { value: '473', label: 'Topics Available' },
  { value: '1000s', label: 'Practice Questions' },
  { value: '24/7', label: 'AI Support' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-950 mb-6">
            Transforming IGCSE Revision
          </h1>
          <p className="text-xl text-brand-700 leading-relaxed mb-8">
            Revision City is an innovative platform designed to make IGCSE revision effective,
            engaging, and accessible for students worldwide.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 mb-16">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl font-bold text-brand-600 mb-2">{stat.value}</div>
              <div className="text-brand-700">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Our Story */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl font-bold text-brand-950 mb-6 text-center">
            Our Story
          </h2>
          <div className="space-y-4 text-brand-700 leading-relaxed">
            <p>
              Revision City was born from a simple observation: IGCSE students deserve better revision tools.
              Traditional methods like endless textbook reading and generic practice papers weren't cutting it.
            </p>
            <p>
              We set out to create a platform that combines comprehensive subject coverage with cutting-edge
              AI technology. The result is a revision experience that's personalized, efficient, and actually enjoyable.
            </p>
            <p>
              Today, Revision City covers all 9 core IGCSE subjects with thousands of practice questions,
              flashcards, and AI-powered tools. Our mission is to help every student achieve their academic goals
              without the stress and overwhelm of traditional revision.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="font-display text-3xl font-bold text-brand-950 mb-8 text-center">
            What We Believe In
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border-2 border-brand-100 hover:border-brand-200 transition-colors">
                <div className="bg-brand-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="font-display text-xl font-bold text-brand-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-brand-700">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl font-bold text-brand-950 mb-6 text-center">
            What Makes Us Different
          </h2>
          <div className="bg-white rounded-2xl p-8 border-2 border-brand-100">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-brand-100 rounded-full p-1 mt-1 shrink-0">
                  <svg className="h-4 w-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-brand-900">AI-Powered Learning:</span>
                  <span className="text-brand-700"> Our AI Test Generator creates unlimited custom practice tests tailored to your needs.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-brand-100 rounded-full p-1 mt-1 shrink-0">
                  <svg className="h-4 w-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-brand-900">Complete Coverage:</span>
                  <span className="text-brand-700"> All 9 core IGCSE subjects with 473 topics - everything you need in one place.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-brand-100 rounded-full p-1 mt-1 shrink-0">
                  <svg className="h-4 w-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-brand-900">Active Recall:</span>
                  <span className="text-brand-700"> Research-proven methods like flashcards and practice questions for maximum retention.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-brand-100 rounded-full p-1 mt-1 shrink-0">
                  <svg className="h-4 w-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-brand-900">Affordable:</span>
                  <span className="text-brand-700"> Starting at just €4.99/month - less than the cost of a single tutoring session.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-brand-100 rounded-full p-1 mt-1 shrink-0">
                  <svg className="h-4 w-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-brand-900">Always Improving:</span>
                  <span className="text-brand-700"> We continuously add new features and content based on student feedback.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-12 text-white">
          <h2 className="font-display text-3xl font-bold mb-4">
            Ready to Ace Your IGCSEs?
          </h2>
          <p className="text-xl mb-8 text-brand-50">
            Join thousands of students already improving their grades with Revision City.
          </p>
          <a
            href="/pricing"
            className="inline-block bg-white text-brand-600 px-8 py-4 rounded-xl font-semibold hover:bg-brand-50 transition-colors"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </div>
  )
}
