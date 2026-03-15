import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agent Windtunnel - CI/CD for AI Agents",
  description: "Record production interactions and catch prompt regressions before they ship",
  openGraph: {
    title: "Agent Windtunnel - CI/CD for AI Agents",
    description: "Record production interactions and catch prompt regressions before they ship",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-950 text-gray-100 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
