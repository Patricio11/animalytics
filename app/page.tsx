"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { authClient } from "@/lib/auth/client";
import {
  PawPrint,
  Heart,
  BarChart3,
  Calendar,
  Trophy,
  ArrowRight,
  Star,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isPending && session) {
      router.replace('/dashboard');
    }
  }, [session, isPending, router]);
  const features = [
    {
      icon: PawPrint,
      title: "Animal Management",
      description: "Complete profiles, health records, and lineage tracking for your animals"
    },
    {
      icon: Heart,
      title: "Breeding Analytics",
      description: "Smart breeding recommendations and conception rate predictions"
    },
    {
      icon: BarChart3,
      title: "Performance Insights",
      description: "Detailed analytics and reporting to optimize your breeding program"
    },
    {
      icon: Calendar,
      title: "Schedule Management",
      description: "Never miss important dates with automated reminders and planning"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Professional Dog Breeder",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "Animalytics transformed how I manage my breeding program. The insights are incredible!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Kennel Owner",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "The best investment I've made for my business. Everything is so organized now.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Hobby Breeder",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "User-friendly and powerful. Perfect for both beginners and professionals.",
      rating: 5
    }
  ];

  const stats = [
    { value: "10K+", label: "Happy Breeders" },
    { value: "50K+", label: "Animals Tracked" },
    { value: "98%", label: "Success Rate" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1920&h=1080&fit=crop&crop=center&q=80"
            alt="Happy people with their dogs"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/80" />
          <div className="absolute inset-0 bg-gradient-subtle opacity-30" />
        </div>

        <div className="container relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-primary-blue-light text-primary-blue shadow-lg">
              <Sparkles className="h-3 w-3 mr-1" />
              Trusted by 10,000+ Professional Breeders
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 drop-shadow-lg">
              The Ultimate
              <span className="bg-gradient-brand bg-clip-text text-transparent"> Breeding </span>
              Management Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto drop-shadow-md">
              Transform your breeding program with AI-powered analytics, comprehensive animal management,
              and data-driven insights that help you achieve better results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-brand hover:opacity-90 text-lg px-8 shadow-elevated">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 shadow-card backdrop-blur-sm bg-background/80 hover:bg-background/90">
                  Breeder Dashboard
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center backdrop-blur-sm bg-background/40 rounded-lg p-4 shadow-card">
                  <div className="text-3xl font-bold text-primary drop-shadow-md">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface-secondary">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed by breeders, for breeders.
              Manage every aspect of your operation with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-brand">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-brand hover:opacity-90">
                Explore All Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Breeders Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our community has to say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">&quot;{testimonial.content}&quot;</p>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-brand">
        <div className="container text-center text-white">
          <Trophy className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Breeding Program?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of successful breeders who trust Animalytics for their operations.
            Start your free trial today and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-primary hover:bg-white/90">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-surface">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-32 h-auto flex items-center justify-center">
                <img
                  src="/animalytics.png"
                  alt="Animalytics Logo"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <a href="mailto:support@animalytics.co" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 Animalytics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}