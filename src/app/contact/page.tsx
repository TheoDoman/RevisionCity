import { Mail, MessageSquare, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-brand-950 mb-4">Get in Touch</h1>
          <p className="text-xl text-brand-600">
            Have questions? We're here to help!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-brand-600" />
            </div>
            <h3 className="font-semibold text-brand-900 mb-2">Email Support</h3>
            <p className="text-brand-600 text-sm mb-4">Get help via email</p>
            <a
              href="mailto:support@revisioncity.com"
              className="text-brand-600 hover:text-brand-800 font-medium"
            >
              support@revisioncity.com
            </a>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-accent-600" />
            </div>
            <h3 className="font-semibold text-brand-900 mb-2">General Inquiries</h3>
            <p className="text-brand-600 text-sm mb-4">Business & partnerships</p>
            <a
              href="mailto:hello@revisioncity.com"
              className="text-brand-600 hover:text-brand-800 font-medium"
            >
              hello@revisioncity.com
            </a>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <HelpCircle className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-brand-900 mb-2">Help Center</h3>
            <p className="text-brand-600 text-sm mb-4">FAQs & guides</p>
            <a
              href="/faq"
              className="text-brand-600 hover:text-brand-800 font-medium"
            >
              View FAQs →
            </a>
          </div>
        </div>

        <div id="faq" className="bg-white rounded-2xl p-8 border border-brand-100 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-brand-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-brand-900 mb-2">How do I cancel my subscription?</h3>
              <p className="text-brand-600">
                You can cancel your subscription anytime from your account settings. Your access will continue until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-brand-900 mb-2">Can I switch between monthly and yearly plans?</h3>
              <p className="text-brand-600">
                Yes! You can upgrade or change your plan at any time. If switching from monthly to yearly, you'll receive a credit for unused time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-brand-900 mb-2">Which subjects do you cover?</h3>
              <p className="text-brand-600">
                We currently cover 9 core IGCSE subjects: Physics, Chemistry, Biology, Mathematics, Computer Science, Business Studies, Economics, Geography, and History.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-brand-900 mb-2">How does the AI Test Generator work?</h3>
              <p className="text-brand-600">
                Our AI Test Generator creates unique practice tests tailored to specific topics. Each test includes answer keys and detailed explanations to help you learn from your mistakes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-brand-900 mb-2">Is my payment information secure?</h3>
              <p className="text-brand-600">
                Yes! All payments are processed securely through Stripe, a PCI-DSS compliant payment processor. We never store your full card details on our servers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-brand-900 mb-2">Can I access Revision City on mobile?</h3>
              <p className="text-brand-600">
                Absolutely! Revision City is fully responsive and works seamlessly on all devices - desktop, tablet, and mobile.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-brand-900 mb-2">Do you offer student discounts?</h3>
              <p className="text-brand-600">
                Contact us at support@revisioncity.com to inquire about student discounts or school/district licensing options.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-8 text-center text-white">
          <h2 className="font-display text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-brand-50 mb-6">
            Our support team typically responds within 24 hours.
          </p>
          <a
            href="mailto:support@revisioncity.com"
            className="inline-flex items-center gap-2 bg-white text-brand-600 px-6 py-3 rounded-lg font-medium hover:bg-brand-50 transition-colors"
          >
            <Mail className="h-5 w-5" />
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
}
