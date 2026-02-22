"use client";

import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t bg-surface mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="w-32 h-auto">
                <img
                  src="/animalytics.png"
                  alt="Animalytics Logo"
                  className="w-full h-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The professional breeding and animal management platform trusted by breeders worldwide.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/breeders" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Find Breeders
                </Link>
              </li>
              <li>
                <Link href="/global-breeders" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Global Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Account</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/auth/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:support@animalytics.co" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Animalytics. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
