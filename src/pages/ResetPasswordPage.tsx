import React, { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Layout, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPasswordPage: React.FC = () => {
    const { updatePassword, isLoading } = useStore();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            await updatePassword(newPassword);
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/auth');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update password.');
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md glass-effect dark:bg-slate-900/60 rounded-[2.5rem] shadow-2xl p-10 text-center border border-white dark:border-slate-800/80"
                >
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Success!</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                        Your password has been updated successfully. Redirecting you to sign in...
                    </p>
                    <button
                        onClick={() => navigate('/auth')}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2"
                    >
                        Go to Sign In <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl mb-4">
                        <Layout className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Folio</h2>
                </div>

                <div className="glass-effect dark:bg-slate-900/60 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white dark:border-slate-800/80 backdrop-blur-3xl p-8 sm:p-10">
                    <div className="mb-10 text-center">
                        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                            Set New Password
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Please enter your new secure password below
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-sm text-red-600 dark:text-red-400 font-medium flex gap-3 items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-5 px-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 group"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Update Password
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
