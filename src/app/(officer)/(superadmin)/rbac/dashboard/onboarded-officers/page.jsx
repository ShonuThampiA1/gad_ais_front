'use client';

import SuperadminOfficerList from '@/app/components/superadmin-officer-list';

export default function SuperAdminOnboardedOfficersPage() {
  return (
    <SuperadminOfficerList
      title="Onboarded Officers List"
      endpoint="/admin/officers"
      exportFilePrefix="superadmin-onboarded-officers"
    />
  );
}
