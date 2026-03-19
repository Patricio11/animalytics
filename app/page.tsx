"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/JsonLd";
import { authClient } from "@/lib/auth/client";
import {
  PawPrint,
  Heart,
  BarChart3,
  Calendar,
  Trophy,
  ArrowRight,
  Star,
  Sparkles,
  ShieldCheck,
  Lock,
  ChevronRight,
  MapPin,
  Zap,
} from "lucide-react";
import { VerifiedCheckmark } from "@/components/ui/verified-badge";
import Link from "next/link";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function LandingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  // Fetch featured marketplace listings
  const { data: featuredListingsData } = useQuery({
    queryKey: ["featured-listings"],
    queryFn: async () => {
      const res = await fetch("/api/marketplace/listings/featured");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const featuredListings = featuredListingsData?.listings || [];

  // Fetch featured (boosted) breeders
  const { data: featuredBreedersData } = useQuery({
    queryKey: ["featured-breeders"],
    queryFn: async () => {
      const res = await fetch("/api/breeders/featured");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const featuredBreeders = featuredBreedersData?.breeders || [];

  const features = [
    {
      icon: PawPrint,
      title: "Animal Management",
      description: "Complete profiles, health records, and lineage tracking for your animals",
      gradient: "from-blue-500 to-cyan-400",
      bgGlow: "bg-blue-500/10",
    },
    {
      icon: Heart,
      title: "Breeding Analytics",
      description: "Smart breeding recommendations and conception rate predictions",
      gradient: "from-pink-500 to-rose-400",
      bgGlow: "bg-pink-500/10",
    },
    {
      icon: BarChart3,
      title: "Performance Insights",
      description: "Detailed analytics and reporting to optimize your breeding program",
      gradient: "from-violet-500 to-purple-400",
      bgGlow: "bg-violet-500/10",
    },
    {
      icon: Calendar,
      title: "Schedule Management",
      description: "Never miss important dates with automated reminders and planning",
      gradient: "from-amber-500 to-orange-400",
      bgGlow: "bg-amber-500/10",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Professional Dog Breeder",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "Animalytics transformed how I manage my breeding program. The insights are incredible!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Kennel Owner",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "The best investment I've made for my business. Everything is so organized now.",
      rating: 5,
    },
    {
      name: "Emma Davis",
      role: "Hobby Breeder",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "User-friendly and powerful. Perfect for both beginners and professionals.",
      rating: 5,
    },
  ];

  const stats = [
    { value: "10K+", label: "Happy Breeders" },
    { value: "50K+", label: "Animals Tracked" },
    { value: "98%", label: "Success Rate" },
    { value: "24/7", label: "Support" },
  ];

  const trustItems = [
    {
      icon: ShieldCheck,
      title: "Verified Breeders",
      description: "Every breeder goes through our KYC verification process, ensuring only legitimate, responsible breeders are on the platform.",
      stat: "100%",
      statLabel: "Verified",
    },
    {
      icon: Heart,
      title: "Health First",
      description: "Comprehensive health tracking, certifications, and genetic testing records — giving buyers complete confidence.",
      stat: "50K+",
      statLabel: "Health Records",
    },
    {
      icon: Lock,
      title: "Bank-Grade Security",
      description: "Enterprise-level encryption protects your data, breeder records, and every transaction on the platform.",
      stat: "256-bit",
      statLabel: "Encryption",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden min-h-[85vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&h=1080&fit=crop&crop=center&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Dark overlay with gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          {/* Brand color tint */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/10 via-transparent to-primary-pink/10" />
        </div>

        {/* Animated floating shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-32 h-32 bg-primary-blue/10 rounded-full blur-2xl hidden lg:block"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-primary-pink/10 rounded-full blur-2xl hidden lg:block"
        />

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-white drop-shadow-2xl">
              Find Your Perfect
              <br />
              <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Companion
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
            >
              Browse animals from verified breeders, explore the marketplace,
              and discover your next family member — all in one place.
            </motion.p>
          </motion.div>

          {/* Hero Search */}
          <HeroSearch />

          {/* Quick stats under search */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex items-center justify-center gap-6 md:gap-10 mt-10 flex-wrap"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-white/60 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Listings Section */}
      {featuredListings.length > 0 && (
        <section className="py-20 bg-surface-secondary">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <Badge className="mb-3 bg-gradient-brand/10 text-primary border-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                  <Zap className="w-3 h-3 mr-1.5" />
                  Marketplace
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold">Featured Listings</h2>
                <p className="text-muted-foreground mt-2 max-w-lg">
                  Hand-picked listings from top verified breeders — animals, stud services, and more.
                </p>
              </div>
              <Link href="/marketplace" className="hidden md:block">
                <Button variant="ghost" className="text-primary">
                  Browse Marketplace <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {featuredListings.map((listing: any) => {
                const img = listing.images?.[0];
                const isPlaceholder = !img || img === '/placeholder-dog.jpg';
                const catColors: Record<string, string> = {
                  'dog-for-sale': 'bg-blue-500',
                  'pups-for-sale': 'bg-emerald-500',
                  'stud-dog': 'bg-violet-500',
                  'reproductive-services': 'bg-amber-500',
                  'frozen-semen': 'bg-cyan-500',
                  'other': 'bg-slate-500',
                };
                const catIcons: Record<string, string> = {
                  'dog-for-sale': '🐕', 'pups-for-sale': '🐶',
                  'stud-dog': '👑', 'reproductive-services': '💉',
                  'frozen-semen': '❄️', 'other': '📦',
                };
                const cat = listing.category?.replace(/_/g, '-') || 'other';
                const locationStr = listing.breederLocation
                  ? [listing.breederLocation.city, listing.breederLocation.state].filter(Boolean).join(', ')
                  : listing.location || null;

                return (
                  <motion.div key={listing.id} variants={fadeUp} whileHover={{ y: -6, transition: { duration: 0.25 } }} className="group">
                    <Link href={`/marketplace/${listing.slug || listing.id}?source=landing`} className="block h-full">
                      <div className="relative h-full rounded-2xl overflow-hidden bg-white dark:bg-surface shadow-card group-hover:shadow-elevated transition-all duration-300" style={{ border: "1.5px solid transparent", backgroundClip: "padding-box" }}>
                        {/* Gradient border */}
                        <div className="absolute inset-0 rounded-2xl pointer-events-none z-20" style={{ padding: "1.5px", background: "linear-gradient(135deg, #7c3aed55, #2563eb55, #ec489955)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />

                        {/* Image */}
                        <div className="aspect-[4/3] relative overflow-hidden">
                          {isPlaceholder ? (
                            <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: "linear-gradient(135deg, #7c3aed22, #2563eb22, #ec489922)" }}>
                              {catIcons[cat] || '🐾'}
                            </div>
                          ) : (
                            <img src={img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          )}
                          {/* Dark bottom fade */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                          {/* Category badge */}
                          <div className="absolute top-3 left-3 z-10">
                            <span className={`inline-flex items-center gap-1 text-white text-[10px] font-bold px-2 py-1 rounded-full ${catColors[cat] || 'bg-slate-500'}`}>
                              {catIcons[cat]} {cat.replace(/-/g, ' ')}
                            </span>
                          </div>

                          {/* Boosted badge */}
                          <div className="absolute top-3 right-3 z-10">
                            <span className="inline-flex items-center gap-1 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg" style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb, #ec4899)" }}>
                              <Zap className="w-2.5 h-2.5 fill-current" />
                              Featured
                            </span>
                          </div>

                          {/* Price overlay */}
                          {listing.price && (
                            <div className="absolute bottom-3 left-3 z-10">
                              <span className="text-white font-bold text-sm bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                                {listing.currency === 'USD' ? '$' : listing.currency}{listing.price.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-bold text-sm leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
                            {listing.title}
                          </h3>

                          {listing.breed && (
                            <p className="text-xs text-muted-foreground mb-2 truncate">{listing.breed}{listing.sex ? ` · ${listing.sex}` : ''}</p>
                          )}

                          {/* Badges */}
                          <div className="flex gap-1 flex-wrap mb-3">
                            {listing.healthCertified && (
                              <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">Health Cert</span>
                            )}
                            {listing.championLines && (
                              <span className="text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">Champion Lines</span>
                            )}
                          </div>

                          {/* Breeder row */}
                          <div className="flex items-center gap-2 pt-2.5 border-t border-border/50">
                            <div className="w-7 h-7 rounded-full bg-gradient-brand overflow-hidden shrink-0 flex items-center justify-center">
                              {listing.breederLogo
                                ? <img src={listing.breederLogo} alt="" className="w-full h-full object-cover" />
                                : <span className="text-white text-[10px] font-bold">{(listing.breederName || 'B').charAt(0)}</span>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium truncate">{listing.breederName || 'Breeder'}</span>
                                {listing.breederVerified && <VerifiedCheckmark isVerified />}
                              </div>
                              {locationStr && (
                                <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{locationStr}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="md:hidden mt-6 text-center">
              <Link href="/marketplace">
                <Button variant="outline" className="text-primary border-primary/30">
                  Browse Marketplace <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Breeders Section */}
      {featuredBreeders.length > 0 && (
        <section className="py-20 bg-surface relative overflow-hidden">
          {/* Gradient background accent */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-blue/3 to-transparent pointer-events-none" />

          <div className="container relative">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <Badge className="mb-3 bg-gradient-brand/10 text-primary border-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                  <Zap className="w-3 h-3 mr-1.5" />
                  Featured Breeders
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Meet Our Top Breeders
                </h2>
                <p className="text-muted-foreground mt-2 max-w-lg">
                  Verified, trusted breeders hand-picked for their excellence, health standards, and dedication.
                </p>
              </div>
              <Link href="/breeders" className="hidden md:block">
                <Button variant="ghost" className="text-primary">
                  All Breeders <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {featuredBreeders.map((breeder: any) => {
                const locationStr = breeder.location
                  ? [breeder.location.city, breeder.location.state].filter(Boolean).join(", ")
                  : null;
                const rating = parseFloat(breeder.averageRating || "0");

                return (
                  <motion.div
                    key={breeder.id}
                    variants={fadeUp}
                    whileHover={{ y: -6, transition: { duration: 0.25 } }}
                    className="group"
                  >
                    <Link
                      href={`/breeders/${breeder.slug}?source=landing-featured`}
                      className="block h-full"
                    >
                      <div className="relative h-full rounded-2xl overflow-hidden shadow-card group-hover:shadow-elevated transition-all duration-300 bg-white dark:bg-surface">
                        {/* Gradient border overlay */}
                        <div className="absolute inset-0 rounded-2xl pointer-events-none z-20" style={{ padding: "1.5px", background: "linear-gradient(135deg, #7c3aed55, #2563eb55, #ec489955)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
                        {/* Boosted badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <span className="inline-flex items-center gap-1 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg" style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb, #ec4899)" }}>
                            <Zap className="w-2.5 h-2.5 fill-current" />
                            Featured
                          </span>
                        </div>

                        {/* Banner / color block */}
                        <div className="h-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #7c3aed22, #2563eb22, #ec489922)" }}>
                          {breeder.bannerUrl ? (
                            <img
                              src={breeder.bannerUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #7c3aed33 0%, #2563eb22 50%, #ec489933 100%)" }} />
                          )}
                          {/* Shimmer line */}
                          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #7c3aed55, #2563eb55, #ec489955, transparent)" }} />
                        </div>

                        <div className="px-5 pb-5">
                          {/* Avatar */}
                          <div className="-mt-8 mb-3">
                            <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-surface bg-gradient-brand shadow-lg overflow-hidden">
                              {breeder.logoUrl ? (
                                <img src={breeder.logoUrl} alt={breeder.displayName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                                  {breeder.displayName.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Name + verified */}
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                              {breeder.displayName}
                            </h3>
                            {breeder.kycVerified && <VerifiedCheckmark isVerified />}
                          </div>

                          {/* Tagline */}
                          {breeder.tagline && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                              {breeder.tagline}
                            </p>
                          )}

                          {/* Location */}
                          {locationStr && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{locationStr}</span>
                            </div>
                          )}

                          {/* Breeds */}
                          {breeder.primaryBreeds?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {breeder.primaryBreeds.slice(0, 2).map((breed: string) => (
                                <span key={breed} className="text-[10px] font-medium bg-primary/8 text-primary px-2 py-0.5 rounded-full">
                                  {breed}
                                </span>
                              ))}
                              {breeder.primaryBreeds.length > 2 && (
                                <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                  +{breeder.primaryBreeds.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Stats row */}
                          <div className="flex items-center gap-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
                              <span>({breeder.totalReviews})</span>
                            </div>
                            <div>
                              <span className="font-semibold text-foreground">{breeder.animalCount ?? 0}</span>
                              {" "}animals
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="md:hidden mt-6 text-center">
              <Link href="/breeders">
                <Button variant="outline" className="text-primary border-primary/30">
                  All Breeders <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-24 bg-surface relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-blue/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="container relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Powerful Tools
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-5">
              Built for Breeders Who{" "}
              <span className="bg-gradient-to-r from-primary-blue to-primary-pink bg-clip-text text-transparent">
                Mean Business
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From pedigree tracking to breeding analytics — every tool you need
              to run a world-class program, all in one place.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group"
              >
                <div className="relative h-full rounded-2xl border border-border/50 bg-white dark:bg-surface p-6 transition-all duration-300 group-hover:shadow-elevated group-hover:border-border overflow-hidden">
                  {/* Glow effect on hover */}
                  <div className={`absolute -top-12 -right-12 w-32 h-32 ${feature.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative">
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-5`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        {/* Subtle mesh pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        {/* Color accents */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-pink/10 rounded-full blur-3xl" />

        <div className="container relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-white/10 text-white border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Trust & Security
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white">
              Your Breeding Program,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Protected
              </span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              We take trust seriously. Every layer of Animalytics is built with
              transparency, security, and breeder success in mind.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {trustItems.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="group"
              >
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10 overflow-hidden">
                  {/* Top accent line */}
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{item.stat}</div>
                      <div className="text-xs text-white/40 uppercase tracking-wider">{item.statLabel}</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-surface">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Breeders Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our community has to say
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeUp}>
                <Card className="shadow-card hover:shadow-elevated transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6">
                      &quot;{testimonial.content}&quot;
                    </p>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-brand">
        <div className="container text-center text-white">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <Trophy className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Breeding Program?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of successful breeders who trust Animalytics.
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 bg-white text-primary hover:bg-white/90"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-white text-white hover:bg-white/10"
                >
                  Browse Animals
                </Button>
              </Link>
            </div>
          </motion.div>
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
              <a
                href="mailto:support@animalytics.co"
                className="hover:text-foreground transition-colors"
              >
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Animalytics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
