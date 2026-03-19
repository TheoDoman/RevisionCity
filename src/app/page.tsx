import Link from 'next/link';
import {
  BookOpen,
  Brain,
  Zap,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { HomepageExamBoardSelector } from '@/components/HomepageExamBoardSelector';
import { HomepageSubjectsGrid } from '@/components/HomepageSubjectsGrid';

const features = [
  {
    icon: Sparkles,
    title: 'AI Tutor',
    description: 'Chat with your personal AI tutor. Ask any question and get guided to the answer through Socratic questions — the method proven to make knowledge stick.',
    featured: true,
  },
  {
    icon: BookOpen,
    title: 'Comprehensive Notes',
    description: 'Clear, structured revision notes for every subtopic, written to match the Cambridge syllabus.',
  },
  {
    icon: Brain,
    title: 'Smart Flashcards',
    description: 'Spaced repetition flashcards that adapt to your learning pace.',
  },
  {
    icon: Target,
    title: 'Interactive Quizzes',
    description: 'Test your knowledge with multiple choice, fill-in-the-blank, and true/false questions.',
  },
  {
    icon: Zap,
    title: 'Practice Questions',
    description: 'Exam-style questions with detailed mark schemes and example answers.',
  },
];


export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-accent-50" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-100/50 to-transparent" />
        
        {/* Decorative elements - EXTRA ANIMATED */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200 rounded-full blur-3xl opacity-30 animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200 rounded-full blur-3xl opacity-20 animate-float animation-delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-10 animate-scale-pulse" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge - ANIMATED */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-8 animate-bounce-soft hover-glow">
              <GraduationCap className="h-5 w-5 text-brand-600 animate-wiggle" />
              <span className="text-sm font-medium text-brand-700">
                Cambridge & Edexcel IGCSE Revision
              </span>
            </div>

            {/* Main heading */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-brand-950 mb-6 animate-slide-up">
              Ace Your{' '}
              <span className="gradient-text">IGCSEs</span>
              <br />
              With Confidence
            </h1>

            {/* Subheading */}
            <p className="text-xl text-brand-700 mb-6 max-w-2xl mx-auto animate-slide-up animation-delay-100">
              The ultimate revision platform with AI-powered test generation, comprehensive notes, flashcards, quizzes,
              and practice questions — aligned to Cambridge and Edexcel specifications.
            </p>

            {/* Exam board selector + CTA */}
            <HomepageExamBoardSelector />

            <div className="mt-4 animate-slide-up animation-delay-250">
              <Link href="/pricing" className="btn-secondary px-8 py-3 text-base hover-lift">
                View Pricing
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-brand-600 animate-fade-in animation-delay-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-500" />
                <span>Join 10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-500" />
                <span>9 IGCSE Subjects</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-500" />
                <span>AI Tutor Included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-500" />
                <span>Cambridge & Edexcel Aligned</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-950 mb-4">
              All Your Subjects, One Place
            </h2>
            <p className="text-lg text-brand-600 max-w-2xl mx-auto">
              From Sciences to Humanities, we&apos;ve got you covered with comprehensive revision materials.
            </p>
          </div>

          <HomepageSubjectsGrid />
        </div>
      </section>

      {/* AI Tutor Spotlight */}
      <section className="py-20 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 animate-float-slow" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-200 rounded-full blur-3xl opacity-20 animate-float animation-delay-500" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-6">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-medium text-violet-700">New Feature</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-950 mb-4">
                Meet Your Personal{' '}
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  AI Tutor
                </span>
              </h2>
              <p className="text-lg text-brand-600 mb-6">
                Struggling with a concept? Your AI tutor never just gives you the answer — it asks you the right questions so you genuinely understand and remember.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Guides you with questions, not lectures',
                  'Available for every subject and topic',
                  'Suggests flashcards as you learn',
                  'Adapts when you get stuck',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-brand-700">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/subjects"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Try AI Tutor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Mock chat UI */}
            <div className="bg-white rounded-2xl shadow-xl border border-violet-100 p-5 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2 pb-4 border-b border-brand-100 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-900">AI Tutor</p>
                  <p className="text-xs text-brand-500">Biology · Photosynthesis</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-brand-50 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-brand-800 max-w-[85%]">
                    Hi! What would you like to understand better today?
                  </div>
                </div>

                <div className="flex gap-2 flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-brand-200 flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="h-3.5 w-3.5 text-brand-600" />
                  </div>
                  <div className="bg-violet-600 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white max-w-[85%]">
                    What is photosynthesis?
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-brand-50 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-brand-800 max-w-[85%]">
                    Great question! The word has two parts — &apos;photo&apos; and &apos;synthesis&apos;. What do you think each part means?
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border border-brand-200 rounded-xl px-3 py-2">
                <span className="text-sm text-brand-400 flex-1">Ask a question...</span>
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <ArrowRight className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-white to-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium text-brand-700">
                Everything You Need
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-950 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-brand-600 max-w-2xl mx-auto">
              Different revision methods work for different people. We give you all of them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group p-6 bg-white rounded-2xl border transition-all duration-300 animate-slide-up ${
                  feature.featured
                    ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                    : 'border-brand-100 hover:border-brand-200 hover:shadow-lg'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {feature.featured && (
                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium rounded-full">
                      <Sparkles className="h-3 w-3" />
                      New
                    </span>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${
                  feature.featured
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 animate-glow'
                    : 'bg-gradient-to-br from-brand-500 to-brand-600'
                }`}>
                  <feature.icon className="h-6 w-6 text-white group-hover:animate-wiggle" />
                </div>
                <h3 className="font-display text-lg font-semibold text-brand-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-brand-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-950 relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-950 to-brand-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Ace Your IGCSEs?
          </h2>
          <p className="text-xl text-brand-200 mb-10">
            Join 10,000+ students already using Revision City to achieve top grades.
          </p>
          <Link
            href="/subjects"
            className="inline-flex items-center btn-accent px-8 py-4 text-lg"
          >
            Get Started — It&apos;s Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
