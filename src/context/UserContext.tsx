"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

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

interface NostrProfileMetadata {
  name?: string;
  about?: string;
  picture?: string;
  nip05?: string;
  banner?: string;
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
      const ws = new window.WebSocket("wss://relay.damus.io");
      ws.onopen = () => {
        ws.send(JSON.stringify(["REQ", "profile-meta-0", { kinds: [0], authors: [publicKey] }]));
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg[0] === "EVENT" && msg[2]?.kind === 0 && msg[2]?.content) {
            setNostrProfile(JSON.parse(msg[2].content));
            ws.close();
          }
        } catch {}
      };
      ws.onerror = () => ws.close();
    } catch {}
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
        alert('ยังไม่ได้ลงทะเบียน กรุณา Register ก่อน');
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