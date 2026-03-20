import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Calendar, ArrowRight, CheckCircle2, Download, TrendingUp,
  Clock, Target, Sparkles, RefreshCw,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Smart Revision Plan | Revision City',
  description:
    'AI builds a personalised week-by-week IGCSE revision schedule based on your exam date, target grade, and quiz history. Download as calendar, PDF, or spreadsheet.',
};

const benefits = [
  {
    icon: TrendingUp,
    title: 'Adapts weekly to your progress',
    description:
      'Every week, the plan checks your quiz scores and rebalances — harder topics get more time, mastered ones get less.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Target,
    title: 'Grade predictions week-by-week',
    description:
      'See your projected IGCSE grade at weeks 4, 8, and 12. Know exactly what it takes to hit your target.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Calendar,
    title: 'Checkpoint mini-tests at weeks 3, 6, 9',
    description:
      '20-question mini-tests built from your weakest areas, so you know you\'re ready before exam day.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Clock,
    title: 'Spaced repetition built in',
    description:
      'Weak topics are revisited every 2 weeks. Strong topics are pushed to later weeks so you focus where it matters.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Download,
    title: 'Download your calendar',
    description:
      'Export as .ics to sync with Google Calendar, Apple Calendar, or Outlook. Also available as PDF and CSV.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: RefreshCw,
    title: 'Re-plan anytime (Premium)',
    description:
      'Changed your exam date or want a fresh start? Premium users can re-generate the plan whenever they like.',
    color: 'from-fuchsia-500 to-violet-600',
  },
];

const steps = [
  { number: '01', title: 'Pick your subject & exam date', description: 'Choose any of our 9 IGCSE subjects and enter when your exam is.' },
  { number: '02', title: 'Set your target grade', description: 'Tell us where you want to get to — A*, A, B, C, or D.' },
  { number: '03', title: 'AI analyses your history', description: 'Claude AI reads your quiz scores and identifies which topics need the most work.' },
  { number: '04', title: 'Get your personalised plan', description: 'Receive a week-by-week schedule you can download and follow from today.' },
];

export default function RevisionPlanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-fuchsia-200 rounded-full blur-3xl opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-8">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">Powered by Claude AI</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-bold text-brand-950 mb-6 leading-tight">
            Your Personalised{' '}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Study Schedule
            </span>
          </h1>

          <p className="text-xl text-brand-600 mb-10 max-w-2xl mx-auto">
            Tell us your exam date and target grade. Claude AI analyses your quiz history and builds a week-by-week revision plan that adjusts automatically as you improve.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/subjects"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:opacity-90 transition-opacity shadow-lg shadow-violet-200"
            >
              <Calendar className="h-5 w-5" />
              Create My Study Plan
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-medium border-2 border-violet-200 text-violet-700 hover:bg-violet-50 transition-colors"
            >
              View Premium Features
            </Link>
          </div>

          <p className="mt-4 text-sm text-brand-500">
            Free tier: 1 plan per subject · Premium: unlimited re-planning
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-950 mb-4">
              Ready in 60 seconds
            </h2>
            <p className="text-lg text-brand-600">No complicated setup — just fill in four details and your plan is ready.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-3xl font-bold w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-violet-200">
                  {step.number}
                </div>
                <h3 className="font-display text-base font-semibold text-brand-900 mb-2">{step.title}</h3>
                <p className="text-sm text-brand-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-20 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-950 mb-4">
              Why students love it
            </h2>
            <p className="text-lg text-brand-600 max-w-2xl mx-auto">
              Built on proven learning science — spaced repetition, active recall, and adaptive scheduling.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-2xl border border-brand-100 p-6 hover:shadow-lg transition-shadow">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4`}>
                  <benefit.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-base font-semibold text-brand-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-brand-500 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan preview mockup */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-brand-950 mb-4">
                See your{' '}
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  grade trajectory
                </span>
              </h2>
              <p className="text-brand-600 mb-6">
                The plan calculates your predicted grade at every stage based on your current scores and how much you improve with focused study.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Current average below 60%? Plan front-loads all weak topics',
                  'Above 80%? Topics get pushed to later weeks so you don\'t over-revise',
                  'Hitting targets? The plan unlocks more advanced content',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-brand-700 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/subjects"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Start with a Subject
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Grade chart mockup */}
            <div className="bg-white rounded-2xl shadow-xl border border-violet-100 p-6 max-w-sm mx-auto lg:mx-0">
              <p className="text-sm font-semibold text-brand-900 mb-4">Grade Progression — Biology</p>
              <div className="relative h-40 flex items-end gap-3 mb-3">
                {[
                  { label: 'Now', pct: 54, grade: 'F' },
                  { label: 'Wk 4', pct: 65, grade: 'E' },
                  { label: 'Wk 8', pct: 76, grade: 'D' },
                  { label: 'Wk 12', pct: 85, grade: 'C' },
                  { label: 'Exam', pct: 91, grade: 'B' },
                ].map((p) => (
                  <div key={p.label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-violet-700">{p.grade}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-violet-500 to-fuchsia-400"
                      style={{ height: `${p.pct}%` }}
                    />
                    <span className="text-xs text-brand-400">{p.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-violet-50 rounded-xl px-3 py-2 text-sm">
                <TrendingUp className="h-4 w-4 text-violet-600" />
                <span className="text-violet-700 font-medium">F → B in 12 weeks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-700/50 via-transparent to-fuchsia-700/50" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to study smarter?
          </h2>
          <p className="text-violet-100 text-lg mb-8">
            Pick a subject and create your personalised revision plan in 60 seconds.
          </p>
          <Link
            href="/subjects"
            className="inline-flex items-center gap-2 bg-white text-violet-700 font-semibold px-8 py-4 rounded-xl text-lg hover:bg-violet-50 transition-colors shadow-lg"
          >
            Choose a Subject
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
