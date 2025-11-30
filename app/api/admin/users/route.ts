import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { eq, sql, ilike, or, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { hash } from 'bcrypt';

/**
 * Helper function to check if user is admin
 */
async function isAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    return false;
  }

  return true;
}

/**
 * Generate a secure random password
 */
function generatePassword(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * GET /api/admin/users
 * List all users with filtering, searching, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Filters
    const role = searchParams.get('role');
    const verified = searchParams.get('verified');
    const search = searchParams.get('search');

    // Build where conditions
    const conditions = [];

    if (role) {
      conditions.push(eq(users.role, role as any));
    }

    if (verified === 'true') {
      conditions.push(eq(users.isVerified, true));
    } else if (verified === 'false') {
      conditions.push(eq(users.isVerified, false));
    }

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.organization, `%${search}%`)
        )!
      );
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get users
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        emailVerified: users.emailVerified,
        name: users.name,
        avatar: users.avatar,
        role: users.role,
        organization: users.organization,
        licenseNumber: users.licenseNumber,
        isVerified: users.isVerified,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        subscription: users.subscription,
      })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      users: userList,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      email,
      name,
      role = 'breeder',
      organization,
      licenseNumber,
      certifications,
      specializations,
      isVerified = false,
    } = body;

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate temporary password
    const temporaryPassword = generatePassword();
    const hashedPassword = await hash(temporaryPassword, 10);

    // Create user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        email,
        name,
        role: role as any,
        organization: organization || null,
        licenseNumber: licenseNumber || null,
        certifications: certifications || null,
        specializations: specializations || null,
        isVerified,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        organization: users.organization,
        licenseNumber: users.licenseNumber,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
      });

    // TODO: Send welcome email with temporary password
    // For now, return the password in response (in production, send via email)

    return NextResponse.json({
      success: true,
      user: newUser,
      credentials: {
        email: newUser.email,
        temporaryPassword,
        message: 'Please send these credentials to the user securely. They should change their password on first login.',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
