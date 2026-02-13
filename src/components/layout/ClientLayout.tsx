'use client';

import { TopBar } from './TopBar';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { SearchProvider, useSearchContext } from '@/contexts/SearchContext';

function TopBarWrapper() {
  const pathname = usePathname();
  const { filters, performSearch } = useSearchContext();

  // Determine context based on pathname
  const getSearchContext = (): 'events' | 'news' | 'default' => {
    if (pathname?.startsWith('/events')) return 'events';
    if (pathname?.startsWith('/news')) return 'news';
    return 'default';
  };

  const isEventsPage = pathname?.startsWith('/events');
  const isHomePage = pathname === '/';

  return (
    <TopBar
      searchContext={getSearchContext()}
      onSearch={isEventsPage ? performSearch : undefined}
      searchValue={isEventsPage ? filters.search || '' : ''}
      hide={isHomePage}
    />
  );
}

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SearchProvider>
      <TopBarWrapper />
      <div id="container" className="container">
        <div id="header" />
        {children}
        <div id="pageBottom">&copy; Psychobilly Online 2008 / 2026</div>
      </div>
    </SearchProvider>
  );
}
