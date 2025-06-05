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
                    Welcome to NIP-05 Free Registration
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    Get your free NIP-05 address to verify your Nostr identity. 
                    Enhance your credibility and make your Nostr presence more professional.
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
                      <CardTitle>Identity Verification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Verify your Nostr identity with a trusted NIP-05 address. 
                        Build trust with other Nostr users and enhance your online presence.
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
                        Simple and straightforward registration process. 
                        Just provide your Nostr public key and choose your preferred username.
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
                        Completely free NIP-05 address registration. 
                        No hidden fees or premium features. Everyone deserves a verified identity.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-16 text-center">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Ready to get started?
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Join thousands of Nostr users who have already verified their identity.
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
