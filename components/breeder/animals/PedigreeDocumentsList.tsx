"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DocumentUpload } from "@/components/upload";
import { STORAGE_PATHS } from "@/lib/supabase";
import {
  FileText,
  Download,
  Trash2,
  Upload,
  AlertCircle,
  File,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PedigreeDocumentsListProps {
  animalId: string;
}

export function PedigreeDocumentsList({ animalId }: PedigreeDocumentsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

  // Fetch documents
  const { data, isLoading, error } = useQuery({
    queryKey: ["pedigree-documents", animalId],
    queryFn: async () => {
      const response = await fetch(
        `/api/animals/${animalId}/pedigree/documents`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      return response.json();
    },
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (fileUrl: string) => {
      const response = await fetch(
        `/api/animals/${animalId}/pedigree/documents`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileUrl,
            title: "Pedigree Document",
            fileName: fileUrl.split("/").pop(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedigree-documents", animalId] });
      setShowUpload(false);
      toast({
        title: "Document Uploaded",
        description: "Pedigree document uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(
        `/api/animals/${animalId}/pedigree/documents?documentId=${documentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedigree-documents", animalId] });
      toast({
        title: "Document Deleted",
        description: "Document removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (documentId: number) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const getFileIcon = (mimeType?: string | null) => {
    if (!mimeType) return <File className="w-8 h-8 text-muted-foreground" />;

    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    }

    if (mimeType === "application/pdf") {
      return <FileText className="w-8 h-8 text-red-500" />;
    }

    return <File className="w-8 h-8 text-muted-foreground" />;
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "Unknown size";

    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Card className="shadow-card bg-surface border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Pedigree Documents</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowUpload(!showUpload)}
            className="hover:bg-primary/10 hover:border-primary"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upload Section */}
        {showUpload && (
          <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
            <DocumentUpload
              storagePath={STORAGE_PATHS.PEDIGREE_DOCUMENTS}
              onUploadSuccess={(result) => {
                uploadMutation.mutate(result.url!);
                setShowUpload(false);
              }}
              onUploadError={(error) => {
                toast({
                  title: "Upload Failed",
                  description: error,
                  variant: "destructive",
                });
              }}
              label="Upload Pedigree Document"
              helperText="PDF, DOC, or image files up to 10MB"
              maxSizeInMB={10}
            />
          </div>
        )}

        {/* Documents List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load documents</AlertDescription>
          </Alert>
        ) : data?.documents && data.documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.documents.map((doc: any) => (
              <div
                key={doc.id}
                className="flex flex-col gap-3 p-4 border border-primary/10 rounded-lg hover:bg-primary/5 transition-colors hover:shadow-md"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(doc.mimeType)}
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {doc.title || doc.fileName || "Untitled Document"}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(doc.fileSize)}
                    </Badge>

                    {doc.uploadedAt && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>

                  {doc.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {doc.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-primary/10">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(doc.fileUrl, "_blank")}
                    className="flex-1 hover:bg-primary/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    View
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(doc.id)}
                    className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No documents uploaded yet
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setShowUpload(true)}
            >
              Upload First Document
            </Button>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
