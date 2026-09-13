import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://thecanoewey.co.uk'),
  title: 'Private River Wey Canoe Trips | Guildford to Godalming',
  description:
    'Private guided canoe days on the River Wey between Guildford and Godalming aboard a handcrafted wooden canoe. Groups of 2–12, £600 for the day.',
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
