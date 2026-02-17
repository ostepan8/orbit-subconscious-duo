import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import UploadFlowProvider from "@/components/UploadFlowProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://orbit.subconscious.dev"
  ),
  title: "Orbit x Subconscious — AI-Powered Research",
  description:
    "Import your MIT Orbit workbook and let Subconscious AI agents perform deep research, generate verified citations, and deliver actionable recommendations — in minutes, not weeks.",
  icons: {
    icon: "/Subconscious_Logo_Graphic.png",
    apple: "/Subconscious_Logo_Graphic.png",
  },
  openGraph: {
    title: "Orbit x Subconscious — AI-Powered Research",
    description:
      "Import your MIT Orbit workbook and let AI agents enrich every step of the Disciplined Entrepreneurship framework with real citations and analysis.",
    type: "website",
    siteName: "Orbit x Subconscious",
    images: ["/Subconscious_Logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit x Subconscious — AI-Powered Research",
    description:
      "Import your MIT Orbit workbook and let AI agents enrich every step of the Disciplined Entrepreneurship framework.",
    images: ["/Subconscious_Logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className="scroll-smooth">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ConvexClientProvider>
            <UploadFlowProvider>{children}</UploadFlowProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
