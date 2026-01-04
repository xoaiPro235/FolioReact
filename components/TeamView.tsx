
import React, { useState } from 'react';
import { useStore } from '../store';
import { Role, User } from '../types';
import { searchUsers } from '../services/api';
import { Search, Mail, UserPlus, X, Trash2 } from 'lucide-react';

export const TeamView: React.FC = () => {
    const { currentProject, users, changeMemberRole, inviteUserToProject, removeMemberFromProject, getUserRole } = useStore();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ userId: string; userName: string } | null>(null);

    // Invite Logic
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role>(Role.VIEWER);

    const isOwner = getUserRole() === Role.OWNER;

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1) {
            const results = await searchUsers(query);
            // Filter out existing members
            setSearchResults(results.filter(u => !currentProject?.members.find(m => m.userId === u.id)));
        } else {
            setSearchResults([]);
        }
    };

    const handleConfirmDelete = () => {
        if (confirmDelete) {
            removeMemberFromProject(confirmDelete.userId);
            setConfirmDelete(null);
        }
    };

    const handleInvite = () => {
        if (selectedUser) {
            inviteUserToProject(selectedUser, selectedRole);
            setIsInviteModalOpen(false);
            setSearchQuery('');
            setSelectedUser(null);
        }
    };

    if (!currentProject) return null;

    return (
        <>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-w-5xl mx-auto shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white text-lg">Project Members</h3>
                        <p className="text-slate-500 text-sm">Manage access and roles.</p>
                    </div>
                    {isOwner && (
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                            <UserPlus className="w-4 h-4" /> Invite Member
                        </button>
                    )}
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentProject.members.map(member => {
                        const user = users.find(u => u.id === member.userId);
                        if (!user) return null;
                        return (
                            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-200" alt="" />
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-slate-900 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                </div>

                                <div>
                                    {isOwner && member.userId !== currentProject.ownerId ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={member.role}
                                                onChange={(e) => changeMemberRole(member.userId, e.target.value as Role)}
                                                className="text-sm border-slate-200 dark:border-slate-700 rounded-md py-1 px-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-blue-500"
                                            >
                                                <option value={Role.MEMBER}>Member</option>
                                                <option value={Role.VIEWER}>Viewer</option>
                                            </select>
                                            <button
                                                onClick={() => {
                                                    const user = users.find(u => u.id === member.userId);
                                                    if (user) {
                                                        setConfirmDelete({ userId: member.userId, userName: user.name });
                                                    }
                                                }}
                                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Remove member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                            {member.role}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg dark:text-white">Invite to {currentProject.name}</h3>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search User</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="Name or email..."
                                        value={searchQuery}
                                        onChange={handleSearch}
                                    />
                                </div>
                                {/* Results */}
                                {searchQuery && (
                                    <div className="mt-2 border border-slate-200 dark:border-slate-700 rounded-lg max-h-40 overflow-y-auto">
                                        {searchResults.length > 0 ? searchResults.map(u => (
                                            <div
                                                key={u.id}
                                                onClick={() => setSelectedUser(u)}
                                                className={`p-2 flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedUser?.id === u.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                            >
                                                <img src={u.avatar} className="w-6 h-6 rounded-full" alt="" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-slate-900 dark:text-slate-200">{u.name}</p>
                                                    <p className="text-xs text-slate-400">{u.email}</p>
                                                </div>
                                            </div>
                                        )) : <p className="p-2 text-sm text-slate-500 text-center">No users found.</p>}
                                    </div>
                                )}
                            </div>

                            {selectedUser && (
                                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 mb-3">
                                        <img src={selectedUser.avatar} className="w-8 h-8 rounded-full" alt="" />
                                        <span className="font-medium text-slate-900 dark:text-white">{selectedUser.name}</span>
                                    </div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Role</label>
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value as Role)}
                                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    >
                                        <option value={Role.MEMBER}>Member (Can Edit)</option>
                                        <option value={Role.VIEWER}>Viewer (Read Only)</option>
                                    </select>
                                </div>
                            )}

                            <button
                                onClick={handleInvite}
                                disabled={!selectedUser}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold py-2 rounded-lg transition-colors"
                            >
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div className="p-6">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Remove Member?</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Are you sure you want to remove <span className="font-semibold">{confirmDelete.userName}</span> from this project? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
