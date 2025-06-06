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

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [pubkey, setPubkey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Convert npub to hex if needed
    let hexPubkey = pubkey.trim();
    if (hexPubkey.startsWith('npub')) {
      try {
        const { type, data } = nip19.decode(hexPubkey);
        if (type !== 'npub' || typeof data !== 'string') throw new Error('Invalid npub');
        hexPubkey = data;
      } catch {
        toast.error('Invalid npub format');
        setIsLoading(false);
        return;
      }
    }
    // Check for 64-char hex
    if (!/^[0-9a-fA-F]{64}$/.test(hexPubkey)) {
      toast.error('Public key must be a valid 64-character hex or npub');
      setIsLoading(false);
      return;
    }

    try {
      // Check for duplicate username or pubkey
      const { data: userByName } = await supabase
        .from('registered_users')
        .select('id')
        .eq('username', username)
        .single();
      if (userByName) {
        toast.error('This username is already taken');
        setIsLoading(false);
        return;
      }
      const { data: userByPubkey } = await supabase
        .from('registered_users')
        .select('id')
        .eq('public_key', hexPubkey)
        .single();
      if (userByPubkey) {
        toast.error('This public key is already taken');
        setIsLoading(false);
        return;
      }
      // Insert into supabase
      const { error } = await supabase
        .from('registered_users')
        .insert({ username, public_key: hexPubkey });
      if (error) throw error;
      toast.success('Registration successful!');
      setUsername('');
      setPubkey('');

      // Add default relays for new user
      const defaultRelays = [
        "wss://relay.siamdev.cc",
        "wss://relayrs.notoshi.win/",
        "wss://relay.notoshi.win",
        "wss://nos.lol",
        "wss://relay.damus.io",
        "wss://relay.nostr.band",
        "wss://yabu.me"
      ];
      // Get the new user's id
      const { data: newUser } = await supabase
        .from('registered_users')
        .select('id')
        .eq('public_key', hexPubkey)
        .single();
      if (newUser) {
        const relayInserts = defaultRelays.map(url => ({ user_id: newUser.id, url }));
        await supabase.from('user_relays').insert(relayInserts);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAlby = async () => {
    if (!window.nostr) {
      toast.error('Please install a Nostr extension such as Alby first');
      return;
    }
    try {
      const pk = await window.nostr.getPublicKey();
      setPubkey(pk);
      toast.success('Successfully fetched public key');
    } catch {
      toast.error('Failed to fetch public key');
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