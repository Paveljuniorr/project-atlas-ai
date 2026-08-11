import { Providers } from "@/components/providers";
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Project Atlas AI | AI Automation Solutions For Businesses',
  description:
    'Project Atlas AI helps businesses automate workflows, capture leads, and improve productivity with intelligent AI systems.',
  applicationName: 'Project Atlas AI',
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    type: 'website',
    title: 'Project Atlas AI | AI Automation Solutions For Businesses',
    description:
      'Project Atlas AI helps businesses automate workflows, capture leads, and improve productivity with intelligent AI systems.',
    url: 'http://localhost:3000',
    siteName: 'Project Atlas AI'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Project Atlas AI | AI Automation Solutions For Businesses',
    description:
      'Project Atlas AI helps businesses automate workflows, capture leads, and improve productivity with intelligent AI systems.'
  },
  alternates: {
    canonical: 'http://localhost:3000'
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
