import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconArrowRight, IconCheck, IconShieldCheck } from "@tabler/icons-react"
import Link from "next/link"

export default function Page() {
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
                <div className="mx-auto max-w-3xl text-center">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                    Welcome to NIP-05 & Lightning Proxy Platform
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    Get your free NIP-05 address, manage relays, and receive Lightning payments with your own domain. Enhance your Nostr experience with powerful features and a seamless dashboard.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Button asChild size="lg">
                      <Link href="/register">
                        Get Started
                        <IconArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <IconShieldCheck className="h-8 w-8 text-primary" />
                      <CardTitle>NIP-05 Identity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Register and verify your Nostr identity with a trusted NIP-05 address (e.g. <b>yourname@nvrs.xyz</b>). Build trust and credibility in the Nostr network.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <IconCheck className="h-8 w-8 text-primary" />
                      <CardTitle>Easy Registration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Simple and straightforward registration process. Just provide your Nostr public key and choose your preferred username. No fees, no hassle.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <IconShieldCheck className="h-8 w-8 text-primary" />
                      <CardTitle>Free Service</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Completely free NIP-05 address registration. No hidden fees or premium features. Everyone deserves a verified identity.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <IconArrowRight className="h-8 w-8 text-primary" />
                      <CardTitle>Lightning Address Proxy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Receive Bitcoin Lightning payments via <b>yourname@nvrs.xyz</b>. Payments are automatically proxied to your real Lightning address (e.g. <b>your@walletofsatoshi.com</b>), making it easy to receive sats anywhere.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <IconCheck className="h-8 w-8 text-primary" />
                      <CardTitle>Relay Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Add, remove, and manage your Nostr relays directly from your profile. Keep your relay list up-to-date and in sync with your identity.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <IconShieldCheck className="h-8 w-8 text-primary" />
                      <CardTitle>Modern Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Clean, user-friendly dashboard for managing your Nostr identity, Lightning address, and relays. Designed for the best user experience.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-16 text-center">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Ready to get started?
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Join thousands of Nostr users who have already verified their identity and receive Lightning payments with ease.
                  </p>
                  <div className="mt-8">
                    <Button asChild size="lg" variant="outline">
                      <Link href="/register">
                        Register Now
                        <IconArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
