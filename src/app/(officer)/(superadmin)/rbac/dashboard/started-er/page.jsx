'use client';

import SuperadminOfficerList from '@/app/components/superadmin-officer-list';

export default function SuperAdminStartedERPage() {
  return (
    <SuperadminOfficerList
      title="Profile Updation In Progress"
      endpoint="/admin/profile-saving-started"
      exportFilePrefix="superadmin-started-er-profiles"
    />
  );
}
