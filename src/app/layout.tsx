import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  applicationName: "Young Planners Forum",
  openGraph: {
    type: "website",
    siteName: "Young Planners Forum",
    locale: "en_NG",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "./" },
  title: {
    default: "Young Planners Forum | NITP",
    template: "%s",
  },
  description:
    "The Young Planners Forum (YPF) of the Nigerian Institute of Town Planners: a network of young and emerging planning professionals building sustainable cities.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
