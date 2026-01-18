import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';
import { breederProfiles } from './profiles';
import { petOwnerProfiles } from './pet-owner-profiles';

/**
 * Verification Requests Table
 * FUTURE-PROOF: Supports verification for ALL user roles
 * - breeders: Breeder certification, kennel license, business docs
 * - pet_owners: Pet ownership proof, veterinary records
 * - vets: Veterinary license, clinic registration, professional credentials
 * - future roles: Extensible for any new user type
 * 
 * Role-specific documents are stored in flexible JSONB fields
 */
export const verificationRequests = pgTable('verification_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  userRole: text('user_role').notNull(), // 'breeder' | 'pet_owner' | 'vet' | any future role
  
  // Status tracking
  status: text('status').notNull().default('draft'), // draft, submitted, under_review, approved, rejected, expired
  currentStep: text('current_step').default('personal_info'), // Wizard step tracking
  completedSteps: jsonb('completed_steps').$type<string[]>().default([]),
  
  // Personal Information
  firstName: text('first_name'),
  lastName: text('last_name'),
  dateOfBirth: text('date_of_birth'),
  nationality: text('nationality'),
  phoneNumber: text('phone_number'),
  phoneVerified: boolean('phone_verified').default(false),
  
  // Address Information
  address: jsonb('address').$type<{
    street: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>(),
  
  // Identity Documents (4-corner photo requirement)
  idType: text('id_type'), // passport, drivers_license, national_id
  idNumber: text('id_number'),
  idExpiryDate: text('id_expiry_date'),
  idFrontImageUrl: text('id_front_image_url'),
  idBackImageUrl: text('id_back_image_url'),
  idTopLeftCornerUrl: text('id_top_left_corner_url'),
  idTopRightCornerUrl: text('id_top_right_corner_url'),
  idBottomLeftCornerUrl: text('id_bottom_left_corner_url'),
  idBottomRightCornerUrl: text('id_bottom_right_corner_url'),
  selfieWithIdUrl: text('selfie_with_id_url'),
  
  // Proof of Address (bank statement or utility bill)
  proofOfAddressType: text('proof_of_address_type'), // bank_statement, utility_bill, lease_agreement
  proofOfAddressUrl: text('proof_of_address_url'),
  proofOfAddressDate: text('proof_of_address_date'),
  
  // Breeder-Specific Documents
  breederCertificationUrl: text('breeder_certification_url'),
  breederCertificationNumber: text('breeder_certification_number'),
  breederCertificationIssuer: text('breeder_certification_issuer'),
  kennelLicenseUrl: text('kennel_license_url'),
  kennelLicenseNumber: text('kennel_license_number'),
  businessRegistrationUrl: text('business_registration_url'),
  businessRegistrationNumber: text('business_registration_number'),
  taxIdUrl: text('tax_id_url'),
  taxIdNumber: text('tax_id_number'),
  
  // Pet Owner-Specific Documents
  petOwnershipProofUrl: text('pet_ownership_proof_url'),
  veterinaryRecordsUrl: text('veterinary_records_url'),
  
  // Vet-Specific Documents (FUTURE-PROOF)
  vetLicenseUrl: text('vet_license_url'),
  vetLicenseNumber: text('vet_license_number'),
  vetLicenseIssuer: text('vet_license_issuer'),
  vetLicenseExpiryDate: text('vet_license_expiry_date'),
  clinicRegistrationUrl: text('clinic_registration_url'),
  clinicRegistrationNumber: text('clinic_registration_number'),
  professionalInsuranceUrl: text('professional_insurance_url'),
  professionalInsuranceNumber: text('professional_insurance_number'),
  degreeCertificateUrl: text('degree_certificate_url'),
  specialistCertificationUrl: text('specialist_certification_url'),
  
  // Role-Specific Documents (FLEXIBLE JSONB for any future role)
  roleSpecificDocuments: jsonb('role_specific_documents').$type<Record<string, {
    url: string;
    number?: string;
    issuer?: string;
    expiryDate?: string;
    uploadedAt: string;
  }>>().default({}),
  
  // Additional Documents (flexible for any extra documents)
  additionalDocuments: jsonb('additional_documents').$type<Array<{
    type: string;
    name: string;
    url: string;
    uploadedAt: string;
  }>>().default([]),
  
  // Review Information
  reviewedBy: text('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  rejectionReason: text('rejection_reason'),
  adminFeedback: text('admin_feedback'),
  
  // Verification Result
  verifiedAt: timestamp('verified_at'),
  expiresAt: timestamp('expires_at'),
  
  // Payment (future-proofing for fees)
  verificationFee: text('verification_fee'), // Amount in cents
  feePaid: boolean('fee_paid').default(false),
  paymentId: text('payment_id'),
  paymentDate: timestamp('payment_date'),
  
  // Metadata
  submittedAt: timestamp('submitted_at'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Verification Documents Table
 * Individual document tracking with detailed metadata
 */
export const verificationDocuments = pgTable('verification_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  verificationRequestId: uuid('verification_request_id').references(() => verificationRequests.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Document Details
  documentType: text('document_type').notNull(), // id_front, id_back, id_corner_tl, id_corner_tr, id_corner_bl, id_corner_br, selfie, proof_of_address, breeder_cert, kennel_license, etc.
  category: text('category').notNull(), // identity, address, certification, business, pet_ownership, other
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: text('file_size'),
  mimeType: text('mime_type'),
  
  // Image Metadata (for photos)
  imageWidth: text('image_width'),
  imageHeight: text('image_height'),
  capturedWithCamera: boolean('captured_with_camera').default(false),
  
  // Security & Integrity
  secureHash: text('secure_hash'), // SHA-256 hash
  encrypted: boolean('encrypted').default(false),
  
  // Review Status
  status: text('status').notNull().default('pending'), // pending, approved, rejected, requires_reupload
  reviewedBy: text('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),
  
  // Metadata
  uploadedFromIp: text('uploaded_from_ip'),
  uploadedFromDevice: text('uploaded_from_device'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Verification Audit Log
 * Complete audit trail for compliance
 */
export const verificationAuditLog = pgTable('verification_audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  verificationRequestId: uuid('verification_request_id').references(() => verificationRequests.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Action Details
  action: text('action').notNull(), // created, step_completed, document_uploaded, submitted, under_review, approved, rejected, expired, resubmitted
  performedBy: text('performed_by').references(() => users.id),
  previousStatus: text('previous_status'),
  newStatus: text('new_status'),
  
  // Details
  stepName: text('step_name'),
  documentType: text('document_type'),
  reason: text('reason'),
  notes: text('notes'),
  changes: jsonb('changes'),
  
  // Metadata
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
