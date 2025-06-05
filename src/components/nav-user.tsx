"use client"

import { useUser } from "@/context/UserContext"
import {
  IconCreditCard,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>;
    };
  }
}

export function NavUser() {
  const { user, nostrProfile, loading: isLoading, login, logout } = useUser();

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Button
            onClick={login}
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

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
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
              <span className="ml-2 text-base font-medium">
                {nostrProfile?.name || user.username}
              </span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <a href="/profile">
                  <IconUserCircle className="mr-2 h-4 w-4" /> Profile
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/settings">
                  <IconCreditCard className="mr-2 h-4 w-4" /> Settings
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <IconLogout className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
