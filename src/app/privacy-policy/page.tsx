import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | RevisionCity',
  description: 'How RevisionCity collects, uses, and protects your personal data. GDPR-compliant privacy policy for UK and EU users.',
}

const TOC = [
  { id: 'who-we-are', label: '1. Who We Are' },
  { id: 'data-we-collect', label: '2. Data We Collect' },
  { id: 'how-we-use-data', label: '3. How We Use Your Data' },
  { id: 'third-party-processors', label: '4. Third-Party Processors' },
  { id: 'ai-and-anthropic', label: '5. AI Features & Anthropic' },
  { id: 'cookies', label: '6. Cookies' },
  { id: 'data-retention', label: '7. Data Retention' },
  { id: 'international-transfers', label: '8. International Transfers' },
  { id: 'childrens-data', label: '9. Children\'s Data' },
  { id: 'your-rights', label: '10. Your Rights Under GDPR' },
  { id: 'data-deletion', label: '11. How to Request Data Deletion' },
  { id: 'security', label: '12. Security' },
  { id: 'changes', label: '13. Changes to This Policy' },
  { id: 'contact', label: '14. Contact Us' },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-medium text-brand-500 uppercase tracking-wide mb-2">Legal</p>
          <h1 className="font-display text-4xl font-bold text-brand-950 mb-3">Privacy Policy</h1>
          <p className="text-brand-500 text-sm">Last updated: 23 March 2026</p>
        </div>

        {/* Table of Contents */}
        <nav className="bg-white border-2 border-brand-100 rounded-2xl p-6 mb-12">
          <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide mb-4">Contents</p>
          <ol className="space-y-1.5">
            {TOC.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-sm text-brand-600 hover:text-brand-900 hover:underline transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Body */}
        <div className="space-y-12 text-brand-700 leading-relaxed">

          {/* 1 */}
          <section id="who-we-are">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">1. Who We Are</h2>
            <p className="mb-4">
              RevisionCity (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an IGCSE revision platform operated by
              Revision City Ltd, incorporated in England and Wales. We provide study notes, flashcards, quizzes, practice questions,
              AI-generated tests, AI tutoring, personalised revision plans, and mock exam simulations to IGCSE students.
            </p>
            <p>
              This policy explains what personal data we collect when you use RevisionCity, why we collect it, how long
              we keep it, and what rights you have. We are the data controller for the purposes of the UK GDPR and the
              EU GDPR.
            </p>
          </section>

          {/* 2 */}
          <section id="data-we-collect">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">2. Data We Collect</h2>

            <h3 className="text-lg font-semibold text-brand-900 mb-2 mt-6">2.1 Account Data</h3>
            <p className="mb-3">
              When you create an account via Clerk (our authentication provider), we receive:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Your name and email address</li>
              <li>A unique user identifier assigned by Clerk</li>
              <li>Profile image (if you sign in via Google or Apple)</li>
              <li>Date and time of account creation and last sign-in</li>
            </ul>
            <p className="text-sm text-brand-500 mb-4">
              We do not store passwords ourselves. Clerk handles authentication securely on our behalf.
            </p>

            <h3 className="text-lg font-semibold text-brand-900 mb-2 mt-6">2.2 Study Progress & Activity Data</h3>
            <p className="mb-3">As you use the platform, we record:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Which subjects, topics, and subtopics you have studied</li>
              <li>Quiz scores and best scores per subtopic</li>
              <li>Flashcards reviewed and practice questions completed</li>
              <li>Notes and recall prompts accessed</li>
              <li>AI-generated tests created and results</li>
              <li>Mock exam attempts, answers submitted, timing data per question, and grade predictions</li>
              <li>Personalised revision plans (subject, target grade, weekly schedule)</li>
              <li>Activity timestamps</li>
            </ul>
            <p>
              This data is stored in our database (Supabase) and is used solely to power your personalised experience —
              showing your progress, predicting grades, and adjusting revision plans.
            </p>

            <h3 className="text-lg font-semibold text-brand-900 mb-2 mt-6">2.3 Payment Data</h3>
            <p className="mb-3">
              Subscription payments are processed by Stripe. We never see or store your full card number, CVV, or bank
              account details. What we do store is:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Your Stripe customer ID</li>
              <li>Subscription tier (Free, Pro, or Premium) and status (active, cancelled, etc.)</li>
              <li>Billing cycle (monthly or annual) and renewal dates</li>
            </ul>
            <p>
              Stripe stores your full payment information under their own privacy policy and PCI-DSS compliance programme.
            </p>

            <h3 className="text-lg font-semibold text-brand-900 mb-2 mt-6">2.4 Technical & Usage Data</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Approximate location (country/region level, derived from IP address)</li>
              <li>Pages visited and features used</li>
              <li>Performance and error logs (used for debugging)</li>
            </ul>
          </section>

          {/* 3 */}
          <section id="how-we-use-data">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">3. How We Use Your Data</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-brand-100">
                    <th className="text-left py-2 pr-4 font-semibold text-brand-900 w-1/2">Purpose</th>
                    <th className="text-left py-2 font-semibold text-brand-900">Legal Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {[
                    ['Providing and maintaining your RevisionCity account', 'Contract performance'],
                    ['Tracking your study progress and displaying personalised analytics', 'Contract performance'],
                    ['Generating AI-personalised revision plans and mock exams', 'Contract performance'],
                    ['Processing subscription payments via Stripe', 'Contract performance'],
                    ['Sending transactional emails (receipts, account alerts)', 'Contract performance'],
                    ['Detecting and preventing fraud or abuse', 'Legitimate interests'],
                    ['Improving our platform and developing new features (using aggregated/anonymised data)', 'Legitimate interests'],
                    ['Complying with legal obligations (e.g., tax records, law enforcement requests)', 'Legal obligation'],
                    ['Sending marketing emails (if you opt in)', 'Consent'],
                  ].map(([purpose, basis]) => (
                    <tr key={purpose}>
                      <td className="py-2.5 pr-4 text-brand-700">{purpose}</td>
                      <td className="py-2.5 text-brand-500 whitespace-nowrap">{basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4 */}
          <section id="third-party-processors">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">4. Third-Party Processors</h2>
            <p className="mb-6">
              We share data with the following third-party processors, each bound by Data Processing Agreements (DPAs)
              with us. We have chosen providers that offer appropriate GDPR safeguards.
            </p>

            <div className="space-y-5">
              {[
                {
                  name: 'Clerk',
                  role: 'Authentication',
                  what: 'Your name, email, and login credentials. Clerk handles sign-in, sign-up, and session management.',
                  where: 'USA (Standard Contractual Clauses in place)',
                  link: 'https://clerk.com/privacy',
                },
                {
                  name: 'Supabase',
                  role: 'Database & Storage',
                  what: 'All study progress, quiz results, revision plans, mock exam data, and subscription records.',
                  where: 'EU (AWS eu-west region). Data does not leave the EU.',
                  link: 'https://supabase.com/privacy',
                },
                {
                  name: 'Stripe',
                  role: 'Payment Processing',
                  what: 'Payment card details and billing information. We receive only your Stripe customer ID and subscription status.',
                  where: 'USA and EU (SCCs in place). Stripe is PCI-DSS Level 1 certified.',
                  link: 'https://stripe.com/privacy',
                },
                {
                  name: 'Anthropic',
                  role: 'AI Features',
                  what: 'Study queries, answers, and revision content sent when you use AI features. See Section 5 for full details.',
                  where: 'USA (SCCs in place)',
                  link: 'https://anthropic.com/privacy',
                },
                {
                  name: 'Vercel',
                  role: 'Hosting & Deployment',
                  what: 'Server request logs including IP addresses and request metadata.',
                  where: 'USA and EU (SCCs in place)',
                  link: 'https://vercel.com/legal/privacy-policy',
                },
              ].map((p) => (
                <div key={p.name} className="border border-brand-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className="font-semibold text-brand-900">{p.name}</span>
                      <span className="ml-2 text-xs font-medium text-brand-500 bg-brand-100 px-2 py-0.5 rounded-full">{p.role}</span>
                    </div>
                  </div>
                  <p className="text-sm mb-1"><span className="text-brand-500">What they receive:</span> {p.what}</p>
                  <p className="text-sm mb-1"><span className="text-brand-500">Where processed:</span> {p.where}</p>
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:text-brand-700 underline">
                    Privacy policy →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* 5 */}
          <section id="ai-and-anthropic">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">5. AI Features & Anthropic</h2>
            <p className="mb-4">
              RevisionCity uses Anthropic&apos;s Claude AI for the following features:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li><strong>AI Test Generator</strong> — generates custom quiz questions for a topic you choose</li>
              <li><strong>AI Tutor</strong> — answers your study questions in a Socratic, educational style</li>
              <li><strong>Mock Exam Grader</strong> — evaluates your written answers against mark schemes</li>
              <li><strong>Revision Plan Generator</strong> — creates a personalised weekly study schedule</li>
            </ul>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-amber-900 mb-1">What is sent to Anthropic</p>
              <p className="text-sm text-amber-800">
                When you use an AI feature, the relevant study content (topic name, question text, your written answers,
                or chat messages) is sent to Anthropic&apos;s API to generate a response. This data is processed by
                Anthropic under our API agreement. Anthropic does not use API inputs to train their models by default.
              </p>
            </div>

            <p className="mb-4">
              We do not send your name, email, or payment information to Anthropic. Study queries are sent with only the
              context needed to generate an educational response (subject, topic, and your input text).
            </p>
            <p>
              If you do not wish to have your study content processed by Anthropic, do not use the AI Tutor, AI Test
              Generator, Mock Exam Grader, or Revision Plan features. All other features of RevisionCity work without
              AI and do not involve Anthropic.
            </p>
          </section>

          {/* 6 */}
          <section id="cookies">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">6. Cookies</h2>
            <p className="mb-6">We use the following cookies and local storage:</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-brand-100">
                    <th className="text-left py-2 pr-4 font-semibold text-brand-900">Cookie / Storage</th>
                    <th className="text-left py-2 pr-4 font-semibold text-brand-900">Provider</th>
                    <th className="text-left py-2 pr-4 font-semibold text-brand-900">Purpose</th>
                    <th className="text-left py-2 font-semibold text-brand-900">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {[
                    ['__session, __client_uat', 'Clerk', 'Authentication session management — keeps you signed in', 'Session / 1 year'],
                    ['_stripe_*', 'Stripe', 'Fraud prevention and payment flow management', 'Session'],
                    ['exam-[examId] (localStorage)', 'RevisionCity', 'Saves in-progress exam answers locally to prevent data loss if you refresh', 'Until exam submitted'],
                    ['progress store (localStorage/Zustand)', 'RevisionCity', 'Caches your study progress in the browser for faster page loads', 'Persistent'],
                    ['ph_* (PostHog)', 'PostHog', 'Anonymous usage analytics — helps us understand how features are used. No personal data.', '1 year'],
                  ].map(([cookie, provider, purpose, duration]) => (
                    <tr key={cookie as string}>
                      <td className="py-2.5 pr-4 font-mono text-xs text-brand-700 align-top">{cookie}</td>
                      <td className="py-2.5 pr-4 text-brand-600 align-top whitespace-nowrap">{provider}</td>
                      <td className="py-2.5 pr-4 text-brand-700 align-top">{purpose}</td>
                      <td className="py-2.5 text-brand-500 align-top whitespace-nowrap text-xs">{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm text-brand-500">
              The Clerk session cookies are strictly necessary for authentication and cannot be disabled while remaining
              signed in. You can block all cookies via your browser settings, but this will prevent you from signing in.
            </p>
          </section>

          {/* 7 */}
          <section id="data-retention">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">7. Data Retention</h2>

            <div className="space-y-3">
              {[
                ['Account data', 'Retained while your account is active. Deleted within 30 days of an account deletion request.'],
                ['Study progress & activity', 'Retained while your account is active. Deleted within 30 days of account deletion.'],
                ['Mock exam answers & analysis', 'Retained for 2 years after the exam date, then automatically purged. You can request earlier deletion.'],
                ['Revision plans', 'Retained while your account is active. Deleted with your account.'],
                ['Subscription & billing records', 'Retained for 7 years from the transaction date to comply with UK tax law (even after account deletion).'],
                ['Server logs (Vercel)', 'Retained for 30 days by Vercel, then automatically deleted.'],
                ['Anonymous analytics (PostHog)', 'Retained for 12 months, then automatically purged.'],
              ].map(([type, policy]) => (
                <div key={type as string} className="flex gap-4 text-sm">
                  <span className="font-medium text-brand-900 shrink-0 w-48">{type}</span>
                  <span className="text-brand-600">{policy}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 8 */}
          <section id="international-transfers">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">8. International Transfers</h2>
            <p className="mb-4">
              Your study and account data is stored in the EU (Supabase on AWS eu-west). Some of our processors (Clerk,
              Anthropic, Vercel, Stripe) operate in the USA. Where data is transferred to the USA, we rely on Standard
              Contractual Clauses (SCCs) approved by the European Commission to ensure an adequate level of protection.
            </p>
            <p>
              For UK users, international transfers are made in accordance with the UK International Data Transfer
              Agreement (IDTA) or addendum to the EU SCCs, as applicable.
            </p>
          </section>

          {/* 9 */}
          <section id="childrens-data">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">9. Children&apos;s Data</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-blue-900 mb-1">Note for parents and guardians</p>
              <p className="text-sm text-blue-800">
                RevisionCity is an IGCSE revision platform. IGCSE students are typically aged 14–16. If your child is
                under 16 years old, we recommend that a parent or guardian review this policy and supervise account
                creation. Under the UK and EU GDPR, children under 16 require parental consent to use online information
                society services (the age of digital consent in the UK is 13).
              </p>
            </div>

            <p className="mb-4">
              We minimise the personal data we collect from all users, including minors. We do not display advertising,
              build behavioural profiles for third parties, or use children&apos;s data for any purpose other than
              providing the educational service.
            </p>
            <p className="mb-4">
              Study progress data (quiz scores, topics studied) is stored to power the core revision tracking features.
              This data is not shared with any third party except as described in Sections 4 and 5, and is never used
              for marketing or advertising purposes.
            </p>
            <p>
              If you believe a child under 13 has created an account without parental consent, please contact us at{' '}
              <a href="mailto:privacy@revisioncity.com" className="text-brand-600 underline hover:text-brand-900">
                privacy@revisioncity.com
              </a>{' '}
              and we will promptly delete the account and all associated data.
            </p>
          </section>

          {/* 10 */}
          <section id="your-rights">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">10. Your Rights Under GDPR</h2>
            <p className="mb-5">
              If you are in the UK or EU, you have the following rights regarding your personal data:
            </p>

            <div className="space-y-4">
              {[
                {
                  right: 'Right of access',
                  desc: 'You can request a copy of all personal data we hold about you, including your study progress, quiz scores, and account information.',
                },
                {
                  right: 'Right to rectification',
                  desc: 'If any of your data is inaccurate or incomplete, you can ask us to correct it.',
                },
                {
                  right: 'Right to erasure ("right to be forgotten")',
                  desc: 'You can request that we delete your account and all associated personal data. Note that billing records are retained for 7 years as required by UK tax law.',
                },
                {
                  right: 'Right to data portability',
                  desc: 'You can request your study progress and activity data in a structured, machine-readable format (JSON or CSV).',
                },
                {
                  right: 'Right to object',
                  desc: 'You can object to processing based on legitimate interests (e.g., platform analytics). We will stop unless we have compelling legitimate grounds.',
                },
                {
                  right: 'Right to restrict processing',
                  desc: 'You can ask us to restrict processing of your data in certain circumstances — for example, while we investigate a dispute.',
                },
                {
                  right: 'Right to withdraw consent',
                  desc: 'Where processing is based on your consent (e.g., marketing emails), you can withdraw consent at any time by unsubscribing or contacting us.',
                },
                {
                  right: 'Right to lodge a complaint',
                  desc: 'You have the right to lodge a complaint with the UK Information Commissioner\'s Office (ICO) at ico.org.uk, or your local EU supervisory authority.',
                },
              ].map(({ right, desc }) => (
                <div key={right} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-400 mt-2 shrink-0" />
                  <div>
                    <p className="font-semibold text-brand-900 text-sm">{right}</p>
                    <p className="text-sm text-brand-600 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 text-sm text-brand-500">
              We will respond to all data rights requests within 30 days. To exercise any of these rights, email{' '}
              <a href="mailto:privacy@revisioncity.com" className="text-brand-600 underline hover:text-brand-900">
                privacy@revisioncity.com
              </a>.
            </p>
          </section>

          {/* 11 */}
          <section id="data-deletion">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">11. How to Request Data Deletion</h2>
            <p className="mb-4">To delete your account and all associated data:</p>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li>
                <strong>From the app:</strong> Sign in → click your profile avatar (top right) → &ldquo;Manage Account&rdquo; →
                &ldquo;Delete Account&rdquo;. This immediately queues your account for deletion.
              </li>
              <li>
                <strong>By email:</strong> Send a request to{' '}
                <a href="mailto:privacy@revisioncity.com" className="text-brand-600 underline hover:text-brand-900">
                  privacy@revisioncity.com
                </a>{' '}
                with the subject line &ldquo;Data Deletion Request&rdquo; from your registered email address. We will
                process the request within 30 days.
              </li>
            </ol>
            <p className="text-sm text-brand-500">
              Note: Stripe billing records are retained for 7 years from the transaction date regardless of account
              deletion, as required by UK HMRC regulations. All other data (study progress, activity logs, revision
              plans, exam attempts) is permanently deleted.
            </p>
          </section>

          {/* 12 */}
          <section id="security">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">12. Security</h2>
            <p className="mb-4">
              We implement technical and organisational measures to protect your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>All data is encrypted in transit using TLS 1.2+</li>
              <li>Database data is encrypted at rest (Supabase/PostgreSQL)</li>
              <li>Row Level Security (RLS) is enforced on all database tables — each user can only access their own data</li>
              <li>API keys and service credentials are stored as environment variables, never in source code</li>
              <li>Authentication is delegated to Clerk, which provides bot protection, brute-force prevention, and secure session management</li>
              <li>Payment card data is handled exclusively by Stripe and never touches our servers</li>
            </ul>
            <p className="text-sm text-brand-500">
              If you discover a security vulnerability in RevisionCity, please report it responsibly to{' '}
              <a href="mailto:security@revisioncity.com" className="text-brand-600 underline hover:text-brand-900">
                security@revisioncity.com
              </a>.
            </p>
          </section>

          {/* 13 */}
          <section id="changes">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">13. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. When we make material changes (for example, adding a
              new third-party processor or changing data retention periods), we will:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Update the &ldquo;Last updated&rdquo; date at the top of this page</li>
              <li>Send a notification email to all registered users</li>
              <li>Where required by law, seek fresh consent</li>
            </ul>
            <p>
              Continued use of RevisionCity after a policy change constitutes acceptance of the updated terms, to the
              extent permitted by law.
            </p>
          </section>

          {/* 14 */}
          <section id="contact">
            <h2 className="font-display text-2xl font-bold text-brand-950 mb-4">14. Contact Us</h2>
            <p className="mb-4">
              For any questions about this Privacy Policy, data rights requests, or concerns about how we handle your
              personal data:
            </p>
            <div className="bg-brand-50 rounded-xl p-5 space-y-2 text-sm">
              <p><span className="font-semibold text-brand-900">Data Controller:</span> Revision City Ltd</p>
              <p>
                <span className="font-semibold text-brand-900">Privacy email:</span>{' '}
                <a href="mailto:privacy@revisioncity.com" className="text-brand-600 underline hover:text-brand-900">
                  privacy@revisioncity.com
                </a>
              </p>
              <p>
                <span className="font-semibold text-brand-900">General support:</span>{' '}
                <a href="mailto:support@revisioncity.com" className="text-brand-600 underline hover:text-brand-900">
                  support@revisioncity.com
                </a>
              </p>
              <p><span className="font-semibold text-brand-900">ICO registration:</span> Pending</p>
            </div>
            <p className="mt-4 text-sm text-brand-500">
              You also have the right to complain to the Information Commissioner&apos;s Office (ICO) at{' '}
              <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline hover:text-brand-900">
                ico.org.uk
              </a>{' '}
              if you believe we have not handled your data in accordance with UK data protection law.
            </p>
          </section>

          {/* Footer note */}
          <div className="border-t-2 border-brand-100 pt-8 mt-8">
            <p className="text-sm text-brand-400">
              This policy applies to revisioncity.com and all RevisionCity subdomains. It does not apply to
              third-party websites linked from our platform.{' '}
              <Link href="/terms" className="text-brand-500 hover:text-brand-700 underline">
                Terms of Service →
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
