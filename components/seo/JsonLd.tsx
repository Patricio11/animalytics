/**
 * JSON-LD Structured Data Components for SEO
 *
 * These components inject schema.org structured data into pages
 * to enable rich search results (rich snippets) on Google, Bing, etc.
 */

// Organization structured data (for the home page)
export function OrganizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://animalytics.co';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Animalytics',
    url: baseUrl,
    logo: `${baseUrl}/animalytics.png`,
    description: 'Professional breeding and animal management platform for breeders worldwide.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@animalytics.co',
      contactType: 'customer service',
    },
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Website structured data with search action
export function WebsiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://animalytics.co';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Animalytics',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/marketplace?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Product listing structured data (for marketplace listings)
export function ListingJsonLd({
  title,
  description,
  image,
  price,
  currency,
  breed,
  location,
  url,
  sellerName,
}: {
  title: string;
  description: string;
  image?: string;
  price?: number;
  currency?: string;
  breed?: string;
  location?: string;
  url: string;
  sellerName?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://animalytics.co';

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description,
    url: `${baseUrl}${url}`,
    ...(image && { image }),
    ...(breed && { category: breed }),
    ...(sellerName && {
      brand: {
        '@type': 'Organization',
        name: sellerName,
      },
    }),
  };

  if (price && currency) {
    jsonLd.offers = {
      '@type': 'Offer',
      price: (price / 100).toFixed(2),
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      ...(location && { areaServed: location }),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Breeder profile structured data
export function BreederJsonLd({
  name,
  description,
  image,
  location,
  url,
  rating,
  reviewCount,
}: {
  name: string;
  description?: string;
  image?: string;
  location?: string;
  url: string;
  rating?: number;
  reviewCount?: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://animalytics.co';

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    url: `${baseUrl}${url}`,
    ...(description && { description }),
    ...(image && { image }),
    ...(location && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
      },
    }),
  };

  if (rating && reviewCount) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount,
      bestRating: 5,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Animal profile structured data
export function AnimalJsonLd({
  name,
  description,
  image,
  breed,
  sex,
  dateOfBirth,
  url,
  breederName,
  breederUrl,
  isChampion,
}: {
  name: string;
  description?: string;
  image?: string | null;
  breed?: string | null;
  sex?: string | null;
  dateOfBirth?: string | null;
  url: string;
  breederName?: string | null;
  breederUrl?: string | null;
  isChampion?: boolean | null;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://animalytics.co';

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Animal',
    name,
    url: `${baseUrl}${url}`,
    ...(description && { description }),
    ...(image && { image }),
    ...(breed && { breed }),
    ...(sex && { sex }),
    ...(dateOfBirth && { birthDate: dateOfBirth }),
    ...(isChampion && { award: 'Champion' }),
  };

  if (breederName) {
    jsonLd.provider = {
      '@type': 'Organization',
      name: breederName,
      ...(breederUrl && { url: `${baseUrl}${breederUrl}` }),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// BreadcrumbList structured data
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://animalytics.co';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
