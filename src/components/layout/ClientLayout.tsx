'use client';

import { TopBar } from './TopBar';
import { usePathname } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import { SearchProvider } from '@/contexts/SearchContext';
import { MetadataProvider } from '@/contexts/MetadataContext';
import styles from './ClientLayout.module.css';

function TopBarWrapper() {
  const pathname = usePathname();

  // Determine context based on pathname
  const getSearchContext = (): 'events' | 'news' | 'default' => {
    if (pathname?.startsWith('/events')) return 'events';
    if (pathname?.startsWith('/news')) return 'news';
    return 'default';
  };

  const isHomePage = pathname === '/';
  const isAboutPage = pathname === '/about';

  return <TopBar searchContext={getSearchContext()} hide={isHomePage || isAboutPage} />;
}

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <MetadataProvider>
        <SearchProvider>
          <TopBarWrapper />
          <div id="container" className={styles.container}>
            <div id="header" className={styles.header} />
            {children}
            <div id="pageBottom" className={styles.pageBottom}>
              &copy; Psychobilly Online 2008 / 2026
            </div>
          </div>
        </SearchProvider>
      </MetadataProvider>
    </Suspense>
  );
}
