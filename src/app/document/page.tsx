import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

const howToUse = [
  {
    step: 1,
    title: "Register NIP-05",
    detail: "Go to the Register NIP-05 menu, enter your Username and Nostr Public Key (npub or hex), then click Register to create your NIP-05 address (yourname@nvrs.xyz) for free!"
  },
  {
    step: 2,
    title: "Manage Profile",
    detail: "After registering and logging in, go to the Profile menu to edit your Username, Lightning Address (to receive sats via yourname@nvrs.xyz), and manage your relay list all in one place. Click Update Profile to save everything at once."
  },
  {
    step: 3,
    title: "Use NIP-05 & Lightning Address",
    detail: "Use your NIP-05 address (yourname@nvrs.xyz) to verify your identity in Nostr apps or receive sats via the same Lightning Address. The system will automatically proxy to your configured Lightning Address."
  },
  {
    step: 4,
    title: "Relay Management",
    detail: "Add or remove relays from the Profile page to keep your Nostr account connected to your preferred relays."
  },
  {
    step: 5,
    title: "Delete Account (if needed)",
    detail: "You can delete your account from the Profile page in the Danger Zone section (all data will be permanently deleted)."
  },
];

const codeExample = `// Example: Fetch NIP-05 data
fetch('https://nvrs.xyz/.well-known/nostr.json?name=yourname')
  .then(res => res.json())
  .then(data => console.log(data));

// Example: Use Lightning Address
// Send sats to yourname@nvrs.xyz via any LNURL-pay compatible app
`;

const faq = [
  {
    q: "What is NIP-05?",
    a: "NIP-05 is a standard for identity verification on Nostr, using the format username@domain (e.g. yourname@nvrs.xyz) so others can easily find and verify your identity."
  },
  {
    q: "What is Lightning Address Proxy?",
    a: "It allows you to receive sats using yourname@nvrs.xyz. The system will proxy payments to your configured Lightning Address, such as your@walletofsatoshi.com."
  },
  {
    q: "Is my data safe?",
    a: "Your data is stored in Supabase, and you can delete your account at any time (see Danger Zone in Profile)."
  },
  {
    q: "Can I change my Username or Lightning Address?",
    a: "Yes, you can change them anytime from the Profile page and click Update Profile."
  },
  {
    q: "Which apps are supported?",
    a: "All Nostr apps that support NIP-05 and all Lightning apps that support LNURL-pay, such as Wallet of Satoshi, Alby, Zeus, etc."
  },
];

export default function DocumentPage() {
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
        <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh]">
          <div className="max-w-2xl w-full bg-background rounded-lg shadow p-6 mt-8">
            <h1 className="text-2xl font-bold mb-4 text-primary">How to use</h1>
            <ol className="list-decimal list-inside space-y-4 text-base text-muted-foreground mb-8">
              {howToUse.map(step => (
                <li key={step.step}>
                  <span className="font-semibold text-primary">{step.title}:</span> {step.detail}
                </li>
              ))}
            </ol>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2 text-primary">Code Example</h2>
              <pre className="bg-muted rounded p-4 text-sm overflow-x-auto">
                <code>{codeExample}</code>
              </pre>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-primary">FAQ</h2>
              <ul className="space-y-4">
                {faq.map((item, idx) => (
                  <li key={idx}>
                    <div className="font-semibold text-primary">Q: {item.q}</div>
                    <div className="ml-4">A: {item.a}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 