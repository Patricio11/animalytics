"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="w-32 h-auto flex items-center justify-center">
                <img
                  src="/animalytics.png"
                  alt="Animalytics Logo"
                  className="w-full h-auto object-contain"
                />
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">
            Last Updated: January 13, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              Welcome to Animalytics. By accessing or using our breeding management platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
            </p>
            <p className="mb-4">
              These Terms constitute a legally binding agreement between you and Animalytics ("we," "us," or "our"). We reserve the right to update these Terms at any time, and your continued use of the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
            <p className="mb-4">
              To use Animalytics, you must:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Not be prohibited from using the Service under applicable laws</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration and Security</h2>

            <h3 className="text-xl font-semibold mb-3">3.1 Account Creation</h3>
            <p className="mb-4">
              You may create an account using email/password or through third-party authentication (Google OAuth). You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 Account Responsibility</h3>
            <p className="mb-4">
              You are responsible for all activities that occur under your account. We are not liable for any loss or damage arising from your failure to maintain account security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Roles and Permissions</h2>
            <p className="mb-4">
              Animalytics supports multiple user roles:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Breeder:</strong> Manage breeding programs, animals, and health records</li>
              <li><strong>Veterinarian:</strong> Access professional tools and client animal records</li>
              <li><strong>Event Organizer:</strong> Manage events and competitions</li>
              <li><strong>Admin:</strong> Platform administration and support</li>
            </ul>
            <p className="mb-4">
              Each role has specific permissions and access levels. You are responsible for using features appropriate to your role.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use Policy</h2>

            <h3 className="text-xl font-semibold mb-3">5.1 Permitted Uses</h3>
            <p className="mb-4">
              You may use Animalytics for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Managing your breeding operations and animal records</li>
              <li>Tracking health records and veterinary information</li>
              <li>Analyzing breeding data and performance metrics</li>
              <li>Collaborating with other users within the platform</li>
              <li>Using our calculators and analytical tools</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">5.2 Prohibited Activities</h3>
            <p className="mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Scrape, mine, or extract data from the platform</li>
              <li>Impersonate other users or entities</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Share false, misleading, or fraudulent information</li>
              <li>Use the Service for illegal breeding activities</li>
              <li>Resell or redistribute our services without permission</li>
              <li>Reverse engineer or decompile the platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. User Content and Data</h2>

            <h3 className="text-xl font-semibold mb-3">6.1 Your Content</h3>
            <p className="mb-4">
              You retain ownership of all content you submit to Animalytics, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Animal profiles and records</li>
              <li>Photos and documents</li>
              <li>Health records and breeding data</li>
              <li>Comments and communications</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.2 License Grant</h3>
            <p className="mb-4">
              By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Store and process your content to provide the Service</li>
              <li>Display your content to other users (based on your privacy settings)</li>
              <li>Create backups and ensure data redundancy</li>
              <li>Generate analytics and insights from aggregated data</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.3 Content Standards</h3>
            <p className="mb-4">
              All content must:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Be accurate and truthful</li>
              <li>Comply with applicable laws and regulations</li>
              <li>Not contain offensive, defamatory, or illegal material</li>
              <li>Respect animal welfare standards</li>
              <li>Not violate third-party rights</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.4 Data Backup</h3>
            <p className="mb-4">
              While we maintain regular backups, you are responsible for maintaining your own copies of important data. We recommend exporting your data regularly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Subscription Plans and Payments</h2>

            <h3 className="text-xl font-semibold mb-3">7.1 Free and Paid Plans</h3>
            <p className="mb-4">
              Animalytics offers different subscription tiers:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Free:</strong> Basic features with limitations</li>
              <li><strong>Premium:</strong> Advanced features and increased limits</li>
              <li><strong>Professional:</strong> Full feature access for serious breeders</li>
              <li><strong>Enterprise:</strong> Custom solutions for large operations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">7.2 Billing</h3>
            <p className="mb-4">
              For paid subscriptions:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Payments are processed securely through third-party providers</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>Prices are subject to change with 30 days notice</li>
              <li>All fees are non-refundable unless required by law</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">7.3 Cancellation</h3>
            <p className="mb-4">
              You may cancel your subscription at any time. Access to premium features will continue until the end of your billing period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property Rights</h2>

            <h3 className="text-xl font-semibold mb-3">8.1 Our Property</h3>
            <p className="mb-4">
              Animalytics and all related content, features, and functionality are owned by us and protected by copyright, trademark, and other intellectual property laws. This includes:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Software code and architecture</li>
              <li>User interface and design</li>
              <li>Logos, trademarks, and branding</li>
              <li>Algorithms and analytical tools</li>
              <li>Documentation and guides</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">8.2 Restrictions</h3>
            <p className="mb-4">
              You may not:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Copy, modify, or create derivative works</li>
              <li>Remove copyright or proprietary notices</li>
              <li>Use our trademarks without permission</li>
              <li>Frame or mirror our website</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services</h2>
            <p className="mb-4">
              Animalytics integrates with third-party services:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Google OAuth for authentication</li>
              <li>Cloud storage providers</li>
              <li>Payment processors</li>
              <li>Email delivery services</li>
            </ul>
            <p className="mb-4">
              Your use of third-party services is subject to their terms and policies. We are not responsible for third-party service issues or failures.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Disclaimers and Limitations</h2>

            <h3 className="text-xl font-semibold mb-3">10.1 Service "As Is"</h3>
            <p className="mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy or completeness</li>
              <li>Uninterrupted or error-free operation</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">10.2 Not Veterinary Advice</h3>
            <p className="mb-4">
              Animalytics provides breeding management tools and data analysis. We do NOT provide veterinary advice, medical diagnoses, or treatment recommendations. Always consult qualified veterinary professionals for animal health matters.
            </p>

            <h3 className="text-xl font-semibold mb-3">10.3 Breeding Recommendations</h3>
            <p className="mb-4">
              Our breeding calculators and analytics are tools to assist decision-making. We do not guarantee breeding outcomes, conception rates, or health results. You are solely responsible for breeding decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Limitation of Liability</h2>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ANIMALYTICS SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, data, use, or goodwill</li>
              <li>Service interruptions or errors</li>
              <li>Unauthorized access to your data</li>
              <li>Third-party actions or content</li>
              <li>Breeding decisions based on our tools</li>
            </ul>
            <p className="mb-4">
              Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Indemnification</h2>
            <p className="mb-4">
              You agree to indemnify and hold harmless Animalytics, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any laws or third-party rights</li>
              <li>Your content or breeding activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Termination</h2>

            <h3 className="text-xl font-semibold mb-3">13.1 Termination by You</h3>
            <p className="mb-4">
              You may terminate your account at any time through account settings or by contacting support.
            </p>

            <h3 className="text-xl font-semibold mb-3">13.2 Termination by Us</h3>
            <p className="mb-4">
              We may suspend or terminate your account if you:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Violate these Terms</li>
              <li>Engage in fraudulent activity</li>
              <li>Fail to pay subscription fees</li>
              <li>Cause harm to other users or the platform</li>
              <li>Remain inactive for an extended period</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">13.3 Effect of Termination</h3>
            <p className="mb-4">
              Upon termination:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Your access to the Service ends immediately</li>
              <li>We may delete your account and data after 30 days</li>
              <li>You should export your data before termination</li>
              <li>Fees paid are non-refundable</li>
              <li>Provisions that should survive termination will remain in effect</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Dispute Resolution</h2>

            <h3 className="text-xl font-semibold mb-3">14.1 Informal Resolution</h3>
            <p className="mb-4">
              Before filing a claim, please contact us at support@animalytics.com to resolve the issue informally. We commit to working in good faith to reach a resolution.
            </p>

            <h3 className="text-xl font-semibold mb-3">14.2 Arbitration</h3>
            <p className="mb-4">
              Any disputes that cannot be resolved informally shall be settled by binding arbitration in accordance with applicable arbitration rules. You waive your right to participate in class actions.
            </p>

            <h3 className="text-xl font-semibold mb-3">14.3 Governing Law</h3>
            <p className="mb-4">
              These Terms are governed by and construed in accordance with the laws of the jurisdiction where Animalytics is registered, without regard to conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Updating the "Last Updated" date</li>
              <li>Posting a notice on the platform</li>
              <li>Sending an email notification (for significant changes)</li>
            </ul>
            <p className="mb-4">
              Your continued use after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">16. General Provisions</h2>

            <h3 className="text-xl font-semibold mb-3">16.1 Entire Agreement</h3>
            <p className="mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Animalytics.
            </p>

            <h3 className="text-xl font-semibold mb-3">16.2 Severability</h3>
            <p className="mb-4">
              If any provision is found unenforceable, the remaining provisions remain in full effect.
            </p>

            <h3 className="text-xl font-semibold mb-3">16.3 No Waiver</h3>
            <p className="mb-4">
              Our failure to enforce any right or provision does not constitute a waiver of that right or provision.
            </p>

            <h3 className="text-xl font-semibold mb-3">16.4 Assignment</h3>
            <p className="mb-4">
              You may not assign these Terms without our consent. We may assign our rights without restriction.
            </p>

            <h3 className="text-xl font-semibold mb-3">16.5 Force Majeure</h3>
            <p className="mb-4">
              We are not liable for delays or failures due to circumstances beyond our reasonable control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">17. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms, please contact us:
            </p>
            <div className="bg-surface p-6 rounded-lg border">
              <p className="mb-2"><strong>Email:</strong> legal@animalytics.com</p>
              <p className="mb-2"><strong>Support:</strong> support@animalytics.com</p>
              <p className="mb-0"><strong>Response Time:</strong> We aim to respond within 48 hours</p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm font-medium mb-2">
              By using Animalytics, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <p className="text-sm text-muted-foreground">
              Last Updated: January 13, 2025
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/privacy">
            <Button variant="outline">
              View Privacy Policy
            </Button>
          </Link>
          <Link href="/">
            <Button>
              Return to Homepage
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-surface mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Animalytics. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
