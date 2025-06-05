"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { fetchNostrProfile, NostrProfileMetadata } from "@/lib/nostr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CommunityUser {
  id: string;
  username: string;
  public_key: string;
  created_at: string;
  lightning_address?: string;
  nostrProfile: NostrProfileMetadata | null;
}

export default function CommunityPage() {
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("registered_users")
        .select("id, username, public_key, created_at, lightning_address")
        .order("created_at", { ascending: false });
      if (error || !data) {
        setError("Failed to fetch users from Supabase");
        setLoading(false);
        return;
      }
      const communityUsers: CommunityUser[] = await Promise.all(
        data.map(async (u: { id: string; username: string; public_key: string; created_at: string; lightning_address?: string }) => {
          const nostrProfile = await fetchNostrProfile(u.public_key);
          return {
            ...u,
            nostrProfile,
          };
        })
      );
      setUsers(communityUsers);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const s = search.toLowerCase();
    return users.filter((u) => {
      const np = u.nostrProfile;
      return (
        u.username?.toLowerCase().includes(s) ||
        u.public_key?.toLowerCase().includes(s) ||
        np?.name?.toLowerCase().includes(s) ||
        np?.about?.toLowerCase().includes(s) ||
        np?.lud16?.toLowerCase().includes(s) ||
        u.lightning_address?.toLowerCase().includes(s)
      );
    });
  }, [users, search]);

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
        <main className="max-w-5xl mx-auto py-10 px-2 sm:px-4">
          {/* Header Section */}
          <div className="w-full flex flex-col items-center mb-10">
            <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-muted dark:border-zinc-800 p-6 flex flex-col items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-center text-foreground">Community</h1>
              <p className="text-muted-foreground text-center text-base sm:text-lg">Meet all registered users in the community.</p>
              <Input
                type="text"
                placeholder="Search by username, name, public key, or lightning address..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full max-w-md text-base"
              />
            </div>
          </div>

          {/* Card Grid Section */}
          <section>
            {error && <div className="text-center text-red-500 mb-8">{error}</div>}
            {loading ? (
              <div className="text-center py-16 text-muted-foreground text-lg">Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <svg width="80" height="80" fill="none" viewBox="0 0 80 80" className="mb-4 opacity-40">
                  <circle cx="40" cy="40" r="38" stroke="#888" strokeWidth="4" fill="#f3f3f3" />
                  <path d="M25 55c0-8 10-12 15-12s15 4 15 12" stroke="#bbb" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="40" cy="36" r="8" fill="#bbb" />
                </svg>
                <div className="text-muted-foreground text-lg">No users found.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 sm:gap-8 justify-items-center">
                {filteredUsers.map((user) => {
                  const np = user.nostrProfile;
                  return (
                    <div key={user.id} className="w-full max-w-xs">
                      <Card className="flex flex-col h-full border border-muted dark:border-zinc-800 bg-white/90 dark:bg-zinc-900 hover:shadow-xl transition-shadow rounded-2xl p-0">
                        <CardHeader className="flex flex-col items-center gap-2 pb-2 pt-6">
                          <img
                            src={np?.picture || "/avatars/default.jpg"}
                            alt={np?.name || user.username}
                            width={80}
                            height={80}
                            className="rounded-full border object-cover bg-muted shadow-md"
                            loading="lazy"
                            style={{ width: 80, height: 80 }}
                          />
                          <CardTitle className="text-xl text-center w-full truncate mt-3 font-semibold text-foreground" title={np?.name || user.username}>{np?.name || user.username}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-between gap-2 pb-6">
                          {np?.about && (
                            <div className="text-sm text-muted-foreground text-center mb-1 line-clamp-2" title={np.about}>{np.about}</div>
                          )}
                          <div className="text-xs text-muted-foreground break-all text-center">
                            <span title={user.public_key}>{user.public_key.slice(0, 12)}...{user.public_key.slice(-8)}</span>
                          </div>
                          {(np?.lud16 || user.lightning_address) && (
                            <div className="text-xs text-primary mt-1 truncate w-full text-center" title={np?.lud16 || user.lightning_address}>⚡ {np?.lud16 || user.lightning_address}</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-2">Joined: {new Date(user.created_at).toLocaleDateString()}</div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
} 