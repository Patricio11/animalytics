/**
 * Verification System Types
 * Types for the comprehensive verification system for breeders and pet owners
 */

export type VerificationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'expired';
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'requires_reupload';
// FUTURE-PROOF: Support for all user roles
export type UserRole = 'breeder' | 'pet_owner' | 'vet' | 'admin';
export type VerifiableUserRole = Exclude<UserRole, 'admin'>; // All roles except admin can be verified

export interface VerificationRequest {
  id: string;
  userId: string;
  userRole: UserRole;
  status: VerificationStatus;
  currentStep: string;
  completedSteps: string[];
  
  // Personal Information
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  phoneNumber?: string;
  phoneVerified: boolean;
  
  // Address
  address?: {
    street: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Identity Documents
  idType?: string;
  idNumber?: string;
  idExpiryDate?: string;
  idFrontImageUrl?: string;
  idBackImageUrl?: string;
  idTopLeftCornerUrl?: string;
  idTopRightCornerUrl?: string;
  idBottomLeftCornerUrl?: string;
  idBottomRightCornerUrl?: string;
  selfieWithIdUrl?: string;
  
  // Proof of Address
  proofOfAddressType?: string;
  proofOfAddressUrl?: string;
  proofOfAddressDate?: string;
  
  // Breeder-Specific
  breederCertificationUrl?: string;
  breederCertificationNumber?: string;
  breederCertificationIssuer?: string;
  kennelLicenseUrl?: string;
  kennelLicenseNumber?: string;
  businessRegistrationUrl?: string;
  businessRegistrationNumber?: string;
  taxIdUrl?: string;
  taxIdNumber?: string;
  
  // Pet Owner-Specific
  petOwnershipProofUrl?: string;
  veterinaryRecordsUrl?: string;
  
  // Vet-Specific (FUTURE-PROOF)
  vetLicenseUrl?: string;
  vetLicenseNumber?: string;
  vetLicenseIssuer?: string;
  vetLicenseExpiryDate?: string;
  clinicRegistrationUrl?: string;
  clinicRegistrationNumber?: string;
  professionalInsuranceUrl?: string;
  professionalInsuranceNumber?: string;
  degreeCertificateUrl?: string;
  specialistCertificationUrl?: string;
  
  // Role-Specific Documents (FLEXIBLE for any future role)
  roleSpecificDocuments?: Record<string, {
    url: string;
    number?: string;
    issuer?: string;
    expiryDate?: string;
    uploadedAt: string;
  }>;
  
  // Additional Documents
  additionalDocuments: Array<{
    type: string;
    name: string;
    url: string;
    uploadedAt: string;
  }>;
  
  // Review
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  adminFeedback?: string;
  verifiedAt?: string;
  expiresAt?: string;
  
  // Payment
  verificationFee?: string;
  feePaid: boolean;
  paymentId?: string;
  paymentDate?: string;
  
  // Metadata
  submittedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationDocument {
  id: string;
  verificationRequestId: string;
  userId: string;
  documentType: string;
  category: string;
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  mimeType?: string;
  imageWidth?: string;
  imageHeight?: string;
  capturedWithCamera: boolean;
  secureHash?: string;
  encrypted: boolean;
  status: DocumentStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  uploadedFromIp?: string;
  uploadedFromDevice?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationAuditLog {
  id: string;
  verificationRequestId: string;
  userId: string;
  action: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  stepName?: string;
  documentType?: string;
  reason?: string;
  notes?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface VerificationStepData {
  stepId: string;
  title: string;
  description: string;
  isComplete: boolean;
  isOptional: boolean;
  data: any;
}

// FUTURE-PROOF: Verification steps for all user roles

// Breeder-specific verification steps
export const BREEDER_VERIFICATION_STEPS = [
  'personal_info',
  'address_info',
  'identity_documents',
  'proof_of_address',
  'breeder_certifications',
  'business_documents',
  'review_submit',
] as const;

// Pet Owner-specific verification steps
export const PET_OWNER_VERIFICATION_STEPS = [
  'personal_info',
  'address_info',
  'identity_documents',
  'proof_of_address',
  'pet_ownership_proof',
  'review_submit',
] as const;

// Vet-specific verification steps (FUTURE-PROOF)
export const VET_VERIFICATION_STEPS = [
  'personal_info',
  'address_info',
  'identity_documents',
  'proof_of_address',
  'vet_license',
  'clinic_registration',
  'professional_credentials',
  'review_submit',
] as const;

export type BreederVerificationStep = typeof BREEDER_VERIFICATION_STEPS[number];
export type PetOwnerVerificationStep = typeof PET_OWNER_VERIFICATION_STEPS[number];
export type VetVerificationStep = typeof VET_VERIFICATION_STEPS[number];

// Role-agnostic verification step type
export type VerificationStep = BreederVerificationStep | PetOwnerVerificationStep | VetVerificationStep | string;

// Helper to get verification steps by role
export const VERIFICATION_STEPS_BY_ROLE: Record<VerifiableUserRole, readonly string[]> = {
  breeder: BREEDER_VERIFICATION_STEPS,
  pet_owner: PET_OWNER_VERIFICATION_STEPS,
  vet: VET_VERIFICATION_STEPS,
};

// Document type definitions
export const DOCUMENT_TYPES = {
  // Identity
  ID_FRONT: 'id_front',
  ID_BACK: 'id_back',
  ID_CORNER_TL: 'id_corner_tl',
  ID_CORNER_TR: 'id_corner_tr',
  ID_CORNER_BL: 'id_corner_bl',
  ID_CORNER_BR: 'id_corner_br',
  SELFIE_WITH_ID: 'selfie_with_id',
  
  // Address
  PROOF_OF_ADDRESS: 'proof_of_address',
  BANK_STATEMENT: 'bank_statement',
  UTILITY_BILL: 'utility_bill',
  
  // Breeder
  BREEDER_CERTIFICATION: 'breeder_certification',
  KENNEL_LICENSE: 'kennel_license',
  BUSINESS_REGISTRATION: 'business_registration',
  TAX_ID_DOCUMENT: 'tax_id_document',
  
  // Pet Owner
  PET_OWNERSHIP_PROOF: 'pet_ownership_proof',
  VETERINARY_RECORDS: 'veterinary_records',
  
  // Vet (FUTURE-PROOF)
  VET_LICENSE: 'vet_license',
  CLINIC_REGISTRATION: 'clinic_registration',
  PROFESSIONAL_INSURANCE: 'professional_insurance',
  DEGREE_CERTIFICATE: 'degree_certificate',
  SPECIALIST_CERTIFICATION: 'specialist_certification',
  
  // Other
  OTHER: 'other',
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

// Email notification types
export const VERIFICATION_EMAIL_TYPES = {
  SUBMITTED: 'verification_submitted',
  UNDER_REVIEW: 'verification_under_review',
  APPROVED: 'verification_approved',
  REJECTED: 'verification_rejected',
  ADDITIONAL_INFO_REQUIRED: 'verification_additional_info_required',
  EXPIRING_SOON: 'verification_expiring_soon',
  EXPIRED: 'verification_expired',
} as const;

export type VerificationEmailType = typeof VERIFICATION_EMAIL_TYPES[keyof typeof VERIFICATION_EMAIL_TYPES];
