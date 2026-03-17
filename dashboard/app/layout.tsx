import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agent Windtunnel — The deploy gate for AI agents",
  description: "Catch prompt regressions before they reach users. Record production traffic, replay it against your new prompt, block bad deploys automatically.",
  openGraph: {
    title: "Agent Windtunnel — The deploy gate for AI agents",
    description: "Catch prompt regressions before they reach users. Record production traffic, replay it against your new prompt, block bad deploys automatically.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", geistSans.variable, geistMono.variable, dmSerifDisplay.variable)} style={{ colorScheme: 'dark' }}>
      <body className="bg-background text-foreground min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
