"use client"

import { useUser } from "@/context/UserContext"
import { useRouter } from "next/navigation"
import {
  IconLogout,
  IconUserCircle,
  IconDotsVertical,
  IconDatabase,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>;
    };
  }
}

export function NavUser() {
  const { user, nostrProfile, loading: isLoading, login, logout } = useUser();
  const router = useRouter();

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Button
            onClick={async () => {
              await login();
              router.push("/profile");
            }}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? 'Logging in...' : 'Login with Nostr'}
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // User info for dropdown
  const userEmail = nostrProfile?.nip05 || user.public_key;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center w-full rounded-lg bg-muted/50 px-3 py-2 cursor-pointer hover:bg-muted transition-colors">
              <Avatar>
                <AvatarImage
                  src={nostrProfile?.picture || "/avatars/default.jpg"}
                  alt={user.username}
                  className="rounded-full object-cover"
                />
                <AvatarFallback>
                  {user.username?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2 flex flex-col min-w-0">
                <span className="text-base font-medium truncate">{nostrProfile?.name || user.username}</span>
                <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
              </div>
              <IconDotsVertical className="ml-auto w-5 h-5 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="flex items-center gap-3 px-3 py-2 border-b">
              <Avatar>
                <AvatarImage
                  src={nostrProfile?.picture || "/avatars/default.jpg"}
                  alt={user.username}
                  className="rounded-full object-cover"
                />
                <AvatarFallback>
                  {user.username?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold truncate">{nostrProfile?.name || user.username}</span>
                <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
              </div>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <IconUserCircle className="mr-2 h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/document">
                <IconDatabase className="mr-2 h-4 w-4" /> Document
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <IconLogout className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
