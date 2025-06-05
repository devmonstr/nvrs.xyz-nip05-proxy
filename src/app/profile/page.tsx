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
  id: number;
  url: string;
}

export default function ProfilePage() {
  const { user, nostrProfile, loading, logout } = useUser();
  const [relays, setRelays] = useState<Relay[]>([]);
  const [newRelay, setNewRelay] = useState('');
  const [relayLoading, setRelayLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const pubkeyRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      // โหลด relay จาก Supabase
      const fetchRelays = async () => {
        const { data, error } = await supabase
          .from('user_relays')
          .select('id, url')
          .eq('public_key', user.public_key);
        if (!error && data) setRelays(data);
      };
      fetchRelays();
    }
    if (user === null && !loading) {
      router.replace('/');
    }
  }, [user, loading, router]);

  // เพิ่ม relay
  const handleAddRelay = async () => {
    if (!user) return;
    if (!newRelay.trim()) return;
    setRelayLoading(true);
    const url = newRelay.trim();
    // ตรวจสอบซ้ำ
    if (relays.some(r => r.url === url)) {
      toast.error('Relay นี้ถูกเพิ่มไว้แล้ว');
      setRelayLoading(false);
      return;
    }
    const { error, data } = await supabase
      .from('user_relays')
      .insert({ public_key: user.public_key, url })
      .select('id, url')
      .single();
    if (error) {
      toast.error('เพิ่ม relay ไม่สำเร็จ');
    } else {
      setRelays([...relays, data]);
      setNewRelay('');
      toast.success('เพิ่ม relay สำเร็จ');
    }
    setRelayLoading(false);
  };

  // ลบ relay
  const handleDeleteRelay = async (id: number) => {
    setRelayLoading(true);
    const { error } = await supabase
      .from('user_relays')
      .delete()
      .eq('id', id);
    if (error) {
      toast.error('ลบ relay ไม่สำเร็จ');
    } else {
      setRelays(relays.filter(r => r.id !== id));
      toast.success('ลบ relay สำเร็จ');
    }
    setRelayLoading(false);
  };

  // Update profile handler (username only)
  const handleUpdateProfile = async () => {
    if (!user) return;
    const currentUsername = user!.username;
    if (!username.trim()) {
      toast.error('Username ห้ามว่าง');
      return;
    }
    if (username === currentUsername) {
      toast.info('Username ไม่ได้เปลี่ยนแปลง');
      return;
    }
    setUpdateLoading(true);
    // ตรวจสอบ username ซ้ำ
    const { data: userByName } = await supabase
      .from('registered_users')
      .select('id')
      .eq('username', username)
      .single();
    if (userByName) {
      toast.error('Username นี้ถูกใช้ไปแล้ว');
      setUpdateLoading(false);
      return;
    }
    // update username ใน registered_users
    const { error } = await supabase
      .from('registered_users')
      .update({ username })
      .eq('public_key', user!.public_key);
    if (error) {
      toast.error('Update username failed');
      setUpdateLoading(false);
      return;
    }
    toast.success('Username updated!');
    setUpdateLoading(false);
    window.location.reload(); // force refresh user context
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
                          <input
                            className="border rounded px-2 py-1 text-sm w-full"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            disabled={updateLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">NIP-05 Address</h3>
                          <p className="text-sm text-muted-foreground">
                            {username}@nvrs.xyz
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
                      {/* Relay Management Section */}
                      <div className="mt-8">
                        <h3 className="text-sm font-medium mb-2">Your Relays</h3>
                        <div className="flex gap-2 mb-4">
                          <input
                            className="border rounded px-2 py-1 text-sm flex-1"
                            placeholder="wss://your-relay.example"
                            value={newRelay}
                            onChange={e => setNewRelay(e.target.value)}
                            disabled={relayLoading}
                          />
                          <Button size="sm" onClick={handleAddRelay} disabled={relayLoading || !newRelay.trim()}>
                            Add Relay
                          </Button>
                        </div>
                        <ul className="space-y-2">
                          {relays.length === 0 && <li className="text-sm text-muted-foreground">No relays added yet.</li>}
                          {relays.map(relay => (
                            <li key={relay.id} className="flex items-center gap-2">
                              <span className="text-sm">{relay.url}</span>
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteRelay(relay.id)} disabled={relayLoading}>
                                ✕
                              </Button>
                            </li>
                          ))}
                        </ul>
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