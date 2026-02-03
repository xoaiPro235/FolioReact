import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';

export const ToastOverlay: React.FC = () => {
    const { toasts, removeToast } = useStore();

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
                        className="pointer-events-auto"
                    >
                        <div className={`
                            min-w-[280px] max-w-[400px] bg-white dark:bg-slate-900 
                            border border-slate-200 dark:border-slate-800 
                            shadow-xl rounded-xl p-4 flex items-center gap-3
                            transition-all duration-300
                        `}>
                            <div className={`
                                flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                                ${toast.type === 'SUCCESS' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                                    toast.type === 'ERROR' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                                        toast.type === 'WARNING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                                            'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}
                            `}>
                                {toast.type === 'SUCCESS' && <CheckCircle2 size={20} />}
                                {toast.type === 'ERROR' && <AlertCircle size={20} />}
                                {toast.type === 'WARNING' && <AlertTriangle size={20} />}
                                {toast.type === 'INFO' && <Info size={20} />}
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-tight">
                                    {toast.message}
                                </p>
                            </div>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="flex-shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
