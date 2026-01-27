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

const features = [
  {
    icon: Sparkles,
    title: 'AI Test Generator',
    description: 'Generate unlimited unique practice tests with AI. Every test includes answer keys and explanations.',
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

const subjects = [
  { name: 'Physics', slug: 'physics', icon: '⚛️', color: 'from-cyan-500 to-blue-600' },
  { name: 'Chemistry', slug: 'chemistry', icon: '⚗️', color: 'from-purple-500 to-violet-600' },
  { name: 'Biology', slug: 'biology', icon: '🧬', color: 'from-green-500 to-emerald-600' },
  { name: 'Mathematics', slug: 'mathematics', icon: '📐', color: 'from-blue-500 to-indigo-600' },
  { name: 'Computer Science', slug: 'computer-science', icon: '💻', color: 'from-indigo-500 to-purple-600' },
  { name: 'Business Studies', slug: 'business', icon: '💼', color: 'from-slate-500 to-gray-600' },
  { name: 'Economics', slug: 'economics', icon: '📈', color: 'from-teal-500 to-cyan-600' },
  { name: 'Geography', slug: 'geography', icon: '🌍', color: 'from-lime-500 to-green-600' },
  { name: 'History', slug: 'history', icon: '🏛️', color: 'from-yellow-500 to-amber-600' },
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
                Cambridge IGCSE Revision
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
            <p className="text-xl text-brand-700 mb-10 max-w-2xl mx-auto animate-slide-up animation-delay-100">
              The ultimate revision platform with AI-powered test generation, comprehensive notes, flashcards, quizzes,
              and practice questions — all aligned to the Cambridge syllabus.
            </p>

            {/* CTAs - EXTRA ANIMATED */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-200">
              <Link href="/subjects" className="btn-primary px-8 py-4 text-lg hover-lift hover-glow animate-glow">
                Start Revising Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/pricing" className="btn-secondary px-8 py-4 text-lg hover-lift">
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
                <span>AI-Powered Tests</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-500" />
                <span>Cambridge Syllabus Aligned</span>
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {subjects.map((subject, index) => (
              <Link
                key={subject.name}
                href={`/subject/${subject.slug}`}
                className="group relative p-6 bg-white rounded-2xl border-2 border-brand-100
                         hover:border-transparent hover:shadow-xl transition-all duration-300
                         hover-lift hover-glow animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0
                              group-hover:opacity-15 rounded-2xl transition-opacity duration-300`} />
                <div className="relative text-center">
                  <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform duration-300 animate-float"
                        style={{ animationDelay: `${index * 200}ms` }}>{subject.icon}</span>
                  <span className="font-medium text-brand-800 group-hover:text-brand-950 transition-colors">
                    {subject.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/subjects"
              className="inline-flex items-center text-brand-600 hover:text-brand-800 font-medium transition-colors group"
            >
              View all 9 subjects
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
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
