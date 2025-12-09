
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../types';
import { User as UserIcon, Check, ChevronDown } from 'lucide-react';

interface UserSelectProps {
  users: User[];
  selectedUserId?: string;
  onChange: (userId: string) => void;
  readOnly?: boolean;
  className?: string;
}

export const UserSelect: React.FC<UserSelectProps> = ({ users, selectedUserId, onChange, readOnly, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLButtonElement>(null);

  const selectedUser = users.find(u => u.id === selectedUserId);

  if (readOnly) {
    return (
      <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md border border-transparent ${className}`}>
        {selectedUser ? (
          <>
            <img src={selectedUser.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
            <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{selectedUser.name}</span>
          </>
        ) : (
          <>
            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
               <UserIcon className="w-3 h-3" />
            </div>
            <span className="text-sm text-slate-400 italic">Unassigned</span>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        ref={containerRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`flex items-center justify-between w-full gap-2 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedUser ? (
            <img src={selectedUser.avatar} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 flex-shrink-0">
              <UserIcon className="w-3 h-3" />
            </div>
          )}
          <span className={`text-sm truncate ${selectedUser ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
            {selectedUser ? selectedUser.name : 'Unassigned'}
          </span>
        </div>
        <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
      </button>

      {isOpen && containerRef.current && createPortal(
        <>
           <div className="fixed inset-0 z-[9999]" onClick={() => setIsOpen(false)} />
           <div 
             style={{
                top: containerRef.current.getBoundingClientRect().bottom + window.scrollY + 4,
                left: containerRef.current.getBoundingClientRect().left + window.scrollX,
                minWidth: containerRef.current.getBoundingClientRect().width
             }}
             className="absolute z-[10000] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
           >
                <div 
                    className="px-2 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-sm text-slate-500"
                    onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false); }}
                >
                    <div className="w-5 h-5 rounded-full border border-dashed border-slate-300 flex items-center justify-center"><UserIcon className="w-3 h-3"/></div>
                    Unassigned
                    {selectedUserId === '' && <Check className="w-3 h-3 ml-auto text-blue-600" />}
                </div>
                {users.map(u => (
                    <div
                    key={u.id}
                    onClick={(e) => { e.stopPropagation(); onChange(u.id); setIsOpen(false); }}
                    className={`px-2 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-sm ${selectedUserId === u.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}
                    >
                    <img src={u.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <span className="truncate flex-1">{u.name}</span>
                    {selectedUserId === u.id && <Check className="w-3 h-3 flex-shrink-0" />}
                    </div>
                ))}
            </div>
        </>,
        document.body
      )}
    </>
  );
};
