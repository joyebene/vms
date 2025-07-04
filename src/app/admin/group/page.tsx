'use client';

import { useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import GroupCreator from '@/components/GroupCreate';
import GroupMapper from '@/components/GroupMapper';
import GroupListWithMembers from '@/components/GroupListWithMemders';

export default function AdminGroupPage() {
      const { token } = useAuth();

  const loadGroups = async () => {
    if (!token) return;
    try {
      await adminAPI.fetchGroups(token);
    } catch (err: any) {
      console.error('Failed to load groups:', err.message);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [token]);

  return (
    <div>
      <h1 className="text-lg sm:text-2xl lg:text-3xl text-gray-900 font-bold">Group Management</h1>
        <GroupCreator refreshGroups={loadGroups} />
      <hr />
      <GroupMapper />
      <hr />
      <GroupListWithMembers />
    </div>
  );
}
