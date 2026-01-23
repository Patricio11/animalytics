"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  BadgeCheck,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  User,
  Calendar,
  AlertCircle,
  Download,
  ExternalLink,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface VerificationRequest {
  id: string;
  userId: string;
  verificationType: string;
  status: 'pending' | 'approved' | 'rejected';
  businessName?: string;
  registrationNumber?: string;
  documents?: any[];
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  };
}

export default function AdminVerificationsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');

  // Fetch all verification requests
  const { data: verifications, isLoading } = useQuery({
    queryKey: ['admin-verifications'],
    queryFn: async () => {
      const res = await fetch('/api/admin/verifications');
      if (!res.ok) throw new Error('Failed to fetch verifications');
      return res.json();
    },
  });

  // Review verification mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: 'approved' | 'rejected'; notes: string }) => {
      const res = await fetch(`/api/admin/verifications/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNotes: notes }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to review verification');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      toast({
        title: "Success",
        description: `Verification ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
      setShowReviewDialog(false);
      setSelectedVerification(null);
      setReviewNotes('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to review verification.",
        variant: "destructive",
      });
    },
  });

  const handleReview = (verification: VerificationRequest, action: 'approve' | 'reject') => {
    setSelectedVerification(verification);
    setReviewAction(action);
    setShowReviewDialog(true);
  };

  const handleSubmitReview = () => {
    if (!selectedVerification) return;
    reviewMutation.mutate({
      id: selectedVerification.id,
      status: reviewAction,
      notes: reviewNotes,
    });
  };

  const filteredVerifications = verifications?.verifications?.filter(
    (v: VerificationRequest) => v.status === activeTab
  ) || [];

  const pendingCount = verifications?.verifications?.filter((v: VerificationRequest) => v.status === 'pending').length || 0;
  const approvedCount = verifications?.verifications?.filter((v: VerificationRequest) => v.status === 'approved').length || 0;
  const rejectedCount = verifications?.verifications?.filter((v: VerificationRequest) => v.status === 'rejected').length || 0;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Verification Management</h1>
            <p className="text-muted-foreground mt-1">
              Review and manage user verification requests
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            {pendingCount} Pending
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{pendingCount}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{approvedCount}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{rejectedCount}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="shadow-card">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">
                  <Clock className="w-4 h-4 mr-2" />
                  Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approved ({approvedCount})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejected ({rejectedCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : filteredVerifications.length === 0 ? (
              <div className="text-center py-12">
                <BadgeCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  No {activeTab} verifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'pending'
                    ? "All verification requests have been reviewed"
                    : `No ${activeTab} verification requests found`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVerifications.map((verification: VerificationRequest) => (
                  <Card key={verification.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* User Avatar */}
                        <Avatar className="h-12 w-12">
                          {verification.user?.image && (
                            <AvatarImage src={verification.user.image} />
                          )}
                          <AvatarFallback className="bg-primary/10">
                            {verification.user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Verification Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {verification.user?.name || 'Unknown User'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {verification.user?.email}
                              </p>
                            </div>
                            <Badge
                              variant={
                                verification.status === 'approved'
                                  ? 'default'
                                  : verification.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {verification.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-muted-foreground">Verification Type</p>
                              <p className="font-medium">{verification.verificationType || 'Breeder'}</p>
                            </div>
                            {verification.businessName && (
                              <div>
                                <p className="text-muted-foreground">Business Name</p>
                                <p className="font-medium">{verification.businessName}</p>
                              </div>
                            )}
                            {verification.registrationNumber && (
                              <div>
                                <p className="text-muted-foreground">Registration Number</p>
                                <p className="font-medium">{verification.registrationNumber}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-muted-foreground">Submitted</p>
                              <p className="font-medium">
                                {formatDistanceToNow(new Date(verification.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>

                          {/* Documents */}
                          {verification.documents && verification.documents.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-2">Submitted Documents</p>
                              <div className="flex flex-wrap gap-2">
                                {verification.documents.map((doc: any, idx: number) => (
                                  <a
                                    key={idx}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-muted transition-colors text-sm"
                                  >
                                    <FileText className="w-4 h-4" />
                                    <span className="truncate max-w-[200px]">
                                      {doc.name || `Document ${idx + 1}`}
                                    </span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Review Notes */}
                          {verification.reviewNotes && (
                            <div className="p-3 bg-muted rounded-lg mb-4">
                              <p className="text-sm font-medium mb-1">Review Notes</p>
                              <p className="text-sm text-muted-foreground">{verification.reviewNotes}</p>
                              {verification.reviewedAt && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Reviewed {formatDistanceToNow(new Date(verification.reviewedAt), { addSuffix: true })}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/users/${verification.userId}`)}
                            >
                              <User className="w-4 h-4 mr-2" />
                              View User
                            </Button>
                            {verification.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleReview(verification, 'approve')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReview(verification, 'reject')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Verification Request
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? 'This user will be granted verified status and associated permissions.'
                : 'This user will be notified that their verification request was rejected.'}
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10">
                    {selectedVerification.user?.image && (
                      <AvatarImage src={selectedVerification.user.image} />
                    )}
                    <AvatarFallback>
                      {selectedVerification.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedVerification.user?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedVerification.user?.email}
                    </p>
                  </div>
                </div>
                {selectedVerification.businessName && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Business:</span>{' '}
                    {selectedVerification.businessName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="reviewNotes">
                  Review Notes {reviewAction === 'reject' && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id="reviewNotes"
                  placeholder={
                    reviewAction === 'approve'
                      ? 'Optional notes about this approval...'
                      : 'Please provide a reason for rejection...'
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
                {reviewAction === 'reject' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    The user will receive these notes in their notification
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewDialog(false);
                setReviewNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={reviewMutation.isPending || (reviewAction === 'reject' && !reviewNotes.trim())}
              className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={reviewAction === 'reject' ? 'destructive' : 'default'}
            >
              {reviewMutation.isPending ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
