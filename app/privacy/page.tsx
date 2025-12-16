"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last Updated: January 13, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to Animalytics ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our breeding management platform.
            </p>
            <p className="mb-4">
              By accessing or using Animalytics, you agree to the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-3">2.1 Information You Provide</h3>
            <p className="mb-4">We collect information that you voluntarily provide when you:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Create an account (name, email address, password)</li>
              <li>Complete your breeder profile (business name, location, contact information)</li>
              <li>Add animal records (animal data, health records, pedigree information)</li>
              <li>Use our calculators and tools (breeding data, progesterone test results)</li>
              <li>Upload photos and documents</li>
              <li>Communicate with us (support requests, feedback)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.2 Automatically Collected Information</h3>
            <p className="mb-4">When you use Animalytics, we automatically collect:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Device information (browser type, operating system, device identifiers)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>IP address and approximate location</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.3 Third-Party Authentication</h3>
            <p className="mb-4">
              When you sign in using Google OAuth, we receive basic profile information (name, email address, profile picture) from Google. We do not receive your Google password.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Create and manage your account</li>
              <li>Process your breeding data and generate analytics</li>
              <li>Send you notifications about your animals and breeding programs</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Detect and prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
              <li>Send you marketing communications (with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>

            <h3 className="text-xl font-semibold mb-3">4.1 Public Information</h3>
            <p className="mb-4">
              Your breeder profile may be visible to other users if you choose to make it public. This includes your business name, location, breeds you work with, and public contact information.
            </p>

            <h3 className="text-xl font-semibold mb-3">4.2 Service Providers</h3>
            <p className="mb-4">
              We share information with third-party service providers who help us operate our platform:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Cloud hosting providers (data storage and processing)</li>
              <li>Authentication services (Google OAuth)</li>
              <li>Email service providers (notifications and communications)</li>
              <li>Analytics providers (usage statistics and improvements)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.3 Legal Requirements</h3>
            <p className="mb-4">
              We may disclose your information if required by law, court order, or government regulation, or to protect our rights, safety, or property.
            </p>

            <h3 className="text-xl font-semibold mb-3">4.4 Business Transfers</h3>
            <p className="mb-4">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Secure password hashing</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure cloud infrastructure</li>
            </ul>
            <p className="mb-4">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
              <li><strong>Object:</strong> Object to certain processing of your data</li>
            </ul>
            <p className="mb-4">
              To exercise these rights, contact us at privacy@animalytics.co or through your account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns</li>
              <li>Improve our services</li>
            </ul>
            <p className="mb-4">
              You can control cookies through your browser settings, but disabling cookies may affect functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
            <p className="mb-4">
              We retain your information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Legal compliance and record-keeping</li>
              <li>Dispute resolution</li>
              <li>Fraud prevention</li>
              <li>Enforcing our agreements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="mb-4">
              Animalytics is not intended for users under 18 years of age. We do not knowingly collect information from children. If we discover that we have collected information from a child, we will delete it promptly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
            <p className="mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in compliance with applicable data protection laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Posting the updated policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending you an email notification (for material changes)</li>
            </ul>
            <p className="mb-4">
              Your continued use of Animalytics after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-surface p-6 rounded-lg border">
              <p className="mb-2"><strong>Email:</strong> privacy@animalytics.co</p>
              <p className="mb-2"><strong>Support:</strong> support@animalytics.co</p>
              <p className="mb-0"><strong>Response Time:</strong> We aim to respond within 48 hours</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Your California Privacy Rights</h2>
            <p className="mb-4">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to say no to the sale of personal information</li>
              <li>Right to access your personal information</li>
              <li>Right to equal service and price</li>
            </ul>
            <p className="mb-4">
              Note: We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. GDPR Rights (European Users)</h2>
            <p className="mb-4">
              If you are in the European Economic Area (EEA), you have additional rights under GDPR:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Right to data portability</li>
              <li>Right to withdraw consent</li>
              <li>Right to lodge a complaint with supervisory authority</li>
              <li>Right to restriction of processing</li>
            </ul>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/terms">
            <Button variant="outline">
              View Terms of Service
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
