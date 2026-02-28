'use client';

import { TopBar } from './TopBar';
import { usePathname } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import { SearchProvider } from '@/contexts/SearchContext';
import { MetadataProvider } from '@/contexts/MetadataContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import styles from './ClientLayout.module.css';

function TopBarWrapper() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Determine context based on pathname
  const getSearchContext = (): 'events' | 'news' | 'default' => {
    if (pathname?.startsWith('/events')) return 'events';
    if (pathname?.startsWith('/news')) return 'news';
    return 'default';
  };

  const isHomePage = pathname === '/';
  const isAboutPage = pathname === '/about';

  // Hide TopBar on homepage/about ONLY if user is not authenticated
  const shouldHide = (isHomePage || isAboutPage) && !isAuthenticated;

  return <TopBar searchContext={getSearchContext()} hide={shouldHide} />;
}

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  // NOTE: Broad Suspense boundary is intentional architectural decision.
  // SearchProvider uses useSearchParams() which requires Suspense in React 19.
  // We accept showing full-page loading for simplicity rather than complex granular boundaries.
  // This only triggers during initial SSR/hydration, not during client-side navigation.
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <AuthProvider>
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
      </AuthProvider>
    </Suspense>
  );
}
