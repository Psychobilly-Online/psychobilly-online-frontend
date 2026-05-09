'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';
import CreateEventWizard from '@/components/events/CreateEventWizard/CreateEventWizard';

export default function CreateEventPage() {
  const { isAuthenticated, isLoading } = useAuthorization();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div style={{ padding: 32 }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Events', href: '/events' },
          { label: 'Add Event', href: '/events/create' },
        ]}
      />
      <PageHeader title="Add Event" description="Submit a new psychobilly event to the calendar" />
      <CreateEventWizard />
    </div>
  );
}
