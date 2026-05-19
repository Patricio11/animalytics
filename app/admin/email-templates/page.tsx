"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Plus, Search, Edit, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string;
  subject: string;
  bodyHtml: string;
  variables: { name: string; description: string; example: string }[];
  isSystem: boolean;
  enabled: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  messaging: "Messaging",
  progesterone: "Progesterone & Breeding",
  marketplace: "Marketplace",
  system: "System",
  general: "General",
};

const CATEGORY_ORDER = ["onboarding", "messaging", "progesterone", "marketplace", "system", "general"];

export default function AdminEmailTemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [newTemplate, setNewTemplate] = useState({
    key: "",
    name: "",
    description: "",
    category: "general",
    subject: "",
    bodyHtml: "",
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load templates" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = q
      ? templates.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.key.toLowerCase().includes(q) ||
            (t.description?.toLowerCase().includes(q) ?? false)
        )
      : templates;

    const groups: Record<string, EmailTemplate[]> = {};
    for (const t of filtered) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    }
    return groups;
  }, [templates, search]);

  const handleCreate = async () => {
    if (!newTemplate.key || !newTemplate.name || !newTemplate.subject || !newTemplate.bodyHtml) {
      toast({ variant: "destructive", title: "Error", description: "Key, name, subject and body are required" });
      return;
    }
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast({ title: "Template created", description: `"${newTemplate.name}" is ready to edit.` });
      setShowCreate(false);
      setNewTemplate({ key: "", name: "", description: "", category: "general", subject: "", bodyHtml: "" });
      // Jump straight into the editor for the new template
      router.push(`/admin/email-templates/${data.template.id}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const enabledCount = templates.filter((t) => t.enabled).length;
  const customCount = templates.filter((t) => !t.isSystem).length;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Mail className="w-7 h-7 text-primary" />
              Email Templates
            </h1>
            <p className="text-muted-foreground mt-1">
              Edit the subject and body of every email the platform sends, or add custom ones.
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-gradient-brand hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add Template
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total templates" value={templates.length} />
          <StatCard label="Enabled" value={enabledCount} accent="text-green-600" />
          <StatCard label="Custom" value={customCount} accent="text-blue-600" />
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, key or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Grouped list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-lg font-medium">No templates found</p>
              <p className="text-sm text-muted-foreground">
                {search ? "Try a different search" : "Click 'Add Template' to create your first one"}
              </p>
            </CardContent>
          </Card>
        ) : (
          CATEGORY_ORDER.filter((cat) => grouped[cat]?.length > 0).map((cat) => (
            <div key={cat} className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                {CATEGORY_LABELS[cat] || cat}
                <span className="ml-2 text-xs font-normal">{grouped[cat].length}</span>
              </h2>
              {grouped[cat].map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-surface hover:bg-surface-secondary transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/email-templates/${tpl.id}`)}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground truncate">{tpl.name}</p>
                      <Badge variant="outline" className="text-[10px] font-mono shrink-0">{tpl.key}</Badge>
                      {!tpl.enabled && (
                        <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          Disabled
                        </Badge>
                      )}
                      {!tpl.isSystem && (
                        <Badge variant="secondary" className="text-[10px]">Custom</Badge>
                      )}
                    </div>
                    {tpl.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{tpl.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5 italic truncate">
                      Subject: {tpl.subject}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ))
        )}

        {/* Create dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Email Template</DialogTitle>
              <DialogDescription>
                Create a new custom email template. You can add variables and edit the body in the next step.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tpl-key">Key *</Label>
                <Input
                  id="tpl-key"
                  value={newTemplate.key}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      key: e.target.value.replace(/[^a-z0-9_]/gi, "_").toLowerCase(),
                    })
                  }
                  placeholder="e.g. monthly_newsletter"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">Used in code to look up this template. Lowercase, snake_case.</p>
              </div>
              <div>
                <Label htmlFor="tpl-name">Name *</Label>
                <Input
                  id="tpl-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g. Monthly Newsletter"
                />
              </div>
              <div>
                <Label htmlFor="tpl-description">Description</Label>
                <Textarea
                  id="tpl-description"
                  rows={2}
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="What's this email for?"
                />
              </div>
              <div>
                <Label htmlFor="tpl-category">Category</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(v) => setNewTemplate({ ...newTemplate, category: v })}
                >
                  <SelectTrigger id="tpl-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_ORDER.map((cat) => (
                      <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tpl-subject">Subject *</Label>
                <Input
                  id="tpl-subject"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  placeholder="e.g. Your monthly update from Animalytics"
                />
              </div>
              <div>
                <Label htmlFor="tpl-body">Body (HTML) *</Label>
                <Textarea
                  id="tpl-body"
                  rows={6}
                  value={newTemplate.bodyHtml}
                  onChange={(e) => setNewTemplate({ ...newTemplate, bodyHtml: e.target.value })}
                  placeholder="<p>Hello {{name}}, ...</p>"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use <code className="text-[11px]">{`{{variableName}}`}</code> for placeholders. You'll define variables in the editor.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create and Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <Settings className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${accent || "text-foreground"}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
