import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
// Removed Geist next/font/google import to fix lint error

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "VentureHiveX - Web3 Crowdfunding Platform",
  description: "Web3 Crowdfunding & Investment Platform",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%238b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hexagon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
  },
};

import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/lib/AppProvider";
import { Toaster } from "sonner";
import { Starfield } from "@/components/Starfield";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground relative`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" disableTransitionOnChange>
          <AppProvider>
            <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
              <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px] animate-[spin_60s_linear_infinite]" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[100px] animate-[spin_40s_linear_infinite_reverse]" />
            </div>
            <Starfield />
            <Navbar />
            <main className="relative z-0 pt-8">
              {children}
            </main>
            <Toaster richColors position="bottom-right" />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
