import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PSYCHOBILLY ONLINE',
  description:
    'Online community for psychobillies from all over the world! Find the latest news and gossip, discuss shows and records, check concert dates and meet 1000s of weird people!',
  keywords: 'Psychobilly',
  authors: [{ name: 'cpm75' }],
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/styles/helpers.css" />
        <link rel="stylesheet" href="/styles/site.css" />
        <link rel="stylesheet" href="/styles/flexboxgrid.css" />
      </head>
      <body id="pageBody">
        <div id="container" className="container">
          <div id="header" />
          {children}
          <div id="pageBottom">&copy; Psychobilly Online 2008 / 2026</div>
        </div>
      </body>
    </html>
  );
}
