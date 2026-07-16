import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BookForge AI — Create Digital Products with AI",
    template: "%s | BookForge AI",
  },
  description:
    "The most modern AI platform for creating eBooks, guides, workbooks, lead magnets, and marketing content. Build digital products in minutes.",
  keywords: [
    "AI book creator",
    "ebook generator",
    "digital product creator",
    "AI content generation",
    "lead magnet creator",
    "AI writing tool",
  ],
  authors: [{ name: "BookForge AI" }],
  creator: "BookForge AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BookForge AI",
    title: "BookForge AI — Create Digital Products with AI",
    description:
      "The most modern AI platform for creating eBooks, guides, workbooks, and marketing content.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookForge AI — Create Digital Products with AI",
    description:
      "The most modern AI platform for creating eBooks, guides, workbooks, and marketing content.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-[hsl(var(--background))] font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
