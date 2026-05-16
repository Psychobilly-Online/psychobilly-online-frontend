'use client';

import Link from 'next/link';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';

export default function EventPendingPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Events', href: '/events' },
        ]}
      />
      <PageHeader
        title="Event Submitted!"
        description="Your event has been submitted and is awaiting approval."
      />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>
        <p>
          Thank you for your contribution. A moderator will review your event shortly. Once
          approved, it will appear in the event calendar.
        </p>
        <p>
          <Link href="/events">Back to Events</Link>
        </p>
      </div>
    </div>
  );
}
