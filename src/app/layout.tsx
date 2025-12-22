import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { AppContent } from "@/components/layout/app-content";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#D91A7A",
};

export const metadata: Metadata = {
  title: "HultPrize-WorkLogs", 
  description: "Track events, assign tasks, and manage work logs efficiently",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WorkLogs",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "WorkLogs",
    title: "HultPrize-WorkLogs",
    description: "Track events, assign tasks, and manage work logs efficiently",
  },
  twitter: {
    card: "summary",
    title: "HultPrize-WorkLogs",
    description: "Track events, assign tasks, and manage work logs efficiently",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppContent>
            {children}
          </AppContent>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
