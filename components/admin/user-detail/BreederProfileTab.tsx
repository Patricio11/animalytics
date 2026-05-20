"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Building2, MapPin, Globe, Share2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BreederProfileTabProps {
  userId: string;
  user: any;
}

export function BreederProfileTab({ userId, user }: BreederProfileTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const profile = user.breederProfile;

  // Branding
  const [displayName, setDisplayName] = useState(profile?.displayName || user.name || "");
  const [slug, setSlug] = useState(profile?.slug || "");
  const [tagline, setTagline] = useState(profile?.tagline || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [isPublic, setIsPublic] = useState(profile?.isPublic ?? true);

  // Business
  const [businessName, setBusinessName] = useState(profile?.businessName || "");
  const [businessType, setBusinessType] = useState(profile?.businessType || "");
  const [registrationNumber, setRegistrationNumber] = useState(profile?.registrationNumber || "");
  const [yearsInBusiness, setYearsInBusiness] = useState<string>(
    profile?.yearsInBusiness?.toString() || ""
  );
  const [establishedYear, setEstablishedYear] = useState<string>(
    profile?.establishedYear?.toString() || ""
  );

  // Contact
  const [publicEmail, setPublicEmail] = useState(profile?.publicEmail || "");
  const [publicPhone, setPublicPhone] = useState(profile?.publicPhone || "");
  const [website, setWebsite] = useState(profile?.website || "");

  // Social
  const social = profile?.socialMedia || {};
  const [facebook, setFacebook] = useState(social.facebook || "");
  const [instagram, setInstagram] = useState(social.instagram || "");
  const [twitter, setTwitter] = useState(social.twitter || "");
  const [youtube, setYoutube] = useState(social.youtube || "");
  const [tiktok, setTiktok] = useState(social.tiktok || "");

  // Location
  const location = profile?.location || {};
  const [city, setCity] = useState(location.city || "");
  const [state, setState] = useState(location.state || "");
  const [country, setCountry] = useState(location.country || "");

  // Reset on user change
  useEffect(() => {
    const p = user.breederProfile;
    setDisplayName(p?.displayName || user.name || "");
    setSlug(p?.slug || "");
    setTagline(p?.tagline || "");
    setBio(p?.bio || "");
    setIsPublic(p?.isPublic ?? true);
    setBusinessName(p?.businessName || "");
    setBusinessType(p?.businessType || "");
    setRegistrationNumber(p?.registrationNumber || "");
    setYearsInBusiness(p?.yearsInBusiness?.toString() || "");
    setEstablishedYear(p?.establishedYear?.toString() || "");
    setPublicEmail(p?.publicEmail || "");
    setPublicPhone(p?.publicPhone || "");
    setWebsite(p?.website || "");
    const sm = p?.socialMedia || {};
    setFacebook(sm.facebook || "");
    setInstagram(sm.instagram || "");
    setTwitter(sm.twitter || "");
    setYoutube(sm.youtube || "");
    setTiktok(sm.tiktok || "");
    const loc = p?.location || {};
    setCity(loc.city || "");
    setState(loc.state || "");
    setCountry(loc.country || "");
  }, [user]);

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}/breeder-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          slug: slug || undefined,
          tagline: tagline || null,
          bio: bio || null,
          isPublic,
          businessName: businessName || null,
          businessType: businessType || null,
          registrationNumber: registrationNumber || null,
          yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : null,
          establishedYear: establishedYear ? parseInt(establishedYear) : null,
          publicEmail: publicEmail || null,
          publicPhone: publicPhone || null,
          website: website || null,
          socialMedia: { facebook, instagram, twitter, youtube, tiktok },
          location: { city, state, country },
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
      toast({ title: "Saved", description: "Breeder profile updated." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  if (user.role !== "breeder") {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium">Not a breeder</p>
          <p className="text-sm text-muted-foreground">
            Change this user's role to "Breeder" in the Profile tab to enable the breeder profile.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Branding */}
      <Card className="shadow-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Public Branding</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bp-display">Display Name *</Label>
              <Input id="bp-display" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bp-slug">Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">/breeders/</span>
                <Input
                  id="bp-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  className="font-mono text-sm"
                />
                {slug && (
                  <a
                    href={`/breeders/${slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="bp-tagline">Tagline</Label>
            <Input id="bp-tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Short catchphrase" />
          </div>
          <div>
            <Label htmlFor="bp-bio">Bio</Label>
            <Textarea id="bp-bio" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
            <Switch id="bp-public" checked={isPublic} onCheckedChange={setIsPublic} />
            <div>
              <Label htmlFor="bp-public" className="cursor-pointer font-medium">Profile is public</Label>
              <p className="text-xs text-muted-foreground">When off, the profile is hidden from the public breeders directory.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business */}
      <Card className="shadow-card">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-semibold">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bp-bname">Business Name</Label>
              <Input id="bp-bname" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bp-btype">Business Type</Label>
              <Select value={businessType || "_none"} onValueChange={(v) => setBusinessType(v === "_none" ? "" : v)}>
                <SelectTrigger id="bp-btype">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Not specified</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="kennel">Kennel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bp-reg">Registration Number</Label>
              <Input id="bp-reg" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bp-years">Years in Business</Label>
              <Input id="bp-years" type="number" value={yearsInBusiness} onChange={(e) => setYearsInBusiness(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bp-est">Established Year</Label>
              <Input id="bp-est" type="number" value={establishedYear} onChange={(e) => setEstablishedYear(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="shadow-card">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-semibold">Public Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bp-pemail">Public Email</Label>
              <Input id="bp-pemail" type="email" value={publicEmail} onChange={(e) => setPublicEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bp-pphone">Public Phone</Label>
              <Input id="bp-pphone" value={publicPhone} onChange={(e) => setPublicPhone(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="bp-web" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </Label>
            <Input id="bp-web" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="shadow-card">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bp-city">City</Label>
              <Input id="bp-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bp-state">State / Province</Label>
              <Input id="bp-state" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bp-country">Country</Label>
              <Input id="bp-country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social media */}
      <Card className="shadow-card">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            Social Media
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SocialField label="Facebook" value={facebook} onChange={setFacebook} placeholder="https://facebook.com/..." />
            <SocialField label="Instagram" value={instagram} onChange={setInstagram} placeholder="https://instagram.com/..." />
            <SocialField label="X / Twitter" value={twitter} onChange={setTwitter} placeholder="https://x.com/..." />
            <SocialField label="YouTube" value={youtube} onChange={setYoutube} placeholder="https://youtube.com/..." />
            <SocialField label="TikTok" value={tiktok} onChange={setTiktok} placeholder="https://tiktok.com/@..." />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end sticky bottom-4">
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="bg-gradient-brand shadow-lg">
          <Save className="w-4 h-4 mr-2" />
          {save.isPending ? "Saving..." : "Save Breeder Profile"}
        </Button>
      </div>
    </div>
  );
}

function SocialField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
