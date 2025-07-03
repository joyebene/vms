'use client';
import { useEffect, useState } from 'react';
import { adminAPI, User } from '@/lib/api';


type Group = {
    _id?: string;
    name: string;
    description?: string;
};

export default function GroupMapper() {
    const [users, setUsers] = useState<User[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

    // Load users and groups on mount
    useEffect(() => {
        const load = async () => {
            try {
                const [usersData, groupsData] = await Promise.all([
                    adminAPI.getUsers(),
                    adminAPI.fetchGroups(),
                ]);
                setUsers(usersData);
                setGroups(groupsData);
            } catch (err: any) {
                console.error('Error loading data:', err.message);
            }
        };

        load();
    }, []);

    // Assign groups to selected user
    const handleAssign = async () => {
        try {
            await adminAPI.assignGroupsToUser(selectedUser, selectedGroups);
            alert('Groups assigned!');
            setSelectedUser('');
            setSelectedGroups([]);
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Group Mapper</h1>

            <label htmlFor='user' className="block mb-2">Select User:</label>
            <select
                id='user'
                className="border p-2 rounded w-full mb-4"

                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
            >
                <option value="">-- Choose a User --</option>
                {users.map((u) => (
                    <option key={u._id} value={u._id}>
                        {u.firstName} {u.lastName}
                    </option>
                ))}
            </select>

            <label className="block mb-2">Assign Groups:</label>
            <div className="mb-4">
                {groups.map((group) => (
                    <label key={group._id} className="block">
                        <input
                            type="checkbox"
                            value={group.name}
                            checked={selectedGroups.includes(group.name)}
                            onChange={(e) => {
                                const value = group.name;
                                setSelectedGroups((prev) =>
                                    e.target.checked
                                        ? [...prev, value]
                                        : prev.filter((g) => g !== value)
                                );
                            }}
                        />
                        <span className="ml-2">{group.name}</span>
                    </label>
                ))}
            </div>

            <button
                onClick={handleAssign}
                disabled={!selectedUser || selectedGroups.length === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
                Assign
            </button>
        </div>
    );
}
