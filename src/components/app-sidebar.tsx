"use client"

import * as React from "react"
import {
  IconDashboard,
  IconHelp,
  IconBook,
  IconInnerShadowTop,
  IconSettings,
  IconUsers,
  IconUserPlus,

} from "@tabler/icons-react"
import Link from "next/link"
import { useUser } from "@/context/UserContext"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navMainRaw = [
  {
    title: "Dashboard",
    url: "/",
    icon: IconDashboard,
  },
  {
    title: "Register NIP-05",
    url: "/register",
    icon: IconUserPlus,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: IconUsers,
  },
  {
    title: "Community",
    url: "/community",
    icon: IconUsers,
  },
];
const navSecondary = [
  
  {
    title: "Settings",
    url: "#",
    icon: IconSettings,
  },
  {
    title: "About",
    url: "/about",
    icon: IconHelp,
  },
  {
    title: "Document",
    url: "/document",
    icon: IconBook,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const navMain = user ? navMainRaw : navMainRaw.filter(item => item.title !== 'Profile');

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Nostr Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
