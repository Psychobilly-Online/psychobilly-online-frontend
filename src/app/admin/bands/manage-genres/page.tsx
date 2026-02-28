'use client';

import AdminBandPageLayout from '@/components/admin/AdminBandPageLayout';
import ManageGenres from '@/components/admin/ManageGenres';

export default function ManageGenresPage() {
  return (
    <AdminBandPageLayout
      title="Manage Genres"
      description="Add, edit, or delete music genres"
      breadcrumbLabel="Manage Genres"
    >
      <ManageGenres />
    </AdminBandPageLayout>
  );
}
