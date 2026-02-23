import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { formatRelativeTime } from '../../utils/dateUtils';

interface WorkDescriptionSectionProps {
    description: string;
    createdAt: string;
    isEditing: boolean;
    onSave: (newDescription: string) => void;
    onCancelEdit: () => void;
}

const WorkDescriptionSection: React.FC<WorkDescriptionSectionProps> = ({
    description,
    createdAt,
    isEditing,
    onSave,
    onCancelEdit
}) => {
    const navigate = useNavigate();
    const [editValue, setEditValue] = useState(description);

    // Sync local state when entering edit mode
    React.useEffect(() => {
        if (isEditing) {
            setEditValue(description);
        }
    }, [isEditing, description]);

    const renderDescription = (text: string) => {
        if (!text) return null;
        return text.split(/(#[^\s#]+)/g).map((part, index) => {
            if (part.startsWith('#') && part.length > 1) {
                return (
                    <span
                        key={index}
                        className="text-[#009bcd] hover:underline cursor-pointer font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/?search=${encodeURIComponent(part)}`);
                        }}
                    >
                        {part}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };
    return (
        <div className="px-6 py-3 border-b border-[#E6E6E6] flex-shrink-0 text-left">
            {isEditing ? (
                <div className="space-y-3">
                    <textarea
                        className="w-full h-24 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-[#009bcd] focus:ring-1 focus:ring-[#009bcd]"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="輸入作品描述..."
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={onCancelEdit}
                            className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={() => onSave(editValue)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-[#009bcd] hover:bg-[#0089b5] rounded-md transition-colors flex items-center gap-1"
                        >
                            <Check size={12} />
                            儲存
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-sm text-[#191919] leading-relaxed text-left whitespace-pre-wrap">
                        {renderDescription(description)}
                    </p>
                    <p className="text-xs text-[#999999] mt-2 text-left">{formatRelativeTime(createdAt)}</p>
                </>
            )}
        </div>
    );
};

export default WorkDescriptionSection;
