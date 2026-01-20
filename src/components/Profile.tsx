import React, { useState } from 'react';
import { useStore } from '../store';
import { ArrowLeft, Save, Trash2, AlertTriangle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
    const { currentUser, updateProfile, deleteAccount, goToWorkspace } = useStore();
    const navigate = useNavigate();

    const [name, setName] = useState(currentUser?.name || '');
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [avatar, setAvatar] = useState(currentUser?.avatar || '');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    if (!currentUser) return null;

    const handleSave = () => {
        updateProfile({ name, bio, avatarUrl: avatar });
    };

    const handleDelete = () => {
        if (deleteConfirmation === currentUser.email) {
            deleteAccount();
        }
    };

    return (
        <div className="absolute inset-0 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 pb-32 sm:pb-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => { goToWorkspace(); navigate('/workspace'); }}
                    className="flex items-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Workspace</span>
                </button>

                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">User Profile</h1>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <div className="relative group">
                                <img src={avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 object-cover" />
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-xs font-medium">Change</span>
                                </div>
                            </div>
                            <div className="flex-1 w-full space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Avatar URL</label>
                                    <input
                                        type="text"
                                        value={avatar}
                                        onChange={e => setAvatar(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30">
                                        <Save className="w-4 h-4" /> Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-6 sm:p-8 bg-red-50 dark:bg-red-900/10">
                        <h3 className="text-red-600 dark:text-red-400 font-bold mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Danger Zone
                        </h3>
                        <p className="text-sm text-red-600/80 dark:text-red-400/70 mb-4 leading-relaxed">
                            Deleting your account is irreversible. All your data, including projects and tasks, will be permanently removed.
                        </p>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="w-full sm:w-auto border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Trash2 className="w-4 h-4" /> Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Strict Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-red-600 mb-2">Delete Account?</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                            Please type your email <span className="font-mono font-bold select-all">{currentUser.email}</span> to confirm.
                        </p>
                        <input
                            type="text"
                            className="w-full p-2 border border-slate-300 rounded-lg mb-6 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            placeholder={currentUser.email}
                            value={deleteConfirmation}
                            onChange={e => setDeleteConfirmation(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteConfirmation !== currentUser.email}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};