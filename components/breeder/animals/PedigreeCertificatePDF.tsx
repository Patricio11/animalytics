"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type PedigreeNode = {
  id: string;
  name: string;
  registeredName?: string | null;
  breed?: string | null;
  sex?: string | null;
  registrationNumber?: string | null;
  dateOfBirth?: string | null;
  color?: string | null;
  profileImageUrl?: string | null;
  dam?: PedigreeNode | null;
  sire?: PedigreeNode | null;
  isManualEntry?: boolean;
};

interface PedigreeCertificatePDFProps {
  node: PedigreeNode;
  generations?: number;
  breederName?: string;
  breederKennel?: string;
}

export const PedigreeCertificatePDF = React.forwardRef<HTMLDivElement, PedigreeCertificatePDFProps>(
  ({ node, generations = 3, breederName, breederKennel }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white p-12 min-w-[1200px]"
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Certificate Header with Logo */}
        <div className="border-b-4 border-amber-600 pb-6 mb-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Animalytics</h1>
                <p className="text-sm text-gray-600 mt-1">Professional Pedigree Management System</p>
              </div>
            </div>

            {/* Certificate Info */}
            <div className="text-right">
              <div className="text-sm text-gray-600">Certificate Generated</div>
              <div className="text-lg font-semibold text-gray-900">
                {format(new Date(), 'MMMM dd, yyyy')}
              </div>
              {breederKennel && (
                <div className="text-sm text-amber-600 font-medium mt-1">{breederKennel}</div>
              )}
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Three Generation Pedigree Certificate
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
        </div>

        {/* Subject Animal - Featured */}
        <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border-2 border-amber-300 shadow-md">
          <div className="text-center mb-3">
            <div className="inline-block px-4 py-1 bg-amber-600 text-white text-sm font-semibold rounded-full mb-2">
              SUBJECT
            </div>
          </div>
          <PedigreeCardPDF animal={node} featured />
        </div>

        {/* Pedigree Tree */}
        <div className="relative">
          <div className="grid grid-cols-3 gap-6">
            {/* Generation 1 - Parents */}
            <div className="flex flex-col justify-center gap-8">
              <div>
                <div className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wide">
                  Generation 1 - Parents
                </div>
                <PedigreeCardPDF animal={node.sire} label="SIRE (Father)" />
              </div>
              <div>
                <PedigreeCardPDF animal={node.dam} label="DAM (Mother)" />
              </div>
            </div>

            {/* Generation 2 - Grandparents */}
            <div className="flex flex-col justify-center gap-4">
              <div className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wide">
                Generation 2 - Grandparents
              </div>
              <PedigreeCardPDF animal={node.sire?.sire} label="GRANDSIRE" compact />
              <PedigreeCardPDF animal={node.sire?.dam} label="GRANDDAM" compact />
              <PedigreeCardPDF animal={node.dam?.sire} label="GRANDSIRE" compact />
              <PedigreeCardPDF animal={node.dam?.dam} label="GRANDDAM" compact />
            </div>

            {/* Generation 3 - Great Grandparents */}
            <div className="flex flex-col justify-center gap-2">
              <div className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wide">
                Generation 3 - Great Grandparents
              </div>
              <PedigreeCardPDF animal={node.sire?.sire?.sire} compact />
              <PedigreeCardPDF animal={node.sire?.sire?.dam} compact />
              <PedigreeCardPDF animal={node.sire?.dam?.sire} compact />
              <PedigreeCardPDF animal={node.sire?.dam?.dam} compact />
              <PedigreeCardPDF animal={node.dam?.sire?.sire} compact />
              <PedigreeCardPDF animal={node.dam?.sire?.dam} compact />
              <PedigreeCardPDF animal={node.dam?.dam?.sire} compact />
              <PedigreeCardPDF animal={node.dam?.dam?.dam} compact />
            </div>
          </div>
        </div>

        {/* Certificate Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs text-gray-500 mb-1">Certified by</div>
              <div className="text-lg font-semibold text-gray-900">
                {breederName || "Breeder"}
              </div>
              {breederKennel && (
                <div className="text-sm text-gray-600">{breederKennel}</div>
              )}
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Certificate ID</div>
              <div className="text-sm font-mono text-gray-700">
                {node.id.substring(0, 8).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>This certificate was generated by Animalytics Professional Pedigree Management System</p>
            <p className="mt-1">© {new Date().getFullYear()} Animalytics. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }
);

PedigreeCertificatePDF.displayName = "PedigreeCertificatePDF";

// ============================================================================
// PEDIGREE CARD FOR PDF
// ============================================================================

interface PedigreeCardPDFProps {
  animal: PedigreeNode | null | undefined;
  label?: string;
  compact?: boolean;
  featured?: boolean;
}

function PedigreeCardPDF({ animal, label, compact = false, featured = false }: PedigreeCardPDFProps) {
  if (!animal) {
    return (
      <div
        className={cn(
          "border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center",
          compact ? "p-2 min-h-[50px]" : "p-3 min-h-[80px]"
        )}
      >
        <p className="text-xs text-gray-400 text-center">Unknown</p>
      </div>
    );
  }

  const sexColors = {
    male: "border-l-4 border-l-blue-500 bg-blue-50",
    female: "border-l-4 border-l-pink-500 bg-pink-50",
  };

  const sexBadgeColors = {
    male: "bg-blue-100 text-blue-800",
    female: "bg-pink-100 text-pink-800",
  };

  return (
    <div
      className={cn(
        "border-2 rounded-lg shadow-sm",
        animal.sex ? sexColors[animal.sex as keyof typeof sexColors] : "border-gray-300 bg-white",
        compact ? "p-2" : featured ? "p-6" : "p-3"
      )}
    >
      {label && !featured && (
        <div className="text-xs font-bold text-amber-700 mb-1 uppercase tracking-wide">
          {label}
        </div>
      )}

      <div className={cn("space-y-1", featured && "space-y-2")}>
        {/* Name */}
        <div className={cn(
          "font-bold text-gray-900",
          featured ? "text-2xl" : compact ? "text-sm" : "text-base"
        )}>
          {animal.name}
          {animal.isManualEntry && (
            <span className="ml-2 text-xs font-normal text-amber-600">(External)</span>
          )}
        </div>

        {/* Registered Name */}
        {animal.registeredName && !compact && (
          <div className={cn(
            "text-gray-600 italic",
            featured ? "text-base" : "text-xs"
          )}>
            {animal.registeredName}
          </div>
        )}

        {/* Details */}
        {!compact && (
          <div className={cn("flex flex-wrap gap-2", featured && "gap-3 mt-3")}>
            {animal.sex && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium",
                  sexBadgeColors[animal.sex as keyof typeof sexBadgeColors],
                  featured && "px-3 py-1 text-sm"
                )}
              >
                {animal.sex === "male" ? "♂ Male" : "♀ Female"}
              </span>
            )}
            {animal.breed && (
              <span className={cn(
                "px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs",
                featured && "px-3 py-1 text-sm"
              )}>
                {animal.breed}
              </span>
            )}
            {animal.color && (
              <span className={cn(
                "px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs",
                featured && "px-3 py-1 text-sm"
              )}>
                {animal.color}
              </span>
            )}
          </div>
        )}

        {/* Registration & DOB */}
        {!compact && (animal.registrationNumber || animal.dateOfBirth) && (
          <div className={cn("text-xs text-gray-600 space-y-0.5", featured && "text-sm mt-2")}>
            {animal.registrationNumber && (
              <div>
                <span className="font-medium">Reg #:</span> {animal.registrationNumber}
              </div>
            )}
            {animal.dateOfBirth && (
              <div>
                <span className="font-medium">DOB:</span>{" "}
                {format(new Date(animal.dateOfBirth), "MMM dd, yyyy")}
              </div>
            )}
          </div>
        )}

        {/* Compact view - just sex indicator */}
        {compact && animal.sex && (
          <div className="text-xs text-gray-600">
            {animal.sex === "male" ? "♂" : "♀"}
          </div>
        )}
      </div>
    </div>
  );
}
