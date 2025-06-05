'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { createClient } from '@supabase/supabase-js';
import { nip19 } from 'nostr-tools';
import { useUser } from "@/context/UserContext";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [pubkey, setPubkey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useUser();

  const supabaseUrl = "https://xoeojubalyanizqeyimp.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZW9qdWJhbHlhbml6cWV5aW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzU1MTgsImV4cCI6MjA2Mjk1MTUxOH0.SZMZSFPdzhv7EaAotlNs1DPgzH1j4rjYNYX0U9K0V1Q";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // แปลง npub เป็น hex ถ้าจำเป็น
    let hexPubkey = pubkey.trim();
    if (hexPubkey.startsWith('npub')) {
      try {
        const { type, data } = nip19.decode(hexPubkey);
        if (type !== 'npub' || typeof data !== 'string') throw new Error('Invalid npub');
        hexPubkey = data;
      } catch {
        toast.error('รูปแบบ npub ไม่ถูกต้อง');
        setIsLoading(false);
        return;
      }
    }
    // ตรวจสอบ hex 64 ตัว
    if (!/^[0-9a-fA-F]{64}$/.test(hexPubkey)) {
      toast.error('Public key ต้องเป็น hex 64 ตัว หรือ npub ที่ถูกต้อง');
      setIsLoading(false);
      return;
    }

    try {
      // ตรวจสอบ username หรือ pubkey ซ้ำ
      const { data: userByName } = await supabase
        .from('registered_users')
        .select('id')
        .eq('username', username)
        .single();
      if (userByName) {
        toast.error('Username นี้ถูกใช้ไปแล้ว');
        setIsLoading(false);
        return;
      }
      const { data: userByPubkey } = await supabase
        .from('registered_users')
        .select('id')
        .eq('public_key', hexPubkey)
        .single();
      if (userByPubkey) {
        toast.error('Public key นี้ถูกใช้ไปแล้ว');
        setIsLoading(false);
        return;
      }
      // บันทึกลง supabase
      const { error } = await supabase
        .from('registered_users')
        .insert({ username, public_key: hexPubkey });
      if (error) throw error;
      toast.success('Registration successful!');
      setUsername('');
      setPubkey('');
      sessionStorage.setItem('public_key', hexPubkey);
      await refreshUser();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAlby = async () => {
    if (!window.nostr) {
      toast.error('กรุณาติดตั้ง Nostr extension เช่น Alby ก่อน');
      return;
    }
    try {
      const pk = await window.nostr.getPublicKey();
      setPubkey(pk);
      toast.success('ดึง public key สำเร็จ');
    } catch {
      toast.error('ไม่สามารถดึง public key ได้');
    }
  };

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
                <Card className="max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle>Register NIP-05</CardTitle>
                    <CardDescription>
                      Register your Nostr username and public key
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="yourname"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          Your NIP-05 address will be: {username}@nvrs.xyz
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pubkey">Nostr Public Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="pubkey"
                            placeholder="npub1..."
                            value={pubkey}
                            onChange={(e) => setPubkey(e.target.value)}
                            required
                          />
                          <Button type="button" variant="outline" onClick={handleGetAlby}>
                            Get from Alby
                          </Button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Registering...' : 'Register'}
                      </Button>
                    </form>
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