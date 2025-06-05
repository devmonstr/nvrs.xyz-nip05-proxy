'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from "@/context/UserContext";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper: ตรวจสอบ login จาก sessionStorage

export default function ProfilePage() {
  const { user, nostrProfile, loading, refreshUser, logout } = useUser();
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const pubkeyRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) setNewUsername(user.username || '');
    if (user === null && !loading) {
      router.replace('/');
    }
  }, [user, loading, router]);

  // ฟังก์ชันแก้ไข username
  const handleEditUsername = async () => {
    if (!user) return;
    if (!newUsername || newUsername === user.username) {
      setEditing(false);
      return;
    }
    setEditLoading(true);
    // ตรวจสอบ username ซ้ำ
    const { data: userByName } = await supabase
      .from('registered_users')
      .select('id')
      .eq('username', newUsername)
      .single();
    if (userByName) {
      toast.error('Username นี้ถูกใช้ไปแล้ว');
      setEditLoading(false);
      return;
    }
    // update username ใน registered_users
    const { error } = await supabase
      .from('registered_users')
      .update({ username: newUsername })
      .eq('public_key', user.public_key);
    if (error) {
      toast.error('Update username failed');
      setEditLoading(false);
      return;
    }
    toast.success('Username updated!');
    await refreshUser();
    setEditing(false);
    setEditLoading(false);
  };

  // ป้องกัน hydration mismatch: render loading ก่อน mount
  if (loading) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh]">
            <Card className="max-w-4xl mx-auto w-2xs">
              <CardHeader>
                <CardTitle>Loading profile...</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <Card className="max-w-4xl mx-auto">
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                      Your Nostr profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex flex-col items-center mb-6">
                        <Image
                          src={nostrProfile?.picture || "/avatars/default.jpg"}
                          alt="Avatar"
                          width={96}
                          height={96}
                          className="rounded-full border object-cover aspect-square"
                        />
                        <div className="mt-2 text-lg font-bold">{nostrProfile?.name || user?.username}</div>
                        {nostrProfile?.about && <div className="text-sm text-muted-foreground text-center max-w-xs">{nostrProfile.about}</div>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Username</h3>
                          {editing ? (
                            <div className="flex gap-2">
                              <input
                                className="border rounded px-2 py-1 text-sm"
                                value={newUsername}
                                onChange={e => setNewUsername(e.target.value)}
                                disabled={editLoading}
                              />
                              <Button size="sm" variant="outline" onClick={handleEditUsername} disabled={editLoading}>
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setNewUsername(user.username); }}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{user.username}</span>
                              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                                Edit
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">NIP-05 Address</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.username}@nvrs.xyz
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Public Key</h3>
                          <div className="flex items-center gap-2">
                            <span ref={pubkeyRef} className="text-sm text-muted-foreground break-all select-all">
                              {user.public_key.slice(0, 6) + '...' + user.public_key.slice(-6)}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Copy public key"
                              title="Copy public key"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(user.public_key);
                                  toast.success('Copied!');
                                } catch {
                                  toast.error('Copy failed');
                                }
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Created At</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {!editing && (
                        <div className="flex justify-end">
                          <Button variant="outline" onClick={() => window.location.href = '/register'}>
                            Update Profile
                          </Button>
                        </div>
                      )}
                      <hr className="my-6" />
                      <div className="mt-4">
                        <h3 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h3>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
                            try {
                              const { error } = await supabase
                                .from('registered_users')
                                .delete()
                                .eq('public_key', user.public_key);
                              if (error) throw error;
                              toast.success('Account deleted');
                              logout();
                              window.location.href = '/';
                            } catch {
                              toast.error('Failed to delete account');
                            }
                          }}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 