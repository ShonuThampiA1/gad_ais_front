'use client';

import ReminderHistory from '@/app/components/reminder-history';

export default function ReminderHistoryPage() {
  return (
    <ReminderHistory
      title="Reminder History"
      endpoint="/admin/reminder-history"
      exportFilePrefix="superadmin-reminder-history"
    />
  );
}