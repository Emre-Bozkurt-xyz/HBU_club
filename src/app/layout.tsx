import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const title = "History Before Us";
const description =
  "A student-led history organization exploring the land we live on and the wider world's past.";

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  metadataBase: productionHost
    ? new URL(`https://${productionHost}`)
    : undefined,
  title: { default: title, template: `%s · ${title}` },
  description,
  openGraph: {
    title,
    description,
    siteName: title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
