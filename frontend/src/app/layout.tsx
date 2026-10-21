import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/auth';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const sora = Sora({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Luna — Beyond the Expected | Intelligent Queue & Customer Infrastructure',
  description: 'Enterprise multi-tenant queueing, arrival windows, and seamless digital service for banks, healthcare, telecom, and education.',
  icons: {
    icon: '/brand/luna-icon-purple.png',
    apple: '/brand/luna-icon-purple.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#FFF6E9] text-[#291E29] selection:bg-[#FFA800] selection:text-[#291E29]" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
