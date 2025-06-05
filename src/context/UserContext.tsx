"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { fetchNostrProfile, NostrProfileMetadata } from "@/lib/nostr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  id: string;
  username: string;
  public_key: string;
  created_at: string;
  lightning_address?: string;
}

interface UserContextType {
  user: User | null;
  nostrProfile: NostrProfileMetadata | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [nostrProfile, setNostrProfile] = useState<NostrProfileMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    const publicKey = typeof window !== "undefined" ? sessionStorage.getItem("public_key") : null;
    if (!publicKey) {
      setUser(null);
      setNostrProfile(null);
      setLoading(false);
      return;
    }
    // Supabase
    const { data } = await supabase.from("registered_users").select("*").eq("public_key", publicKey).single();
    setUser(data || null);
    // Nostr relay
    try {
      const profile = await fetchNostrProfile(publicKey);
      setNostrProfile(profile);
    } catch {
      setNostrProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = useCallback(async () => {
    setLoading(true);
    try {
      if (!window.nostr) {
        alert('Please install a Nostr extension like Alby');
        setLoading(false);
        return;
      }
      const publicKey = await window.nostr.getPublicKey();
      if (!publicKey) {
        alert('Unable to retrieve Public Key');
        setLoading(false);
        return;
      }
      // ตรวจสอบ public_key ใน Supabase
      const { data } = await supabase
        .from('registered_users')
        .select('*')
        .eq('public_key', publicKey)
        .single();
      if (!data) {
        alert('You have not registered yet. Please register first.');
        if (typeof window !== 'undefined') {
          window.location.href = '/register';
        }
        setLoading(false);
        return;
      }
      sessionStorage.setItem('public_key', publicKey);
      setUser(data);
      await refreshUser();
    } catch {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  const logout = useCallback(() => {
    sessionStorage.removeItem('public_key');
    setUser(null);
    setNostrProfile(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, nostrProfile, loading, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
} 