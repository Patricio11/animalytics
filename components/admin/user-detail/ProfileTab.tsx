"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BreedMultiSelect } from "@/components/ui/breed-multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, User as UserIcon, Heart, Award, Tag, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileTabProps {
  userId: string;
  user: any;
}

export function ProfileTab({ userId, user }: ProfileTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(user.role || "breeder");
  const [organization, setOrganization] = useState(user.organization || "");
  const [licenseNumber, setLicenseNumber] = useState(user.licenseNumber || "");
  const [certifications, setCertifications] = useState<string[]>(user.certifications || []);
  const [specializations, setSpecializations] = useState<string[]>(user.specializations || []);
  const [selectedBreedIds, setSelectedBreedIds] = useState<string[]>(user.breedIds || []);

  // Reset state when user changes
  useEffect(() => {
    setName(user.name || "");
    setEmail(user.email || "");
    setRole(user.role || "breeder");
    setOrganization(user.organization || "");
    setLicenseNumber(user.licenseNumber || "");
    setCertifications(user.certifications || []);
    setSpecializations(user.specializations || []);
    setSelectedBreedIds(user.breedIds || []);
  }, [user]);

  const { data: breedsData } = useQuery({
    queryKey: ["breeds"],
    queryFn: async () => {
      const res = await fetch("/api/breeds");
      return res.json();
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role,
          organization,
          licenseNumber,
          certifications,
          specializations,
          breedIds: role === "breeder" ? selectedBreedIds : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      toast({ title: "Saved", description: "Profile updated." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  return (
    <Card className="shadow-card">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Profile Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="p-name">Full Name *</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="p-email">Email *</Label>
            <Input id="p-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="p-role">Role *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="p-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breeder">Breeder</SelectItem>
                <SelectItem value="pet_owner">Pet Owner</SelectItem>
                <SelectItem value="veterinarian">Veterinarian</SelectItem>
                <SelectItem value="event_organizer">Event Organizer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="p-org">Organization</Label>
            <Input id="p-org" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          </div>
        </div>

        <div>
          <Label htmlFor="p-license">License Number</Label>
          <Input id="p-license" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
        </div>

        {/* Breed preferences */}
        {role === "breeder" && (
          <div className="p-4 bg-muted/30 rounded-lg border border-primary/10 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-primary" />
              <Label>Breed Preferences</Label>
            </div>
            <BreedMultiSelect
              breeds={
                breedsData?.breeds?.map((breed: any) => ({
                  id: breed.id,
                  name: breed.name,
                  sizeCategory: breed.sizeCategory,
                })) || []
              }
              selectedBreedIds={selectedBreedIds}
              onSelectionChange={setSelectedBreedIds}
              placeholder="Search and select breeds..."
              emptyText="No breeds found."
            />
          </div>
        )}

        {/* Specializations + Certifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TagListEditor
            label="Specializations"
            icon={Tag}
            placeholder="e.g. show dogs, working dogs"
            items={specializations}
            onChange={setSpecializations}
          />
          <TagListEditor
            label="Certifications"
            icon={Award}
            placeholder="e.g. AKC Breeder of Merit"
            items={certifications}
            onChange={setCertifications}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={() => save.mutate()} disabled={save.isPending} className="bg-gradient-brand">
            <Save className="w-4 h-4 mr-2" />
            {save.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TagListEditor({
  label,
  icon: Icon,
  placeholder,
  items,
  onChange,
}: {
  label: string;
  icon: any;
  placeholder: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (items.includes(v)) return;
    onChange([...items, v]);
    setInput("");
  };
  return (
    <div>
      <Label className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" onClick={add}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
