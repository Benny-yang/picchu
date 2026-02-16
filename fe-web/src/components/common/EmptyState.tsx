import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
    message?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    message = "暫無資料",
    description,
    actionLabel,
    onAction,
    className = ""
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
            <div className="bg-gray-50 p-4 rounded-full mb-4">
                <PackageOpen size={48} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-grey-black mb-2">{message}</h3>
            {description && (
                <p className="text-grey-1 text-sm max-w-sm mb-6 leading-relaxed">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2 bg-secondary-blue text-white rounded-full font-bold text-sm hover:bg-secondary-blue-dark transition-colors shadow-sm cursor-pointer"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
