"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageUpload from "@/components/ImageUpload";
import { updateProfile } from "@/actions/profile.action";
import toast from "react-hot-toast";
import { Loader2Icon } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const MAX_LENGTHS = {
  name: 30,
  bio: 160,
  location: 30,
  website: 100,
} as const;

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
}: EditProfileDialogProps) {
  const { user: currentUser } = useUser();
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setEditForm({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
      });
      setPreviewImage(null);
    }
  }, [open, user.name, user.bio, user.location, user.website]);

  const isValidURL = (url: string) => {
    const pattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-]*)*\/?$/;
    return pattern.test(url);
  };

  const handleFieldChange = (field: keyof typeof editForm, value: string) => {
    const maxLength = MAX_LENGTHS[field];
    setEditForm({ ...editForm, [field]: value.slice(0, maxLength) });
  };

  const handleSubmit = async () => {
    const { name, website } = editForm;

    if (name.trim().length === 0) {
      toast.error("Name is required.");
      return;
    }

    if (website && !isValidURL(website)) {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setIsSaving(true);

    try {
      if (previewImage) {
        const blob = await fetch(previewImage).then((r) => r.blob());
        await currentUser?.setProfileImage({ file: blob });

        await fetch("/api/profile/image", {
          method: "POST",
          body: JSON.stringify({ imageUrl: previewImage }),
        });
      }

      const formData = new FormData();
      Object.entries(editForm).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const result = await updateProfile(formData);
      if (result.success) {
        toast.success("Profile updated successfully.");
        onOpenChange(false);
      }
    } catch (err) {
      toast.error("Failed to update profile image");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[calc(100vh-100px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information including name, bio, location, and website.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <ProfileImageSection
            previewImage={previewImage}
            onPreviewChange={setPreviewImage}
          />

          <FormField
            label="Name"
            value={editForm.name}
            onChange={(v) => handleFieldChange("name", v)}
            placeholder="Your name"
            maxLength={MAX_LENGTHS.name}
          />

          <FormField
            label="Bio"
            value={editForm.bio}
            onChange={(v) => handleFieldChange("bio", v)}
            placeholder="Tell us about yourself"
            maxLength={MAX_LENGTHS.bio}
            isTextarea
          />

          <FormField
            label="Location"
            value={editForm.location}
            onChange={(v) => handleFieldChange("location", v)}
            placeholder="Where are you based?"
            maxLength={MAX_LENGTHS.location}
          />

          <FormField
            label="Website"
            value={editForm.website}
            onChange={(v) => handleFieldChange("website", v)}
            placeholder="https://yourwebsite.com"
            maxLength={MAX_LENGTHS.website}
          />
        </div>

        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ProfileImageSectionProps {
  previewImage: string | null;
  onPreviewChange: (url: string | null) => void;
}

function ProfileImageSection({
  previewImage,
  onPreviewChange,
}: ProfileImageSectionProps) {
  return (
    <div className="space-y-2">
      <Label>Profile Image</Label>
      <ImageUpload
        endpoint="profileImage"
        value={previewImage || ""}
        onChange={onPreviewChange}
      />
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  isTextarea?: boolean;
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  isTextarea = false,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {isTextarea ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px]"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      <p className="text-xs text-muted-foreground text-right">
        {value.length}/{maxLength}
      </p>
    </div>
  );
}
