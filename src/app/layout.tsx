import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { LoginProvider } from "@/context/LoginContext";
import { ClientOnly } from "@/components/ClientOnly";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Paces | Home",
  description: "Paces helps energy infrastructure teams find viable sites, de-risk development, and get to power faster.",
  openGraph: {
    title: "De-risked projects. Powered faster.",
    description: "Energy infrastructure development, accelerated.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "De-risked projects. Powered faster.",
    description: "Energy infrastructure development, accelerated.",
    images: ["/og.png"],
  },
  icons: {
    icon: [{ url: "/paces-assets/paces-mark.svg?v=2", type: "image/svg+xml" }],
    shortcut: "/paces-assets/paces-mark.svg?v=2",
    apple: "/paces-assets/paces-mark.svg?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoginProvider>
          <ClientOnly>{children}</ClientOnly>
        </LoginProvider>
      </body>
    </html>
  );
}
