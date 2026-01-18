import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TaskStatus, Priority, FileAttachment } from '../types';
import { ArrowUp, ArrowRight, ArrowDown, Circle, Clock, Loader2, CheckCircle2, ChevronDown, Paperclip, FileText, Download, Trash2, X } from 'lucide-react';

// ==========================================
// UNIFIED COLOR SYSTEM (Single Source of Truth)
// ==========================================

export const STATUS_CONFIG = {
    [TaskStatus.TODO]: {
        color: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        icon: Circle,
        label: 'To Do'
    },
    [TaskStatus.PENDING]: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        icon: Clock,
        label: 'Pending'
    },
    [TaskStatus.IN_PROGRESS]: {
        color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        icon: Loader2,
        label: 'In Progress'
    },
    [TaskStatus.DONE]: {
        color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        icon: CheckCircle2,
        label: 'Done'
    },
};

export const PRIORITY_CONFIG = {
    [Priority.HIGH]: {
        color: 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900',
        icon: ArrowUp
    },
    [Priority.MEDIUM]: {
        color: 'text-orange-700 bg-orange-50 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-900',
        icon: ArrowRight
    },
    [Priority.LOW]: {
        color: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900',
        icon: ArrowDown
    },
};

// ==========================================
// REUSABLE COMPONENTS
// ==========================================

interface SelectProps {
    value: string;
    onChange: (val: any) => void;
    readOnly?: boolean;
    className?: string;
    minimal?: boolean; // If true, only shows icon/color without background
    large?: boolean; // If true, uses larger padding/text (for Modal/Kanban)
}

// Portal Dropdown Logic
const PortalDropdown = ({ children, triggerRef, onClose }: any) => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const style = {
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        minWidth: rect.width
    };

    return createPortal(
        <>
            <div className="fixed inset-0 z-[9999] bg-transparent" onClick={onClose} />
            <div
                style={style}
                className="absolute z-[10000] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100"
            >
                {children}
            </div>
        </>,
        document.body
    );
};

export const StatusSelect: React.FC<SelectProps> = ({ value, onChange, readOnly, className = '', minimal, large = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);

    const current = STATUS_CONFIG[value as TaskStatus] || STATUS_CONFIG[TaskStatus.TODO];
    const Icon = current.icon;

    const sizeClasses = large ? 'px-4 py-2 text-sm' : 'px-2.5 py-1 text-xs';
    const iconSize = large ? 'w-4 h-4' : 'w-3.5 h-3.5';

    if (readOnly) {
        return (
            <span className={`inline-flex items-center gap-2 rounded-full font-semibold border ${current.color} ${sizeClasses} ${className}`}>
                <Icon className={iconSize} />
                {!minimal && current.label}
            </span>
        );
    }

    return (
        <>
            <button
                type="button" // QUAN TRỌNG: Ngăn chặn submit form
                ref={ref}
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`inline-flex items-center gap-2 rounded-full font-semibold border transition-all shadow-sm ${current.color} ${sizeClasses} ${className}`}
            >
                <Icon className={iconSize} />
                {!minimal && <span className="whitespace-nowrap">{current.label}</span>}
                <ChevronDown className={`${iconSize} opacity-50`} />
            </button>

            {isOpen && (
                <PortalDropdown triggerRef={ref} onClose={() => setIsOpen(false)}>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                        const StatusIcon = config.icon;
                        return (
                            <div
                                key={key}
                                onClick={(e) => { e.stopPropagation(); onChange(key); setIsOpen(false); }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
                            >
                                <StatusIcon className={`w-4 h-4 ${key === TaskStatus.DONE ? 'text-green-500' : key === TaskStatus.IN_PROGRESS ? 'text-blue-500' : 'text-slate-400'}`} />
                                {config.label}
                            </div>
                        );
                    })}
                </PortalDropdown>
            )}
        </>
    );
};

export const PrioritySelect: React.FC<SelectProps> = ({ value, onChange, readOnly, className = '', minimal, large = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);

    const current = PRIORITY_CONFIG[value as Priority] || PRIORITY_CONFIG[Priority.MEDIUM];
    const Icon = current.icon;

    const sizeClasses = large ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';
    const iconSize = large ? 'w-4 h-4' : 'w-3.5 h-3.5';

    if (readOnly) {
        return (
            <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold border ${current.color} ${sizeClasses} ${className}`}>
                <Icon className={iconSize} />
                {!minimal && value}
            </span>
        );
    }

    return (
        <>
            <button
                type="button" // QUAN TRỌNG: Ngăn chặn submit form
                ref={ref}
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`inline-flex items-center gap-1.5 rounded-md font-semibold border transition-all shadow-sm ${current.color} ${sizeClasses} ${className}`}
            >
                <Icon className={iconSize} />
                {!minimal && <span>{value}</span>}
            </button>

            {isOpen && (
                <PortalDropdown triggerRef={ref} onClose={() => setIsOpen(false)}>
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
                        const PriorityIcon = config.icon;
                        return (
                            <div
                                key={key}
                                onClick={(e) => { e.stopPropagation(); onChange(key); setIsOpen(false); }}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
                            >
                                <PriorityIcon className="w-4 h-4" />
                                {key}
                            </div>
                        );
                    })}
                </PortalDropdown>
            )}
        </>
    );
};

export const AttachmentList: React.FC<{ files?: FileAttachment[], onUpload?: (file: File) => void, onDelete?: (fileId: string) => void }> = ({ files = [], onUpload, onDelete }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && onUpload) {
            setIsUploading(true);
            try {
                await onUpload(e.target.files[0]);
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-slate-400" /> Attachments
            </h4>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg group hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center text-slate-500 dark:text-slate-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                            <p className="text-xs text-slate-400">{file.size} • {file.type}</p>
                        </div>
                        {onDelete && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}
                                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 z-10"
                                title="Remove File"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}

                {onUpload && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 transition-all h-[74px]"
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                        {isUploading ? 'Uploading...' : 'Upload File'}
                    </button>
                )}
            </div>
        </div>
    );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    if (!status) return null;
    const foundStatus = Object.keys(STATUS_CONFIG).find(k => status.includes(k));
    if (foundStatus) {
        const config = STATUS_CONFIG[foundStatus as TaskStatus];
        return (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border mx-1 uppercase tracking-wide ${config.color}`}>
                {config.label}
            </span>
        );
    }
    return <span className="font-semibold text-slate-700 dark:text-slate-300">"{status}"</span>;
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
    if (!priority) return null;

    // Tìm config dựa trên priority (đảm bảo uppercase để khớp key)
    const pKey = priority.toUpperCase();
    // @ts-ignore
    const config = PRIORITY_CONFIG[pKey] || PRIORITY_CONFIG['MEDIUM'];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border mx-1 uppercase tracking-wide ${config.color}`}>
            <Icon className="w-3 h-3" />
            {priority}
        </span>
    );
};

// ==========================================
// CONFIRM DIALOG COMPONENT
// ==========================================

export const ConfirmDialog: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
}> = ({ isOpen, onClose, onConfirm, title, description, confirmText = 'Delete', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto animate-in zoom-in-95 duration-200">
                    <h2 className="text-xl font-bold text-red-600 mb-2">{title}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                        {description}
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => { onConfirm(); onClose(); }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors shadow-lg shadow-red-500/30 text-sm"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};