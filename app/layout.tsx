import type { Metadata } from 'next';
import React from 'react';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Collectiv - The World-Class Encyclopedia',
    template: '%s | Collectiv',
  },
  description: 'Collectiv is a comprehensive, AI-optimized encyclopedia with cross-references, multimedia, and intelligent content interconnection.',
  keywords: ['encyclopedia', 'wiki', 'knowledge', 'reference', 'collectiv'],
  authors: [{ name: 'Collectiv Contributors' }],
  openGraph: {
    title: 'Collectiv - The World-Class Encyclopedia',
    description: 'A comprehensive, AI-optimized encyclopedia with intelligent content interconnection.',
    url: 'https://collectiv.world',
    siteName: 'Collectiv',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Collectiv Encyclopedia',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Collectiv',
    description: 'The world-class encyclopedia for 2026',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://collectiv.world" />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
