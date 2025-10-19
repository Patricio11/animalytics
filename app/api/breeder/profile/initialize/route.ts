import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { nanoid } from 'nanoid';

// ============================================================================
// POST /api/breeder/profile/initialize
// ============================================================================
// Initialize a breeder profile with seed data (for development/testing)

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if profile already exists
    const [existingProfile] = await db
      .select()
      .from(breederProfiles)
      .where(eq(breederProfiles.userId, session.user.id))
      .limit(1);

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists', profile: existingProfile },
        { status: 400 }
      );
    }

    // Generate slug from user name or email
    const userName = session.user.name || session.user.email?.split('@')[0] || 'breeder';
    const slug = `${userName.toLowerCase().replace(/\s+/g, '-')}-${nanoid(6)}`;

    // Create profile with seed data
    const [newProfile] = await db
      .insert(breederProfiles)
      .values({
        id: nanoid(),
        userId: session.user.id,
        displayName: session.user.name || 'My Kennel',
        slug,
        tagline: 'Raising Champion Dogs Since 2010',
        bio: 'We are a family-owned kennel dedicated to breeding healthy, well-tempered dogs with champion bloodlines. Our dogs are health tested, socialized from birth, and come with comprehensive health guarantees.',
        logoUrl: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=200&h=200&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=1200&h=400&fit=crop',
        publicEmail: session.user.email,
        website: 'https://example.com',
        location: {
          city: 'Denver',
          state: 'Colorado',
          country: 'USA',
          timezone: 'America/Denver',
        },
        businessName: `${session.user.name || 'My'} Kennels LLC`,
        yearsInBusiness: 14,
        establishedYear: new Date().getFullYear() - 14,
        primaryBreeds: ['Golden Retriever', 'Labrador Retriever'],
        specializations: ['Show Dogs', 'Family Companions', 'Service Dog Training'],
        certifications: [
          {
            name: 'AKC Breeder of Merit',
            issuingOrganization: 'American Kennel Club',
            issueDate: '2018-03-15',
          },
          {
            name: 'Canine Good Citizen Evaluator',
            issuingOrganization: 'AKC',
            issueDate: '2015-06-20',
          },
        ],
        awards: [
          {
            title: 'Best of Breed 2023',
            organization: 'National Dog Show',
            year: 2023,
          },
          {
            title: 'National Specialty Winner 2022',
            organization: 'AKC',
            year: 2022,
          },
        ],
        kycVerified: true,
        backgroundCheckVerified: true,
        healthCertified: true,
        premiumMember: true,
        totalSales: 156,
        totalEarnings: '425000.00',
        successfulTransactions: 156,
        totalAnimals: 12,
        totalLitters: 34,
        averageRating: '4.9',
        totalReviews: 89,
        fiveStarReviews: 82,
        fourStarReviews: 5,
        threeStarReviews: 2,
        responseRate: 98,
        responseTimeHours: 2,
        onTimeDeliveryRate: 100,
        profileViews: 1247,
        profileViewsThisMonth: 89,
        profileCompleteness: 95,
        isPublic: true,
        acceptsInternationalOrders: true,
        healthGuarantee: 'All puppies come with a 2-year health guarantee covering genetic conditions.',
        returnPolicy: 'We offer a 72-hour return policy for health-related issues.',
        shippingPolicy: 'We can arrange safe transport to most locations in the US.',
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Profile initialized successfully',
      profile: newProfile,
    });
  } catch (error) {
    console.error('Error initializing breeder profile:', error);
    return NextResponse.json(
      { error: 'Failed to initialize profile' },
      { status: 500 }
    );
  }
}
