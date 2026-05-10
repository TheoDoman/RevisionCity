export const metadata = {
  title: 'Terms of Service | RevisionCity',
  description: 'Terms of Service for RevisionCity — IGCSE revision platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-950 mb-2">
          Terms of Service
        </h1>
        <p className="text-brand-500 mb-10">Last updated: 23 March 2026</p>

        {/* Table of Contents */}
        <nav className="bg-white border-2 border-brand-100 rounded-2xl p-6 mb-10">
          <h2 className="font-display text-lg font-bold text-brand-900 mb-4">Contents</h2>
          <ol className="space-y-2 text-brand-700">
            {[
              ['acceptance', '1. Acceptance of Terms'],
              ['description', '2. Description of Service'],
              ['accounts', '3. Account Responsibilities'],
              ['acceptable-use', '4. Acceptable Use Policy'],
              ['ip', '5. Intellectual Property'],
              ['payment', '6. Cost'],
              ['ai-content', '7. AI-Generated Content Disclaimer'],
              ['liability', '8. Limitation of Liability'],
              ['termination', '9. Termination'],
              ['governing-law', '10. Governing Law'],
              ['changes', '11. Changes to These Terms'],
              ['contact', '12. Contact Us'],
            ].map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="text-brand-600 hover:text-brand-900 hover:underline transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="bg-white rounded-2xl border-2 border-brand-100 p-8 space-y-12">

          {/* 1. Acceptance */}
          <section id="acceptance">
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              By creating an account or using any part of the RevisionCity platform (the &ldquo;Service&rdquo;),
              you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the Service.
            </p>
            <p className="text-brand-700 leading-relaxed mb-3">
              The Service is operated by RevisionCity Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), a company registered in
              England and Wales. These Terms form a legally binding contract between you and RevisionCity Ltd.
            </p>
            <p className="text-brand-700 leading-relaxed">
              If you are under 18, you should read these Terms with a parent or guardian and obtain their
              consent before using the Service. If you are under 13, you may not create an account.
            </p>
          </section>

          {/* 2. Description */}
          <section id="description">
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              2. Description of Service
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              RevisionCity is a free IGCSE revision platform. Every feature is unlocked for every signed-in
              user, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700 mb-4">
              <li>Study notes, flashcards, quizzes, and practice questions for Cambridge and Edexcel IGCSE subjects.</li>
              <li>AI-generated practice tests, mind maps, summary sheets, and recall prompts.</li>
              <li>The AI Tutor (Socratic explanations and streamed chat).</li>
              <li>Unlimited mock exam simulations with AI grading and detailed topic and timing analysis.</li>
              <li>Grade prediction, progress analytics, and personalised revision plans.</li>
            </ul>
            <p className="text-brand-700 leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any feature at any time. We will
              endeavour to give reasonable notice of significant changes.
            </p>
          </section>

          {/* 3. Account Responsibilities */}
          <section id="accounts">
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              3. Account Responsibilities
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              Accounts are authenticated via Clerk (our identity provider). You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700 mb-4">
              <li>Providing accurate information when creating your account (name, email).</li>
              <li>Keeping your login credentials secure and not sharing them with others.</li>
              <li>
                All activity that occurs under your account — whether authorised by you or not.
              </li>
              <li>
                Notifying us immediately at{' '}
                <a href="mailto:support@revisioncity.com" className="text-brand-600 hover:underline">
                  support@revisioncity.com
                </a>{' '}
                if you suspect unauthorised access.
              </li>
            </ul>
            <p className="text-brand-700 leading-relaxed">
              Each account is for a single individual.
            </p>
          </section>

          {/* 4. Acceptable Use */}
          <section id="acceptable-use">
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              4. Acceptable Use Policy
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              You may only use RevisionCity for your own personal, non-commercial educational purposes.
              You must not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700 mb-4">
              <li>
                Attempt to gain unauthorised access to any part of the Service, its servers, or databases.
              </li>
              <li>
                Scrape, crawl, or automate requests to the Service in a way that imposes unreasonable load
                (e.g. bulk API calls to generate content at scale).
              </li>
              <li>
                Use our AI features to generate content for resale, redistribution, or commercial tutoring
                services without our written consent.
              </li>
              <li>
                Submit abusive, discriminatory, or illegal content to any AI feature (prompts are logged for
                moderation and safety purposes).
              </li>
              <li>Attempt to reverse-engineer the Service, extract source code, or bypass rate limits.</li>
              <li>
                Share, sell, or redistribute downloaded or exported content from the Service, including
                generated exams, notes, flashcards, or mind maps.
              </li>
              <li>Use the Service in any way that violates UK, EU, or applicable local law.</li>
            </ul>
            <p className="text-brand-700 leading-relaxed">
              We monitor usage for abuse. Violations may result in immediate account suspension.
            </p>
          </section>

          {/* 5. Intellectual Property */}
          <section id="ip">
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              5. Intellectual Property
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              All content on RevisionCity — including study notes, flashcard sets, quiz questions, practice
              questions, mind maps, summary sheets, recall prompts, and the AI-generated content produced
              by our systems — is the exclusive property of RevisionCity Ltd or is licensed to us, and is
              protected by copyright and other intellectual property laws.
            </p>
            <p className="text-brand-700 leading-relaxed mb-3">
              We grant you a limited, personal, non-exclusive, non-transferable licence to access and use
              the content solely for your own IGCSE revision. This licence does not permit you to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700 mb-4">
              <li>Copy or reproduce substantial portions of our content for distribution.</li>
              <li>
                Publish, share, or commercially exploit our content (including exam questions, notes, or
                AI outputs) on other platforms or services.
              </li>
              <li>Remove or obscure any copyright, trademark, or proprietary notices.</li>
              <li>Create derivative works based on our content for distribution.</li>
            </ul>
            <p className="text-brand-700 leading-relaxed">
              Exam board syllabuses and past paper content are the intellectual property of Cambridge
              Assessment International Education (CAIE) and Pearson Edexcel respectively. Our content is
              independently created for revision purposes and is not endorsed by either exam board.
            </p>
          </section>

          {/* 6. Cost */}
          <section id="payment">
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              6. Cost
            </h2>
            <p className="text-brand-700 leading-relaxed">
              RevisionCity is provided free of charge. There are no subscriptions, no paid tiers, and no
              billing. We do not collect or process payment information.
            </p>
          </section>

          {/* 7. AI-Generated Content Disclaimer */}
          <section id="ai-content">
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              7. AI-Generated Content Disclaimer
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              Several RevisionCity features use large language models (currently Claude by Anthropic) to
              generate or evaluate content:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-brand-700 mb-4">
              <li>
                <strong>Mock Exam Generator:</strong> Produces IGCSE-style exam papers on demand.
                Questions are AI-generated and are not official past papers. They may contain errors,
                omissions, or subject matter not on your specific syllabus.
              </li>
              <li>
                <strong>Mock Exam Grader:</strong> Automatically marks written responses against an
                AI-generated mark scheme. Marks awarded are indicative only — they do not reflect how an
                official IGCSE examiner would grade your work.
              </li>
              <li>
                <strong>AI Tutor:</strong> Provides Socratic explanations and answers subject questions in
                real time. Responses are generated automatically and may occasionally be factually
                incorrect, out of date, or inconsistent with the official syllabus.
              </li>
              <li>
                <strong>Revision Plans:</strong> AI-generated week-by-week study schedules are based on
                your stated exam date and subject list. They are indicative suggestions and should be
                adapted to your individual circumstances.
              </li>
              <li>
                <strong>AI Practice Tests:</strong> Auto-generated multiple-choice and short-answer
                questions for topic practice. These supplement, but do not replace, official practice papers.
              </li>
            </ul>
            <p className="text-brand-700 leading-relaxed mb-3">
              <strong>You acknowledge that:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700 mb-4">
              <li>
                AI-generated content is provided for <strong>supplementary revision purposes only</strong>.
                It is not a substitute for your official textbooks, teacher guidance, or past papers
                published by CAIE or Pearson Edexcel.
              </li>
              <li>
                We do not guarantee the accuracy, completeness, or syllabus alignment of any AI-generated
                content. You should cross-reference important information with authoritative sources.
              </li>
              <li>
                Grade predictions produced by the mock exam grader are statistical estimates based on your
                mock performance. They are not a reliable predictor of your actual IGCSE result.
              </li>
              <li>
                We are not responsible for any academic decisions you make based solely on AI-generated
                content or grade predictions.
              </li>
            </ul>
            <p className="text-brand-700 leading-relaxed">
              Conversations with the AI Tutor and exam submissions are transmitted to Anthropic for
              processing. See our{' '}
              <a href="/privacy-policy" className="text-brand-600 hover:underline">
                Privacy Policy
              </a>{' '}
              for details on how this data is handled.
            </p>
          </section>

          {/* 8. Limitation of Liability */}
          <section id="liability">
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. To the fullest extent permitted by
              English law, we disclaim all implied warranties including merchantability, fitness for a
              particular purpose, and non-infringement.
            </p>
            <p className="text-brand-700 leading-relaxed mb-3">
              We do not warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700 mb-4">
              <li>The Service will be uninterrupted or error-free.</li>
              <li>Any content is accurate, complete, or up to date with the current syllabus.</li>
              <li>Use of RevisionCity will result in any particular examination grade.</li>
            </ul>
            <p className="text-brand-700 leading-relaxed mb-3">
              To the maximum extent permitted by law, RevisionCity Ltd shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of data, loss of
              profits, or disappointment at examination results, whether arising in contract, tort, or
              otherwise.
            </p>
            <p className="text-brand-700 leading-relaxed">
              Our total aggregate liability to you for any claim arising out of or related to the Service
              is capped at the greater of: (a) the total fees you paid us in the 12 months preceding the
              claim, or (b) £50. Nothing in these Terms limits our liability for death or personal injury
              caused by our negligence, fraud, or any other liability that cannot be excluded by law.
            </p>
          </section>

          {/* 9. Termination */}
          <section id="termination">
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              9. Termination
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              <strong>By you:</strong> You may delete your account at any time via your account settings
              or by emailing{' '}
              <a href="mailto:support@revisioncity.com" className="text-brand-600 hover:underline">
                support@revisioncity.com
              </a>
              .
            </p>
            <p className="text-brand-700 leading-relaxed mb-3">
              <strong>By us:</strong> We may suspend or permanently terminate your account without notice if we
              reasonably believe you have:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700 mb-4">
              <li>Breached any provision of these Terms or our Acceptable Use Policy.</li>
              <li>Used the Service fraudulently or in a way that harms us or other users.</li>
              <li>Violated applicable law.</li>
            </ul>
            <p className="text-brand-700 leading-relaxed">
              On termination, your access to the Service ceases immediately. We will retain your data for
              30 days in case of dispute or re-activation, after which it will be deleted in accordance with
              our{' '}
              <a href="/privacy-policy" className="text-brand-600 hover:underline">
                Privacy Policy
              </a>
              . Sections 5 (Intellectual Property), 7 (AI Disclaimer), 8 (Limitation of Liability), and 10
              (Governing Law) survive termination.
            </p>
          </section>

          {/* 10. Governing Law */}
          <section id="governing-law">
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              10. Governing Law
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              These Terms are governed by and construed in accordance with the laws of England and Wales.
              Any dispute arising from or connected to these Terms or your use of the Service shall be
              subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
            <p className="text-brand-700 leading-relaxed">
              If you are a consumer resident in another jurisdiction, you may also have the benefit of
              mandatory consumer protection laws in your country of residence that cannot be excluded by
              choice of law.
            </p>
          </section>

          {/* 11. Changes to Terms */}
          <section id="changes">
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              11. Changes to These Terms
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              We may update these Terms from time to time. For material changes, we will:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700 mb-4">
              <li>Update the &ldquo;Last updated&rdquo; date at the top of this page.</li>
              <li>Send an email to your registered address at least 14 days before changes take effect.</li>
            </ul>
            <p className="text-brand-700 leading-relaxed">
              Continued use of the Service after the effective date of any change constitutes your acceptance
              of the revised Terms. If you do not agree to the revised Terms, you must stop using the Service
              before the effective date.
            </p>
          </section>

          {/* 12. Contact */}
          <section id="contact">
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              12. Contact Us
            </h2>
            <p className="text-brand-700 leading-relaxed mb-4">
              If you have questions about these Terms or need help with your account:
            </p>
            <div className="bg-brand-50 rounded-xl p-5 space-y-2">
              <p className="font-semibold text-brand-900">RevisionCity Ltd</p>
              <p className="text-brand-700">
                General / support:{' '}
                <a href="mailto:support@revisioncity.com" className="text-brand-600 hover:underline">
                  support@revisioncity.com
                </a>
              </p>
              <p className="text-brand-700">
                Privacy / data requests:{' '}
                <a href="mailto:privacy@revisioncity.com" className="text-brand-600 hover:underline">
                  privacy@revisioncity.com
                </a>
              </p>
              <p className="text-brand-700">
                Website:{' '}
                <a href="https://revisioncity.com" className="text-brand-600 hover:underline">
                  revisioncity.com
                </a>
              </p>
            </div>
            <p className="text-brand-600 text-sm mt-4">
              These Terms, together with our{' '}
              <a href="/privacy-policy" className="text-brand-600 hover:underline">
                Privacy Policy
              </a>
              , constitute the entire agreement between you and RevisionCity Ltd regarding the Service.
              If any provision is found unenforceable, the remaining provisions continue in full force and effect.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
