export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-950 mb-4">
          Terms of Service
        </h1>
        <p className="text-brand-600 mb-8">
          Last updated: 25 January 2026
        </p>

        <div className="bg-white rounded-2xl border-2 border-brand-100 p-8 space-y-8">
          {/* 1. Agreement to Terms */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              By accessing or using Revision City ("the Service"), you agree to be bound by these Terms of Service ("Terms").
              If you disagree with any part of these terms, you may not access the Service.
            </p>
            <p className="text-brand-700 leading-relaxed">
              Revision City Ltd ("we", "us", or "our") operates the Service. These Terms apply to all visitors, users,
              and others who access or use the Service.
            </p>
          </section>

          {/* 2. Service Description */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              2. Service Description
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              Revision City is an IGCSE revision platform providing educational content, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700">
              <li>Study notes and revision materials</li>
              <li>Flashcards and quizzes</li>
              <li>Practice questions and tests</li>
              <li>AI-powered test generation tools (Pro tier)</li>
              <li>AI tutor assistance (Premium tier)</li>
              <li>Progress tracking and analytics</li>
            </ul>
            <p className="text-brand-700 leading-relaxed mt-3">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.
            </p>
          </section>

          {/* 3. User Accounts */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              3. User Accounts
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              To access certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="text-brand-700 leading-relaxed mt-3">
              You must be at least 13 years old to create an account. Users under 18 should obtain parental or guardian
              consent before using the Service.
            </p>
          </section>

          {/* 4. Subscription Terms */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              4. Subscription Terms
            </h2>

            <h3 className="font-display text-lg font-semibold text-brand-800 mb-2 mt-4">
              4.1 Subscription Tiers
            </h3>
            <p className="text-brand-700 leading-relaxed mb-3">
              We offer multiple subscription tiers: Free Trial, Pro (€5.99/month or €47.99/year), and Premium (€9.99/month or €79.99/year).
              Annual billing provides a 33% discount compared to monthly pricing.
            </p>

            <h3 className="font-display text-lg font-semibold text-brand-800 mb-2 mt-4">
              4.2 Billing and Renewal
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-brand-700">
              <li>Subscriptions automatically renew at the end of each billing period unless cancelled</li>
              <li>You will be charged the then-current subscription fee</li>
              <li>We reserve the right to change subscription fees with 30 days notice</li>
              <li>Payments are processed securely through Stripe</li>
              <li>All fees are in British Pounds (GBP) and are non-refundable except as required by law</li>
            </ul>

            <h3 className="font-display text-lg font-semibold text-brand-800 mb-2 mt-4">
              4.3 Cancellation
            </h3>
            <p className="text-brand-700 leading-relaxed">
              You may cancel your subscription at any time through your account settings. Cancellation will take effect
              at the end of the current billing period. You will retain access to paid features until that date.
            </p>
          </section>

          {/* 5. Refund Policy */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              5. Refund Policy
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              We offer a 14-day money-back guarantee for first-time subscribers. To request a refund:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700">
              <li>The request must be made within 14 days of your initial purchase</li>
              <li>Refunds are only available for first-time purchases, not renewals</li>
              <li>Contact our support team with your refund request</li>
              <li>Refunds will be processed within 5-10 business days to your original payment method</li>
            </ul>
            <p className="text-brand-700 leading-relaxed mt-3">
              Subscription renewals and annual subscriptions beyond the first 14 days are non-refundable.
            </p>
          </section>

          {/* 6. Intellectual Property */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              6. Intellectual Property Rights
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              All content on the Service, including text, graphics, logos, images, software, and educational materials,
              is the property of Revision City Ltd or its content suppliers and is protected by copyright, trademark,
              and other intellectual property laws.
            </p>
            <p className="text-brand-700 leading-relaxed mb-3">
              You are granted a limited, non-exclusive, non-transferable license to access and use the Service for
              personal, non-commercial educational purposes only. You may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700">
              <li>Copy, modify, distribute, or reproduce any content without permission</li>
              <li>Use the Service or content for commercial purposes</li>
              <li>Attempt to reverse engineer or extract source code</li>
              <li>Remove or alter copyright notices or proprietary markings</li>
              <li>Share your account access with others</li>
            </ul>
          </section>

          {/* 7. User Conduct */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              7. User Conduct
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Transmit harmful code, viruses, or malicious software</li>
              <li>Attempt to gain unauthorized access to the Service or related systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Engage in any automated use of the system, including scraping or data mining</li>
              <li>Harass, abuse, or harm other users</li>
            </ul>
          </section>

          {/* 8. AI-Generated Content */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              8. AI-Generated Content
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              Our Service includes AI-powered features such as test generation and tutoring. You acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700">
              <li>AI-generated content is provided for educational purposes and may not be perfect</li>
              <li>You should verify important information and not rely solely on AI-generated responses</li>
              <li>We do not guarantee the accuracy, completeness, or reliability of AI-generated content</li>
              <li>The AI tutor is a study aid and not a replacement for qualified teachers or tutors</li>
            </ul>
          </section>

          {/* 9. Disclaimer of Warranties */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              9. Disclaimer of Warranties
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED.
              TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700">
              <li>Merchantability and fitness for a particular purpose</li>
              <li>Non-infringement of intellectual property rights</li>
              <li>Accuracy, reliability, or completeness of content</li>
              <li>Uninterrupted, secure, or error-free operation</li>
            </ul>
            <p className="text-brand-700 leading-relaxed mt-3">
              We do not guarantee that the Service will meet your specific requirements or that it will help you achieve
              particular examination results.
            </p>
          </section>

          {/* 10. Limitation of Liability */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              10. Limitation of Liability
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, REVISION CITY LTD SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY
              OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="text-brand-700 leading-relaxed">
              Our total liability to you for all claims arising from or related to the Service shall not exceed the amount
              you paid us in the twelve (12) months prior to the claim, or £100, whichever is greater.
            </p>
          </section>

          {/* 11. Termination */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              11. Termination
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              We reserve the right to suspend or terminate your account and access to the Service at our sole discretion,
              without notice, for conduct that we believe:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700">
              <li>Violates these Terms or our policies</li>
              <li>Is harmful to other users, us, or third parties</li>
              <li>Violates applicable laws or regulations</li>
              <li>Involves suspected fraudulent payment activity</li>
            </ul>
            <p className="text-brand-700 leading-relaxed mt-3">
              Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that
              by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers,
              and limitations of liability.
            </p>
          </section>

          {/* 12. Governing Law */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              12. Governing Law
            </h2>
            <p className="text-brand-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of England and Wales, without
              regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be
              subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          {/* 13. Changes to Terms */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              13. Changes to Terms
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              We reserve the right to modify these Terms at any time. We will notify users of material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-700">
              <li>Posting the updated Terms on the Service</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending email notification for significant changes</li>
            </ul>
            <p className="text-brand-700 leading-relaxed mt-3">
              Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.
            </p>
          </section>

          {/* 14. Contact Information */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              14. Contact Information
            </h2>
            <p className="text-brand-700 leading-relaxed mb-3">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-brand-50 rounded-lg p-4 space-y-1">
              <p className="text-brand-800 font-medium">Revision City Ltd</p>
              <p className="text-brand-700">Email: support@revisioncity.com</p>
              <p className="text-brand-700">Website: www.revisioncity.com</p>
            </div>
          </section>

          {/* 15. Severability */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              15. Severability
            </h2>
            <p className="text-brand-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or
              eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.
            </p>
          </section>

          {/* 16. Entire Agreement */}
          <section>
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4">
              16. Entire Agreement
            </h2>
            <p className="text-brand-700 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Revision City Ltd
              regarding the Service and supersede all prior agreements and understandings, whether written or oral.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
