import { BadgeCheck, Shield, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  isVerified: boolean;
  verificationStatus?: 'approved' | 'pending' | 'rejected' | 'not_started' | 'expired';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  tooltipText?: string;
}

export function VerifiedBadge({
  isVerified,
  verificationStatus = 'not_started',
  size = 'md',
  showLabel = false,
  className,
  tooltipText,
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const badgeSizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  // Verified - Blue checkmark like social media
  if (isVerified && verificationStatus === 'approved') {
    const content = showLabel ? (
      <Badge className={cn("bg-blue-500 hover:bg-blue-600 text-white border-0", badgeSizeClasses[size], className)}>
        <BadgeCheck className={cn(sizeClasses[size], "mr-1")} />
        Verified
      </Badge>
    ) : (
      <BadgeCheck className={cn(sizeClasses[size], "text-blue-500", className)} />
    );

    if (tooltipText || !showLabel) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center cursor-help">
                {content}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipText || "Verified Account"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  }

  // Pending Review
  if (verificationStatus === 'pending') {
    const content = showLabel ? (
      <Badge variant="outline" className={cn("border-yellow-500 text-yellow-600", badgeSizeClasses[size], className)}>
        <Clock className={cn(sizeClasses[size], "mr-1")} />
        Pending
      </Badge>
    ) : (
      <Clock className={cn(sizeClasses[size], "text-yellow-500", className)} />
    );

    if (tooltipText || !showLabel) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center cursor-help">
                {content}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipText || "Verification Pending Review"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  }

  // Rejected
  if (verificationStatus === 'rejected') {
    const content = showLabel ? (
      <Badge variant="destructive" className={cn(badgeSizeClasses[size], className)}>
        <AlertCircle className={cn(sizeClasses[size], "mr-1")} />
        Rejected
      </Badge>
    ) : (
      <AlertCircle className={cn(sizeClasses[size], "text-destructive", className)} />
    );

    if (tooltipText || !showLabel) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center cursor-help">
                {content}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipText || "Verification Rejected"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  }

  // Not Verified / Not Started
  if (showLabel) {
    const content = (
      <Badge variant="secondary" className={cn("bg-muted text-muted-foreground", badgeSizeClasses[size], className)}>
        <Shield className={cn(sizeClasses[size], "mr-1")} />
        Not Verified
      </Badge>
    );

    if (tooltipText) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center cursor-help">
                {content}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  }

  return null;
}

// Compact version for cards and lists
export function VerifiedCheckmark({ isVerified, className }: { isVerified: boolean; className?: string }) {
  if (!isVerified) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <BadgeCheck className={cn("w-5 h-5 text-blue-500", className)} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Account</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
