import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import '../src/index.css';
import { GoogleAnalytics } from '@next/third-parties/google';

const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://findmyweddingvendor.com'),
  title: {
    default: 'Find My Wedding Vendor | Top Wedding Services Directory',
    template: '%s | Find My Wedding Vendor'
  },
  description: 'Discover and connect with the best wedding vendors in your area. Browse reviews, compare prices, and find photographers, venues, caterers, florists, and more for your perfect wedding day.',
  keywords: ['wedding vendors', 'wedding services', 'wedding planning', 'wedding directory', 'wedding photographers', 'wedding venues', 'wedding caterers', 'wedding florists', 'find wedding vendors'],
  authors: [{ name: 'Find My Wedding Vendor' }],
  creator: 'Find My Wedding Vendor',
  publisher: 'Find My Wedding Vendor',
  formatDetection: {
    telephone: false,
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
  manifest: '/Find-My Wedding-Favicon/site.webmanifest',
  icons: {
    icon: [
      { url: '/Find-My Wedding-Favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/Find-My Wedding-Favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/Find-My Wedding-Favicon/favicon.ico' }
    ],
    apple: [
      { url: '/Find-My Wedding-Favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://findmyweddingvendor.com',
    siteName: 'Find My Wedding Vendor',
    title: 'Find My Wedding Vendor | Top Wedding Services Directory',
    description: 'Discover and connect with the best wedding vendors in your area. Browse reviews, compare prices, and find the perfect match for your special day.',
    images: [
      {
        url: 'https://findmyweddingvendor.com/Screenshot 2025-04-20 at 9.59.36 PM.png',
        width: 1200,
        height: 630,
        alt: 'Find My Wedding Vendor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@findmyweddingvendor',
    title: 'Find My Wedding Vendor | Top Wedding Services Directory',
    description: 'Discover and connect with the best wedding vendors in your area. Browse reviews, compare prices, and find the perfect match for your special day.',
    images: ['https://findmyweddingvendor.com/Screenshot 2025-04-20 at 9.59.36 PM.png'],
  },
  verification: {
    google: 'google-site-verification-code', // Add your verification code
  },
  other: {
    'theme-color': '#ee9ca7',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Find My Wedding Vendor',
    'mobile-web-app-capable': 'yes',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lato.variable}>
      <body className={`${lato.className} antialiased`}>
        {children}
        <GoogleAnalytics gaId="G-FL048TNQ0D" />
      </body>
    </html>
  );
}
