"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="border-b bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="w-40 h-auto flex items-center justify-center">
            <img
              src="/animalytics.png"
              alt="Animalytics Logo"
              className="w-full h-auto object-contain"
            />
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/global-breeders" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Find Breeders
          </Link>
          <Link href="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Marketplace
          </Link>
          <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="/#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Reviews
          </a>
          <a href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          <Link href="/auth/signin">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-gradient-brand hover:opacity-90">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
