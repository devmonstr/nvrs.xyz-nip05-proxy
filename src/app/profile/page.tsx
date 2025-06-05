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

// เพิ่ม: Relay management helpers
interface Relay {
  id?: number;
  url: string;
}

export default function ProfilePage() {
  const { user, nostrProfile, loading, logout } = useUser();
  const [username, setUsername] = useState('');
  const [lightningAddress, setLightningAddress] = useState('');
  const [relays, setRelays] = useState<Relay[]>([]);
  const [newRelay, setNewRelay] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const pubkeyRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setLightningAddress(user.lightning_address || '');
      // โหลด relay จาก Supabase
      const fetchRelays = async () => {
        const { data, error } = await supabase
          .from('user_relays')
          .select('id, url')
          .eq('user_id', user.id);
        if (!error && data) setRelays(data);
      };
      fetchRelays();
    }
    if (user === null && !loading) {
      router.replace('/');
    }
  }, [user, loading, router]);

  // เพิ่ม relay ชั่วคราวใน state (ยังไม่บันทึก)
  const handleAddRelay = () => {
    const url = newRelay.trim();
    if (!url) return;
    if (relays.some(r => r.url === url)) {
      toast.error('Relay นี้ถูกเพิ่มไว้แล้ว');
      return;
    }
    setRelays([...relays, { url }]);
    setNewRelay('');
  };

  // ลบ relay ชั่วคราวใน state (ยังไม่บันทึก)
  const handleDeleteRelay = (url: string) => {
    setRelays(relays.filter(r => r.url !== url));
  };

  // อัปเดตโปรไฟล์ทั้งหมด (username, lightning address, relays)
  const handleUpdateProfile = async () => {
    if (!user) return;
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!lightningAddress.trim()) {
      toast.error('Lightning Address is required');
      return;
    }
    setUpdateLoading(true);
    // Check for duplicate username (if changed)
    if (username !== user.username) {
      const { data: userByName } = await supabase
        .from('registered_users')
        .select('id')
        .eq('username', username)
        .single();
      if (userByName) {
        toast.error('This username is already taken');
        setUpdateLoading(false);
        return;
      }
    }
    // Update username + lightning address
    const { error: updateError } = await supabase
      .from('registered_users')
      .update({ username, lightning_address: lightningAddress })
      .eq('id', user.id);
    if (updateError) {
      toast.error('Update profile failed');
      setUpdateLoading(false);
      return;
    }
    // Fetch old relays from database
    const { data: oldRelays } = await supabase
      .from('user_relays')
      .select('id, url')
      .eq('user_id', user.id);
    const oldRelayUrls = (oldRelays || []).map((r: Relay) => r.url);
    // Find relays to add
    const relaysToAdd = relays.filter(r => !oldRelayUrls.includes(r.url));
    // Find relays to delete
    const relaysToDelete = (oldRelays || []).filter((r: Relay) => !relays.some(nr => nr.url === r.url));
    // Add new relays
    for (const relay of relaysToAdd) {
      await supabase.from('user_relays').insert({ user_id: user.id, url: relay.url });
    }
    // Delete removed relays
    for (const relay of relaysToDelete) {
      await supabase.from('user_relays').delete().eq('id', relay.id);
    }
    toast.success('Profile updated!');
    setUpdateLoading(false);
    window.location.reload();
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
                    <CardDescription>Manage your Nostr profile, Lightning address, and relays in one place.</CardDescription>
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
                        <div className="mt-2 text-lg font-bold">{nostrProfile?.name || username}</div>
                        {nostrProfile?.about && <div className="text-sm text-muted-foreground text-center max-w-xs">{nostrProfile.about}</div>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Username</h3>
                          <input
                            className="border rounded px-2 py-1 text-sm w-full"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            disabled={updateLoading}
                          />
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            Your NIP-05: <b>{username}@nvrs.xyz</b>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Copy NIP-05"
                              title="Copy NIP-05"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(`${username}@nvrs.xyz`);
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
                          <h3 className="text-sm font-medium">Lightning Address</h3>
                          <input
                            className="border rounded px-2 py-1 text-sm w-full"
                            placeholder="your@walletofsatoshi.com"
                            value={lightningAddress}
                            onChange={e => setLightningAddress(e.target.value)}
                            disabled={updateLoading}
                          />
                          <div className="text-xs text-muted-foreground mt-1">Receive sats via <b>{username}@nvrs.xyz</b> (proxied to your configured Lightning Address)</div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <h3 className="text-sm font-medium mb-2">Your Relays</h3>
                          <div className="flex gap-2 mb-2">
                            <input
                              className="border rounded px-2 py-1 text-sm flex-1"
                              placeholder="wss://your-relay.example"
                              value={newRelay}
                              onChange={e => setNewRelay(e.target.value)}
                              disabled={updateLoading}
                            />
                            <Button size="sm" onClick={handleAddRelay} disabled={updateLoading || !newRelay.trim()}>
                              Add Relay
                            </Button>
                          </div>
                          <ul className="space-y-2">
                            {relays.length === 0 && <li className="text-sm text-muted-foreground">No relays added yet.</li>}
                            {relays.map(relay => (
                              <li key={relay.url} className="flex items-center gap-2">
                                <span className="text-sm">{relay.url}</span>
                                <Button size="icon" variant="ghost" onClick={() => handleDeleteRelay(relay.url)} disabled={updateLoading}>
                                  ✕
                                </Button>
                              </li>
                            ))}
                          </ul>
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
                      <div className="flex justify-end mt-6">
                        <Button variant="outline" onClick={handleUpdateProfile} disabled={updateLoading}>
                          {updateLoading ? 'Updating...' : 'Update Profile'}
                        </Button>
                      </div>
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