import type { Metadata } from 'next';
import { useEffect, useState } from 'react';
import ViewCounter from "./ViewCounter";

export const metadata: Metadata = {/*website name change here*/
  title: 'Portfolio - Neoh Wei Jian - Full Stack Developer | Portfolio',
  description: 'Full Stack Developer specializing in React, Next.js, Python, and Data Science. Building exceptional and accessible digital experiences for the web.',
  keywords: ['Full Stack Developer', 'React', 'Next.js', 'Python', 'Data Science', 'Machine Learning', 'Web Development', 'Portfolio'],
  authors: [{ name: 'Neoh Wei Jian' }],
  creator: 'Neoh Wei Jian',
  publisher: 'Neoh Wei Jian',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://portfolio1.edgeone.app'),
  openGraph: {
    title: 'Portfolio - Neoh Wei Jian - Full Stack Developer',
    description: 'Full Stack Developer specializing in React, Next.js, Python, and Data Science. Building exceptional and accessible digital experiences.',
    url: 'https://portfolio1.edgeone.app/',
    siteName: 'Portfolio - Neoh Wei Jian',
    images: [
      {
        url: '/images/avatar.png',
        width: 1200,
        height: 630,
        alt: 'Neoh Wei Jian Portfolio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio - Neoh Wei Jian - Full Stack Developer',
    description: 'Full Stack Developer specializing in React, Next.js, Python, and Data Science.',
    images: ['/images/avatar.png'],
    creator: '@HenryNeoh',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/images/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/images/logo.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('theme');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark-mode');
                document.body.classList.add('dark-mode');
              }
            })();
          `
        }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Neoh Wei Jian",
              "jobTitle": "Full Stack Developer",
              "url": "https://portfolio1.edgeone.app",
              "sameAs": [
                "https://github.com/HenryNeoh",
                "https://www.linkedin.com/in/neoh-wei-jian/"
              ],
              "knowsAbout": ["React", "Next.js", "Python", "Data Science", "Machine Learning", "Web Development"],
              "description": "Full Stack Developer specializing in React, Next.js, Python, and Data Science"
            })
          }}
        />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Leckerli+One&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Leckerli+One&family=Lilita+One&family=Patrick+Hand&family=Shadows+Into+Light&display=swap" rel="stylesheet" />
        <link href="/style.css" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              -webkit-user-select: text;
              -moz-user-select: text;
              -ms-user-select: text;
              user-select: text;
            }
            
            img, svg, video {
              -webkit-user-drag: none;
              -khtml-user-drag: none;
              -moz-user-drag: none;
              -o-user-drag: none;
              user-drag: none;
              pointer-events: none;
            }
          `
        }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
