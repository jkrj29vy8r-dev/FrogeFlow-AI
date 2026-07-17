"use client";

import { useState, useActionState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { User as UserIcon, Lock, Globe, Bell, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateProfile, updatePreferences } from "@/features/dashboard/actions/profile.actions";

type Tab = "profile" | "security" | "preferences" | "notifications" | "danger";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "security", label: "Security", icon: Lock },
  { id: "preferences", label: "Preferences", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "danger", label: "Danger zone", icon: Trash2 },
];

interface SettingsViewProps {
  user: User;
  profile: Profile | null;
}

export function SettingsView({ user, profile }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, null);
  const [prefsState, prefsAction, prefsPending] = useActionState(updatePreferences, null);

  const fullName = profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "";
  const email = user.email ?? "";
  const username = profile?.username ?? "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Settings</h1>
        <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
          Manage your account and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar tabs */}
        <nav className="flex flex-row gap-1 overflow-x-auto lg:w-48 lg:flex-col">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
                  tab.id === "danger" && "text-[hsl(var(--destructive))]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab content */}
        <div className="min-w-0 flex-1">
          {activeTab === "profile" && (
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <h2 className="mb-5 text-base font-semibold text-[hsl(var(--foreground))]">
                Profile
              </h2>
              <form action={profileAction} className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-xl font-bold text-[hsl(var(--primary))]">
                    {fullName ? fullName.slice(0, 2).toUpperCase() : email.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <Button type="button" variant="outline" size="sm">
                      Change photo
                    </Button>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      defaultValue={fullName}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      defaultValue={username}
                      placeholder="your-username"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={email}
                    disabled
                    className="cursor-not-allowed opacity-60"
                  />
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Contact support to change your email address.
                  </p>
                </div>

                {profileState?.error && (
                  <p className="text-sm text-[hsl(var(--destructive))]">{profileState.error}</p>
                )}
                {profileState && !profileState.error && !profilePending && (
                  <p className="text-sm text-emerald-600">Saved!</p>
                )}
                <Button type="submit" disabled={profilePending}>
                  {profilePending ? "Saving…" : "Save changes"}
                </Button>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <h2 className="mb-5 text-base font-semibold text-[hsl(var(--foreground))]">
                Security
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-medium text-[hsl(var(--foreground))]">
                    Change password
                  </h3>
                  <ChangePasswordForm />
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <h2 className="mb-5 text-base font-semibold text-[hsl(var(--foreground))]">
                Preferences
              </h2>
              <form action={prefsAction} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    name="language"
                    defaultValue={profile?.language ?? "en"}
                    className="h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="pt">Português</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    name="timezone"
                    defaultValue={profile?.timezone ?? "UTC"}
                    className="h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>
                {prefsState?.error && (
                  <p className="text-sm text-[hsl(var(--destructive))]">{prefsState.error}</p>
                )}
                <Button type="submit" disabled={prefsPending}>
                  {prefsPending ? "Saving…" : "Save preferences"}
                </Button>
              </form>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <h2 className="mb-5 text-base font-semibold text-[hsl(var(--foreground))]">
                Notifications
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Generation complete", description: "When a document finishes generating" },
                  { label: "Credits low", description: "When you have fewer than 5 credits remaining" },
                  { label: "Monthly summary", description: "A summary of your activity each month" },
                  { label: "Product updates", description: "New features and improvements" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {item.label}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {item.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked="true"
                      className="relative h-5 w-9 rounded-full bg-[hsl(var(--primary))] transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2"
                    >
                      <span className="absolute left-1 top-0.5 h-4 w-4 translate-x-4 rounded-full bg-white shadow transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="rounded-xl border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--card))] p-6">
              <h2 className="mb-1 text-base font-semibold text-[hsl(var(--destructive))]">
                Danger zone
              </h2>
              <p className="mb-5 text-sm text-[hsl(var(--muted-foreground))]">
                Permanently delete your account and all your data. This action cannot be undone.
              </p>

              <div className="space-y-3">
                <Label htmlFor="deleteConfirm">
                  Type <strong>DELETE</strong> to confirm
                </Label>
                <Input
                  id="deleteConfirm"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                />
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleteConfirm !== "DELETE"}
                >
                  <Trash2 className="h-4 w-4" />
                  Permanently delete account
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
