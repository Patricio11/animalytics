import { pgTable, text, timestamp, integer, boolean, date, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * KYC Verifications Table
 * Identity verification for breeders, vets, and event organizers (NOT admin)
 * 3-level verification system for different selling limits
 */
export const kycVerifications = pgTable('kyc_verifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),

  // Verification level
  level: integer('level').notNull().default(0), // 0 = none, 1 = basic, 2 = seller, 3 = professional
  status: text('status').notNull().default('not_started'), // not_started, pending, approved, rejected, expired
  tier: text('tier'), // basic, seller, professional (friendly name for level)

  // Personal information
  firstName: text('first_name'),
  lastName: text('last_name'),
  dateOfBirth: date('date_of_birth'),
  nationality: text('nationality'),
  placeOfBirth: text('place_of_birth'),

  // Contact verification
  phoneNumber: text('phone_number'),
  phoneVerified: boolean('phone_verified').default(false),
  phoneVerifiedAt: timestamp('phone_verified_at'),
  phoneVerificationCode: text('phone_verification_code'),

  // Address information
  address: jsonb('address').$type<{
    street: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>(),

  // Identity documents
  idType: text('id_type'), // passport, drivers_license, national_id, residence_permit
  idNumber: text('id_number'),
  idIssuingCountry: text('id_issuing_country'),
  idIssueDate: date('id_issue_date'),
  idExpiryDate: date('id_expiry_date'),

  // Document uploads (URLs to secure storage)
  idFrontImage: text('id_front_image'),
  idBackImage: text('id_back_image'),
  selfieImage: text('selfie_image'),
  proofOfAddressImage: text('proof_of_address_image'),

  // Business verification (Level 3 - Professional)
  businessName: text('business_name'),
  businessType: text('business_type'), // sole_proprietor, partnership, llc, corporation
  businessRegistrationNumber: text('business_registration_number'),
  businessRegistrationCountry: text('business_registration_country'),
  taxId: text('tax_id'), // EIN, VAT, etc.
  businessAddress: jsonb('business_address').$type<{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>(),

  // Verification results
  verifiedBy: text('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  rejectionReason: text('rejection_reason'),
  reviewNotes: text('review_notes'), // Internal admin notes

  // External provider integration (optional: Stripe Identity, Onfido, etc.)
  externalProvider: text('external_provider'),
  externalVerificationId: text('external_verification_id'),
  externalStatus: text('external_status'),
  externalData: jsonb('external_data'),

  // Selling limits based on verification level
  monthlyLimit: integer('monthly_limit').default(0), // in USD cents
  transactionLimit: integer('transaction_limit').default(0), // in USD cents
  requiresReview: boolean('requires_review').default(false), // flag large transactions for manual review

  // Expiry and renewal
  expiresAt: timestamp('expires_at'),
  lastRenewalDate: timestamp('last_renewal_date'),
  renewalReminderSentAt: timestamp('renewal_reminder_sent_at'),

  // Metadata
  submittedAt: timestamp('submitted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * KYC Documents Table
 * Individual document tracking with status
 */
export const kycDocuments = pgTable('kyc_documents', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  verificationId: text('verification_id').references(() => kycVerifications.id, { onDelete: 'cascade' }),

  // Document details
  type: text('type').notNull(), // id_front, id_back, selfie, address_proof, business_license, tax_document
  category: text('category').notNull(), // identity, address, business, other
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),

  // Security
  encrypted: boolean('encrypted').default(true),
  secureHash: text('secure_hash'), // SHA-256 hash for integrity verification

  // Status
  status: text('status').notNull().default('pending'), // pending, approved, rejected, expired
  reviewedBy: text('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),

  // Expiry
  expiresAt: timestamp('expires_at'),

  // Metadata
  uploadedFromIp: text('uploaded_from_ip'),
  uploadedFromDevice: text('uploaded_from_device'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * KYC Audit Log Table
 * Track all changes and reviews for compliance
 */
export const kycAuditLog = pgTable('kyc_audit_log', {
  id: text('id').primaryKey(),
  verificationId: text('verification_id').references(() => kycVerifications.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Action details
  action: text('action').notNull(), // submitted, approved, rejected, renewed, expired, document_uploaded, status_changed
  performedBy: text('performed_by').references(() => users.id), // admin who performed action
  previousStatus: text('previous_status'),
  newStatus: text('new_status'),

  // Details
  reason: text('reason'),
  notes: text('notes'),
  changes: jsonb('changes'), // detailed change log

  // Metadata
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Verification Settings Table
 * Platform-wide KYC configuration
 */
export const kycSettings = pgTable('kyc_settings', {
  id: text('id').primaryKey(),

  // Level 1: Basic (Email + Phone)
  level1Enabled: boolean('level1_enabled').default(true),
  level1MonthlyLimit: integer('level1_monthly_limit').default(0), // $0 = browse only
  level1TransactionLimit: integer('level1_transaction_limit').default(0),

  // Level 2: Seller (ID + Address)
  level2Enabled: boolean('level2_enabled').default(true),
  level2MonthlyLimit: integer('level2_monthly_limit').default(500000), // $5,000
  level2TransactionLimit: integer('level2_transaction_limit').default(200000), // $2,000

  // Level 3: Professional (Business docs + Tax ID)
  level3Enabled: boolean('level3_enabled').default(true),
  level3MonthlyLimit: integer('level3_monthly_limit').default(-1), // -1 = unlimited
  level3TransactionLimit: integer('level3_transaction_limit').default(-1),

  // Document requirements
  requireIdBack: boolean('require_id_back').default(true),
  requireSelfie: boolean('require_selfie').default(true),
  requireProofOfAddress: boolean('require_proof_of_address').default(true),

  // Auto-approval settings
  autoApproveLevel1: boolean('auto_approve_level1').default(true),
  autoApproveLevel2: boolean('auto_approve_level2').default(false),
  autoApproveLevel3: boolean('auto_approve_level3').default(false),

  // Expiry settings
  verificationExpiryMonths: integer('verification_expiry_months').default(24), // 2 years
  renewalReminderDays: integer('renewal_reminder_days').default(30), // 30 days before expiry

  // Metadata
  updatedBy: text('updated_by').references(() => users.id),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
