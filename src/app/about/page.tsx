"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AboutPage() {
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
        <main className="max-w-2xl mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold mb-4">About This Project</h1>
          <p className="text-lg mb-4">
            This dashboard is a demonstration of how artificial intelligence can be leveraged to build a modern web application from start to finish. Every aspect of this project—including database design, API development, frontend user interface, and user experience—was created with the assistance of AI tools and guidance.
          </p>
          <p className="text-base mb-4">
            The project showcases the following:
          </p>
          <ul className="list-disc pl-6 mb-4 text-base">
            <li>Rapid prototyping and iteration using AI-powered code generation and refactoring.</li>
            <li>Automated database schema design and migration management.</li>
            <li>Implementation of modern authentication and user management flows.</li>
            <li>Integration of advanced features such as NIP-05 verification, Lightning Address proxying, and relay management.</li>
            <li>Continuous UI/UX improvements based on user feedback, all implemented with AI assistance.</li>
            <li>Security best practices, including the use of environment variables and secure API key handling.</li>
            <li>Comprehensive documentation and FAQ, also generated with AI help.</li>
          </ul>
          <p className="text-base mb-4">
            By utilizing AI throughout the development process, this project demonstrates how teams and individuals can accelerate delivery, reduce errors, and focus more on creative problem-solving rather than repetitive coding tasks.
          </p>
          <p className="text-base text-muted-foreground">
            If you have any questions or want to learn more about how AI was used in this project, feel free to explore the documentation or contact the project maintainer.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
} 