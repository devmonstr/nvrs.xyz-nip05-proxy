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

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [pubkey, setPubkey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          pubkey,
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      await response.json();
      toast.success('Registration successful!');
      // Redirect or show success message
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
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
                        <Input
                          id="pubkey"
                          placeholder="npub1..."
                          value={pubkey}
                          onChange={(e) => setPubkey(e.target.value)}
                          required
                        />
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