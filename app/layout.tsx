import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Конструктор напитков 250 мл',
  description: 'Создайте идеальный напиток из модульных частей с живым превью и расчётом объёмов',
  keywords: ['напитки', 'кофе', 'конструктор', 'рецепты', 'бариста'],
  authors: [{ name: 'Drink Builder Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#8b4513',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
  openGraph: {
    title: 'Конструктор напитков 250 мл',
    description: 'Создайте идеальный напиток из модульных частей',
    type: 'website',
    locale: 'ru_RU',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b4513" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Drink Builder" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-cream-50">
          {children}
        </div>
      </body>
    </html>
  );
}
