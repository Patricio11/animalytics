"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Search, Filter, Download, Eye, Trash2, Share2, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function Documents() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // todo: remove mock functionality
  const mockDocuments = [
    {
      id: "1",
      name: "Bella_Health_Certificate_2024.pdf",
      type: "Health Certificate",
      category: "health",
      animalName: "Bella",
      uploadDate: new Date('2024-02-15'),
      size: "2.4 MB",
      uploader: "Dr. Sarah Smith"
    },
    {
      id: "2",
      name: "Max_Pedigree_Registration.pdf",
      type: "Pedigree",
      category: "registration",
      animalName: "Max",
      uploadDate: new Date('2024-02-10'),
      size: "1.8 MB",
      uploader: "VCA Registry"
    },
    {
      id: "3",
      name: "Luna_Vaccination_Record.pdf",
      type: "Vaccination Record",
      category: "health",
      animalName: "Luna",
      uploadDate: new Date('2024-02-08'),
      size: "1.2 MB",
      uploader: "Dr. Michael Chen"
    },
    {
      id: "4",
      name: "Breeding_Contract_Template.docx",
      type: "Contract Template",
      category: "legal",
      animalName: null,
      uploadDate: new Date('2024-02-05'),
      size: "854 KB",
      uploader: "Legal Team"
    },
    {
      id: "5",
      name: "Duke_Show_Photos.zip",
      type: "Show Photos",
      category: "photos",
      animalName: "Duke",
      uploadDate: new Date('2024-02-01'),
      size: "15.6 MB",
      uploader: "Professional Photos"
    },
    {
      id: "6",
      name: "Whelping_Area_Setup.pdf",
      type: "Setup Guide",
      category: "whelping",
      animalName: null,
      uploadDate: new Date('2024-01-28'),
      size: "3.2 MB",
      uploader: "Breeding Guide"
    },
    {
      id: "7",
      name: "Bella_Hip_Dysplasia_Results.pdf",
      type: "Health Test",
      category: "health",
      animalName: "Bella",
      uploadDate: new Date('2024-01-25'),
      size: "2.1 MB",
      uploader: "Orthopedic Vet"
    },
    {
      id: "8",
      name: "Insurance_Policy_2024.pdf",
      type: "Insurance",
      category: "legal",
      animalName: null,
      uploadDate: new Date('2024-01-20'),
      size: "1.5 MB",
      uploader: "Pet Insurance Co."
    }
  ];

  const categories = [
    { value: "all", label: "All Documents", count: mockDocuments.length },
    { value: "health", label: "Health & Medical", count: mockDocuments.filter(d => d.category === "health").length },
    { value: "registration", label: "Registration", count: mockDocuments.filter(d => d.category === "registration").length },
    { value: "photos", label: "Photos", count: mockDocuments.filter(d => d.category === "photos").length },
    { value: "whelping", label: "Whelping Areas", count: mockDocuments.filter(d => d.category === "whelping").length },
    { value: "legal", label: "Legal & Contracts", count: mockDocuments.filter(d => d.category === "legal").length },
  ];

  const filteredDocuments = selectedCategory === "all"
    ? mockDocuments
    : mockDocuments.filter(doc => doc.category === selectedCategory);

  const handleView = (doc: typeof mockDocuments[0]) => {
    console.log(`View document: ${doc.name}`);
  };

  const handleDownload = (doc: typeof mockDocuments[0]) => {
    console.log(`Download document: ${doc.name}`);
  };

  const handleShare = (doc: typeof mockDocuments[0]) => {
    console.log(`Share document: ${doc.name}`);
  };

  const handleDelete = (doc: typeof mockDocuments[0]) => {
    console.log(`Delete document: ${doc.name}`);
  };

  const getFileTypeIcon = (type: string) => {
    return <FileText className="w-4 h-4 text-primary" />;
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      health: 'bg-chart-3/10 text-chart-3',
      registration: 'bg-primary/10 text-primary',
      photos: 'bg-chart-4/10 text-chart-4',
      whelping: 'bg-chart-2/10 text-chart-2',
      legal: 'bg-destructive/10 text-destructive'
    };
    return colors[category as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground">Organize and manage all your breeding documents</p>
        </div>
        <Button data-testid="button-upload-document">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{mockDocuments.length}</div>
            <div className="text-sm text-muted-foreground">Total Documents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {(mockDocuments.reduce((acc, doc) => acc + parseFloat(doc.size.split(' ')[0]), 0)).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Total Size (MB)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {mockDocuments.filter(d => d.category === "health").length}
            </div>
            <div className="text-sm text-muted-foreground">Health Records</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {new Set(mockDocuments.filter(d => d.animalName).map(d => d.animalName)).size}
            </div>
            <div className="text-sm text-muted-foreground">Animals Documented</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-10"
                data-testid="input-search-documents"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-animal">
                <SelectValue placeholder="Animal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Animals</SelectItem>
                <SelectItem value="bella">Bella</SelectItem>
                <SelectItem value="max">Max</SelectItem>
                <SelectItem value="luna">Luna</SelectItem>
                <SelectItem value="duke">Duke</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-[140px]" data-testid="select-date">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-filter-documents">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
          {categories.map((category) => (
            <TabsTrigger key={category.value} value={category.value} className="text-xs sm:text-sm">
              <span className="hidden sm:inline">{category.label}</span>
              <span className="sm:hidden">{category.label.split(' ')[0]}</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Documents List */}
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover-elevate" data-testid={`card-document-${doc.id}`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getFileTypeIcon(doc.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-foreground truncate" data-testid={`text-document-name-${doc.id}`}>
                            {doc.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline" className={getCategoryBadge(doc.category)}>
                              {doc.type}
                            </Badge>
                            {doc.animalName && (
                              <Badge variant="outline">
                                {doc.animalName}
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{format(doc.uploadDate, 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{doc.uploader}</span>
                            </div>
                            <span>{doc.size}</span>
                          </div>
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleView(doc)}
                            data-testid={`button-view-${doc.id}`}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(doc)}
                            data-testid={`button-download-${doc.id}`}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleShare(doc)}
                            data-testid={`button-share-${doc.id}`}
                          >
                            <Share2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(doc)}
                            data-testid={`button-delete-${doc.id}`}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
              <p className="text-muted-foreground">Upload your first document to get started.</p>
            </div>
          )}
          </TabsContent>
        </Tabs>
      </div>
  );
}