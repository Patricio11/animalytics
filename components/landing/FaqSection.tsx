"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "What is Animalytics?",
    a: "Animalytics is a professional breeding and animal management platform built for dog breeders. It tracks pedigree, breeding records, heat cycles and progesterone readings, and connects breeders with verified buyers through a built-in marketplace.",
  },
  {
    q: "How does the progesterone tracking work?",
    a: "Add a heat cycle for your bitch, then record each progesterone reading as you receive lab results. Animalytics auto-detects ovulation, calculates the optimal breeding window for fresh, chilled or frozen AI, predicts whelping dates, and generates pregnancy screening tasks once you mark the last mating.",
  },
  {
    q: "Can I track my full pedigree on Animalytics?",
    a: "Yes. You can build a multi-generation pedigree tree by linking parents already in the system or entering ancestors manually. The AI Pedigree Scanner can also extract a full family tree directly from a photo or PDF of a paper pedigree certificate.",
  },
  {
    q: "Do I need to be a professional breeder to use Animalytics?",
    a: "No. The platform supports professional breeders with full breeding management tools, and pet owners who want to track their animal's health, browse the marketplace and buy from verified breeders.",
  },
  {
    q: "What's the difference between a verified and unverified breeder?",
    a: "Verified breeders have submitted documents proving their identity, kennel registration and breed specialisation. They get a verification badge on their profile and listings, which buyers can filter for when searching the marketplace.",
  },
  {
    q: "How does the marketplace work?",
    a: "Breeders create listings for puppies, stud services or frozen semen. Buyers can browse by breed, location and price, save favourites, message the breeder directly, and complete the purchase through the platform's escrow system that protects both sides.",
  },
  {
    q: "Is my breeding data private?",
    a: "Yes. Pedigree, health records, mating records and progesterone readings are private to your account by default. You choose what becomes public — typically just animal profiles for marketplace listings and your breeder bio.",
  },
  {
    q: "Does Animalytics work outside my country?",
    a: "Yes. Animalytics is a global platform. Currency, units and date format auto-detect from your location, and the breeder directory shows breeders from all countries. The marketplace lets you filter by country and shipping options.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export function FaqSection() {
  return (
    <section id="faq" className="py-24 bg-surface relative overflow-hidden">
      {/* FAQPage JSON-LD — inlined so Googlebot reads it without executing JS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container relative max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider border border-primary/20">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Common Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about managing your breeding programme on Animalytics.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-border/40 rounded-xl bg-white dark:bg-surface px-5 shadow-sm"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
