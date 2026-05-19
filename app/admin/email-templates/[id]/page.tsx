"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ArrowLeft, Save, Send, RotateCcw, Trash2, Mail, Plus, X, Eye, Code, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Variable {
  name: string;
  description: string;
  example: string;
}

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string;
  subject: string;
  bodyHtml: string;
  variables: Variable[];
  isSystem: boolean;
  enabled: boolean;
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, (_, name) => vars[name] ?? "");
}

export default function EmailTemplateEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [tpl, setTpl] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [variables, setVariables] = useState<Variable[]>([]);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${id}`);
      if (!res.ok) {
        toast({ variant: "destructive", title: "Error", description: "Template not found" });
        router.push("/admin/email-templates");
        return;
      }
      const data = await res.json();
      const t: EmailTemplate = data.template;
      setTpl(t);
      setName(t.name);
      setDescription(t.description || "");
      setSubject(t.subject);
      setBodyHtml(t.bodyHtml);
      setEnabled(t.enabled);
      setVariables(t.variables || []);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load template" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Build example var map for preview
  const exampleVars = useMemo(() => {
    const map: Record<string, string> = {};
    for (const v of variables) map[v.name] = v.example;
    return map;
  }, [variables]);

  const previewSubject = useMemo(() => renderTemplate(subject, exampleVars), [subject, exampleVars]);
  const previewHtml = useMemo(() => renderTemplate(bodyHtml, exampleVars), [bodyHtml, exampleVars]);

  // Find placeholders used in subject + body but not declared
  const usedVarNames = useMemo(() => {
    const found = new Set<string>();
    const re = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
    let m: RegExpExecArray | null;
    for (const text of [subject, bodyHtml]) {
      while ((m = re.exec(text))) found.add(m[1]);
    }
    return Array.from(found);
  }, [subject, bodyHtml]);

  const undeclaredVars = usedVarNames.filter((n) => !variables.some((v) => v.name === n));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, subject, bodyHtml, enabled, variables }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast({ title: "Saved", description: "Template updated." });
      setTpl(data.template);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    try {
      const res = await fetch(`/api/admin/email-templates/${id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vars: exampleVars }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test send failed");
      toast({ title: "Test email sent", description: `Sent to ${data.sentTo}` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch(`/api/admin/email-templates/${id}/reset`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      toast({ title: "Restored to default" });
      setShowReset(false);
      fetchTemplate();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/email-templates/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast({ title: "Template deleted" });
      router.push("/admin/email-templates");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const addVariable = () => {
    setVariables([...variables, { name: "", description: "", example: "" }]);
  };

  const updateVariable = (idx: number, patch: Partial<Variable>) => {
    setVariables(variables.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };

  const removeVariable = (idx: number) => {
    setVariables(variables.filter((_, i) => i !== idx));
  };

  if (loading || !tpl) {
    return (
      <div className="min-h-screen bg-surface-secondary p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/email-templates")}
              className="mt-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{tpl.name}</h1>
                <Badge variant="outline" className="font-mono text-xs">{tpl.key}</Badge>
                {tpl.isSystem ? (
                  <Badge variant="secondary" className="text-xs">System</Badge>
                ) : (
                  <Badge className="text-xs">Custom</Badge>
                )}
                {!enabled && <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">Disabled</Badge>}
              </div>
              {tpl.description && <p className="text-sm text-muted-foreground mt-1">{tpl.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-surface">
              <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
              <Label htmlFor="enabled" className="text-sm cursor-pointer">Enabled</Label>
            </div>
            <Button variant="outline" onClick={handleTestSend}>
              <Send className="w-4 h-4 mr-2" />
              Test Send
            </Button>
            {tpl.isSystem && (
              <Button variant="outline" onClick={() => setShowReset(true)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore Default
              </Button>
            )}
            {!tpl.isSystem && (
              <Button variant="outline" onClick={() => setShowDelete(true)} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-brand">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* Editor + Preview side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: editor */}
          <Card className="shadow-card border-0 bg-surface">
            <CardContent className="p-5 space-y-4">
              <div>
                <Label htmlFor="name">Template name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="bodyHtml">Body (HTML)</Label>
                  <Button variant="ghost" size="sm" onClick={() => setShowCode(!showCode)} className="text-xs h-7">
                    <Code className="w-3 h-3 mr-1" />
                    {showCode ? "Hide code preview" : "Show code preview"}
                  </Button>
                </div>
                <Textarea
                  id="bodyHtml"
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  rows={18}
                  className="font-mono text-xs leading-snug"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use <code className="text-[11px]">{`{{variableName}}`}</code> for placeholders.
                </p>
              </div>

              {undeclaredVars.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-200">
                    <p className="font-medium mb-1">Used but not declared in the variables list below:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {undeclaredVars.map((n) => (
                        <code key={n} className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 font-mono text-[11px]">
                          {`{{${n}}}`}
                        </code>
                      ))}
                    </div>
                    <p className="mt-1">These will render as empty strings unless added to Variables.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: preview */}
          <Card className="shadow-card border-0 bg-surface">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Live preview</Label>
                <span className="text-xs text-muted-foreground ml-auto">Using example variable values</span>
              </div>

              {/* Subject preview */}
              <div className="px-3 py-2 rounded-md bg-muted/40 border">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Subject</p>
                <p className="text-sm font-medium text-foreground">{previewSubject || <span className="text-muted-foreground">(empty)</span>}</p>
              </div>

              {/* Body preview */}
              <div className="border rounded-md bg-white overflow-hidden">
                {showCode ? (
                  <pre className="text-xs p-3 overflow-x-auto whitespace-pre-wrap max-h-[600px]">{previewHtml}</pre>
                ) : (
                  <iframe
                    title="Email preview"
                    srcDoc={previewHtml}
                    className="w-full h-[600px] bg-white"
                    sandbox=""
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Variables */}
        <Card className="shadow-card border-0 bg-surface">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Variables
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Declare every <code className="text-[11px]">{`{{placeholder}}`}</code> you use, with a description and example value for the live preview and test sends.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addVariable}>
                <Plus className="w-4 h-4 mr-1" />
                Add Variable
              </Button>
            </div>

            {variables.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No variables declared yet. Add one to start templating.
              </p>
            ) : (
              <div className="space-y-2">
                {variables.map((v, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr_auto] gap-2 items-start">
                    <Input
                      placeholder="name"
                      value={v.name}
                      onChange={(e) => updateVariable(i, { name: e.target.value.replace(/[^a-zA-Z0-9_]/g, "") })}
                      className="font-mono text-sm"
                    />
                    <Input
                      placeholder="Short description"
                      value={v.description}
                      onChange={(e) => updateVariable(i, { description: e.target.value })}
                    />
                    <Input
                      placeholder="Example value"
                      value={v.example}
                      onChange={(e) => updateVariable(i, { example: e.target.value })}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeVariable(i)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reset confirmation */}
        <AlertDialog open={showReset} onOpenChange={setShowReset}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restore default body?</AlertDialogTitle>
              <AlertDialogDescription>
                This replaces the current subject and body with the original defaults baked into the code. Your variable list and enabled state are kept.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>Restore</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete confirmation */}
        <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this template?</AlertDialogTitle>
              <AlertDialogDescription>
                The template will be removed permanently. Code that references this key will fall back to its hardcoded default (or fail silently if there isn't one).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
