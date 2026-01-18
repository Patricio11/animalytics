import { useQuery } from '@tanstack/react-query';

interface VerificationStatus {
  isVerified: boolean;
  verificationStatus?: 'approved' | 'pending' | 'rejected' | 'not_started' | 'expired';
  verifiedAt?: string;
  expiresAt?: string;
}

/**
 * Hook to fetch user's verification status
 * Used across the platform to show verified badges
 */
export function useVerificationStatus(userId?: string) {
  return useQuery<VerificationStatus>({
    queryKey: ['verification-status', userId],
    queryFn: async () => {
      if (!userId) {
        return {
          isVerified: false,
          verificationStatus: 'not_started',
        };
      }

      const response = await fetch('/api/verification/status');
      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get verification status from breeder/pet owner profile data
 * Used when profile data is already available
 */
export function getVerificationStatusFromProfile(profile: any): VerificationStatus {
  if (!profile) {
    return {
      isVerified: false,
      verificationStatus: 'not_started',
    };
  }

  // Check if it's a breeder profile
  if ('kycVerified' in profile) {
    return {
      isVerified: profile.kycVerified || false,
      verificationStatus: profile.kycVerified ? 'approved' : 'not_started',
    };
  }

  // Check if it's a pet owner profile
  if ('isVerified' in profile) {
    return {
      isVerified: profile.isVerified || false,
      verificationStatus: profile.isVerified ? 'approved' : 'not_started',
      verifiedAt: profile.verifiedAt,
    };
  }

  return {
    isVerified: false,
    verificationStatus: 'not_started',
  };
}
