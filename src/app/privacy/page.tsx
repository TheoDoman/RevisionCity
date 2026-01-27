export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-brand-950 mb-8">Privacy Policy</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-brand-600 mb-8">
            <strong>Last Updated:</strong> January 25, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-4">1. Introduction</h2>
            <p className="text-brand-700 mb-4">
              Revision City Ltd ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our IGCSE revision platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-brand-800 mb-3">2.1 Personal Information</h3>
            <p className="text-brand-700 mb-4">We may collect the following personal information:</p>
            <ul className="list-disc pl-6 text-brand-700 mb-4">
              <li>Name and email address</li>
              <li>Account credentials</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Study progress and performance data</li>
            </ul>

            <h3 className="text-xl font-semibold text-brand-800 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-brand-700 mb-4">
              <li>Device information and browser type</li>
              <li>IP address and location data</li>
              <li>Usage statistics and analytics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-brand-700 mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-brand-700 mb-4">
              <li>Provide and maintain our services</li>
              <li>Process your subscription payments</li>
              <li>Track your study progress and personalize your experience</li>
              <li>Send you updates and educational content</li>
              <li>Improve our platform and develop new features</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-4">4. Data Storage and Security</h2>
            <p className="text-brand-700 mb-4">
              Your data is securely stored using Supabase, a trusted database provider with enterprise-grade security. We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 text-brand-700 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Secure backup procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-4">5. Payment Processing</h2>
            <p className="text-brand-700 mb-4">
              All payment transactions are processed securely through Stripe. We do not store your full credit card details on our servers. Stripe is PCI-DSS compliant and handles all payment information securely.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-4">6. Cookies and Tracking</h2>
            <p className="text-brand-700 mb-4">
              We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-4">7. Your Rights (GDPR)</h2>
            <p className="text-brand-700 mb-4">
              Under the General Data Protection Regulation (GDPR), you have the right to:
            </p>
            <ul className="list-disc pl-6 text-brand-700 mb-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Withdraw Consent:</strong> Opt-out of marketing communications</li>
              <li><strong>Object:</strong> Object to processing of your data</li>
            </ul>
            <p className="text-brand-700 mb-4">
              To exercise these rights, contact us at privacy@revisioncity.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-4">8. Data Retention</h2>
            <p className="text-brand-700 mb-4">
              We retain your personal data only for as long as necessary to provide our services and comply with legal obligations. When you cancel your subscription, we will delete or anonymize your data within 90 days, unless required to retain it by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-4">9. Third-Party Services</h2>
            <p className="text-brand-700 mb-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-brand-700 mb-4">
              <li><strong>Supabase:</strong> Database and authentication</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Anthropic:</strong> AI-powered test generation</li>
            </ul>
            <p className="text-brand-700 mb-4">
              Each service has its own privacy policy governing the use of your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-4">10. Children's Privacy</h2>
            <p className="text-brand-700 mb-4">
              Our services are intended for students aged 13 and above. If you are under 13, please have a parent or guardian create an account on your behalf. We do not knowingly collect personal information from children under 13 without parental consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-4">11. International Data Transfers</h2>
            <p className="text-brand-700 mb-4">
              Your data may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers in compliance with GDPR and other applicable data protection laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-4">12. Changes to This Policy</h2>
            <p className="text-brand-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-4">13. Contact Us</h2>
            <p className="text-brand-700 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="list-none text-brand-700 mb-4">
              <li><strong>Email:</strong> privacy@revisioncity.com</li>
              <li><strong>Support:</strong> support@revisioncity.com</li>
              <li><strong>Address:</strong> Revision City Ltd, [Your Business Address]</li>
            </ul>
          </section>

          <div className="bg-brand-50 border-l-4 border-brand-500 p-6 mt-8">
            <p className="text-brand-800 font-semibold mb-2">Your Privacy Matters</p>
            <p className="text-brand-700">
              We are committed to protecting your personal information and being transparent about our data practices. If you have any concerns, please don't hesitate to reach out to our privacy team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
