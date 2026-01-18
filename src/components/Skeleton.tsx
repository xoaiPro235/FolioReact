import React from 'react';

interface SkeletonProps {
    className?: string;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`animate-pulse bg-slate-200 dark:bg-slate-700/50 rounded-md ${className}`}
                />
            ))}
        </>
    );
};

export const KanbanSkeleton = () => {
    return (
        <div className="flex h-full w-full gap-6 overflow-x-auto pb-4 px-2">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col h-full min-w-[350px] flex-1">
                    <Skeleton className="h-12 w-full mb-4 rounded-xl" />
                    <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl p-3 space-y-3 border border-dashed border-slate-200 dark:border-slate-800">
                        <Skeleton className="h-[140px] w-full rounded-xl" count={3} />
                    </div>
                </div>
            ))}
        </div>
    );
};
