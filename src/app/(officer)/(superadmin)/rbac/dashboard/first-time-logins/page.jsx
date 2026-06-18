'use client';

import SuperadminOfficerList from '@/app/components/superadmin-officer-list';

export default function SuperAdminFirstTimeLoginsPage() {
  return (
    <SuperadminOfficerList
      title="Login Activated Officers"
      endpoint="/admin/first-login-completed"
      exportFilePrefix="superadmin-first-login-completed"
    />
  );
}
