'use client';

import SuperadminOfficerList from '@/app/components/superadmin-officer-list';

export default function SuperAdminLoginPendingsPage() {
  return (
    <SuperadminOfficerList
      title="Login Pending Officers"
      endpoint="/admin/first-login-pending"
      exportFilePrefix="superadmin-login-pending-officers"
      editRoute="/as-II/officers-edit"
    />
  );
}
